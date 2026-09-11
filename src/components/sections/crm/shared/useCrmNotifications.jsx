'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import paths from 'routes/paths';
import { createClient } from 'lib/supabase/client';

const actionRequiredEquipmentStatuses = [
  'needs_info',
  'setup_required',
  'transfer_required',
  'pending_field_readiness',
  'pending_delivery',
];

const systemUser = {
  id: 'agrm',
  name: 'AgRM',
  avatar: null,
};

export function useCrmNotifications() {
  const supabase = useMemo(() => createClient(), []);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const now = new Date();
    const startOfToday = dayjs().startOf('day').toISOString();
    const today = dayjs().format('YYYY-MM-DD');

    const [tasksResult, activitiesResult, dealsResult, equipmentResult] =
      await Promise.all([
        supabase
          .from('tasks')
          .select(
            `
            id,
            title,
            body,
            due_at,
            created_at,
            contacts(id, first_name, last_name),
            companies(id, name),
            leads(id, status, source, contacts(id, first_name, last_name), companies(id, name))
          `,
          )
          .is('completed_at', null)
          .lt('due_at', now.toISOString())
          .order('due_at', { ascending: true }),
        supabase
          .from('activities')
          .select(
            `
            id,
            type,
            subject,
            body,
            due_at,
            created_at,
            contacts(id, first_name, last_name),
            companies(id, name),
            leads(id, status, source, contacts(id, first_name, last_name), companies(id, name)),
            deals(id, name, contacts(id, first_name, last_name), companies(id, name))
          `,
          )
          .is('completed_at', null)
          .lt('due_at', now.toISOString())
          .order('due_at', { ascending: true }),
        supabase
          .from('deals')
          .select(
            `
            id,
            name,
            stage,
            amount,
            expected_close_date,
            updated_at,
            contacts(id, first_name, last_name),
            companies(id, name)
          `,
          )
          .is('closed_at', null)
          .neq('stage', 'closed')
          .lt('expected_close_date', today)
          .order('expected_close_date', { ascending: true }),
        supabase
          .from('equipment_interests')
          .select(
            `
            id,
            category,
            make,
            model,
            model_year,
            status,
            updated_at,
            contacts(id, first_name, last_name),
            leads(id, status, source, contacts(id, first_name, last_name), companies(id, name)),
            deals(id, name, contacts(id, first_name, last_name), companies(id, name))
          `,
          )
          .in('status', actionRequiredEquipmentStatuses)
          .lt('updated_at', startOfToday)
          .order('updated_at', { ascending: true }),
      ]);

    const nextNotifications = [
      ...(tasksResult.data || []).map(taskNotification),
      ...(activitiesResult.data || []).map(activityNotification),
      ...(dealsResult.data || []).map(dealNotification),
      ...(equipmentResult.data || []).map(equipmentNotification),
    ]
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(a.sortAt || a.createdAt || 0) -
          new Date(b.sortAt || b.createdAt || 0),
      );

    setNotifications(nextNotifications);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('agrm-overdue-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        fetchNotifications,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        fetchNotifications,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deals' },
        fetchNotifications,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'equipment_interests' },
        fetchNotifications,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, supabase]);

  return { notifications, isLoading, refresh: fetchNotifications };
}

export function groupNotificationsByDate(notifications) {
  return notifications.reduce(
    (acc, notification) => {
      if (dayjs().diff(dayjs(notification.createdAt), 'days') === 0) {
        acc.today.push(notification);
      } else {
        acc.older.push(notification);
      }

      return acc;
    },
    { today: [], older: [] },
  );
}

function taskNotification(task) {
  return {
    id: `task-${task.id}`,
    type: 'crm_task',
    detail: notificationDetail({
      title: task.title,
      message: `task is past due for ${recordLabel(task)}.`,
    }),
    readAt: null,
    user: [systemUser],
    href: recordHref(task),
    createdAt: task.due_at,
    sortAt: task.due_at,
  };
}

function activityNotification(activity) {
  return {
    id: `activity-${activity.id}`,
    type: 'crm_activity',
    detail: notificationDetail({
      title: activity.subject || formatEnum(activity.type),
      message: `${formatEnum(activity.type)} is past due for ${recordLabel(activity)}.`,
    }),
    readAt: null,
    user: [systemUser],
    href: recordHref(activity),
    createdAt: activity.due_at,
    sortAt: activity.due_at,
  };
}

function dealNotification(deal) {
  return {
    id: `deal-${deal.id}`,
    type: 'crm_deal',
    detail: notificationDetail({
      title: deal.name,
      message: `deal expected close date passed for ${recordLabel(deal)}.`,
    }),
    readAt: null,
    user: [systemUser],
    href: paths.dealDetails(deal.id),
    createdAt: deal.expected_close_date,
    sortAt: deal.expected_close_date,
  };
}

function equipmentNotification(item) {
  return {
    id: `equipment-${item.id}`,
    type: 'crm_equipment',
    detail: notificationDetail({
      title: equipmentName(item),
      message: `equipment interest still needs action: ${formatEnum(item.status)}.`,
    }),
    readAt: null,
    user: [systemUser],
    href: recordHref(item) || paths.equipment,
    createdAt: item.updated_at,
    sortAt: item.updated_at,
  };
}

function notificationDetail({ title, message }) {
  return (
    <>
      <Typography
        variant="body2"
        component="span"
        sx={{ fontWeight: 'bold', color: 'text.primary' }}
      >
        {title}
      </Typography>{' '}
      {message}
    </>
  );
}

function recordHref(record) {
  if (record.deals?.id) return paths.dealDetails(record.deals.id);
  if (record.leads?.id) return paths.leadDetails(record.leads.id);
  if (record.contacts?.id) return paths.contactDetails(record.contacts.id);
  if (record.companies?.id) return paths.companyDetails(record.companies.id);
  return paths.crmRoot;
}

function recordLabel(record) {
  return (
    record.deals?.name ||
    contactName(record.contacts) ||
    record.companies?.name ||
    record.leads?.source ||
    contactName(record.leads?.contacts) ||
    record.leads?.companies?.name ||
    record.name ||
    'CRM record'
  );
}

function equipmentName(item) {
  return (
    [item.model_year, item.make, item.model].filter(Boolean).join(' ') ||
    formatEnum(item.category)
  );
}

function contactName(contact) {
  return [contact?.first_name, contact?.last_name].filter(Boolean).join(' ');
}

function formatEnum(value) {
  if (!value) return 'Item';
  if (value === 'fit_confirmed') return 'Equipment Fit Confirmed';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
