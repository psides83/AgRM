export const dealStages = [
  'needs_discovery',
  'fit_confirmed',
  'options_presented',
  'agreement_reached',
  'equipment_secured',
  'setup_in_progress',
  'pending_field_readiness',
  'field_ready_confirmed',
  'pending_delivery',
  'delivered',
  'closed',
];

export const equipmentStatuses = [
  'not_started',
  'needs_info',
  'fit_confirmed',
  'quoted',
  'on_order',
  'transfer_required',
  'transfer_in_progress',
  'in_stock',
  'setup_required',
  'setup_in_progress',
  'ready',
  'pending_field_readiness',
  'field_ready_confirmed',
  'pending_delivery',
  'delivered',
  'unavailable',
  'canceled',
];

export const activityTypes = [
  'call',
  'text',
  'email',
  'visit',
  'demo',
  'quote',
  'note',
  'meeting',
  'site_visit',
  'other',
];
export const activityDirections = ['outbound', 'inbound', 'internal'];

export const leadStatuses = [
  'new',
  'working',
  'qualified',
  'unqualified',
  'converted',
];

export const leadStatusLabels = {
  new: 'Not Contacted',
  working: 'Working',
  qualified: 'Contacted',
  unqualified: 'Not a Fit',
  converted: 'Reliable Customer',
};

export function formatLeadStatus(status) {
  return leadStatusLabels[status] || formatEnum(status);
}

export function formatEnum(value) {
  if (!value) return '';
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
