import { useCallback, useEffect, useState } from 'react';

export const methods = ['Visit', 'Call', 'Email', 'Other'];
export const targetKey = (target) =>
  target.lead_id ? `lead-${target.lead_id}` :
  target.contact_id ? `contact-${target.contact_id}` : `company-${target.company_id}`;

export function localDay() {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, '0')).join('-');
}

export function useGameplanDays(supabase, enabled = true) {
  const [result, setResult] = useState(null);
  const reload = useCallback(async () => {
    const { data, error } = await supabase.from('crm_gameplans').select('plan_date').order('plan_date', { ascending: false });
    setResult({ days: (data || []).map(({ plan_date }) => plan_date), error: error?.message });
  }, [supabase]);
  useEffect(() => {
    if (enabled) reload();
  }, [enabled, reload]);
  return { days: result?.days || emptyDays, error: result?.error, loading: !result, reload };
}

const emptyDays = [];

export async function addTarget(supabase, day, fields) {
  const table = () => supabase.from('crm_gameplan_targets');
  const { data, error } = await table().select('position').eq('plan_date', day)
    .order('position', { ascending: false }).limit(1);
  if (error) return { error };
  return table().insert({ ...fields, plan_date: day, position: (data[0]?.position ?? -1) + 1 });
}

export function createGameplan(supabase, day) {
  return supabase.from('crm_gameplans').upsert({ plan_date: day }, { ignoreDuplicates: true });
}
