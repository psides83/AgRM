alter type public.lead_status add value if not exists 'not_contacted';
alter type public.lead_status add value if not exists 'attempted';
alter type public.lead_status add value if not exists 'contacted';
alter type public.lead_status add value if not exists 'relationship_started';
alter type public.lead_status add value if not exists 'bad_number';
alter type public.lead_status add value if not exists 'do_not_contact';
alter type public.lead_status add value if not exists 'not_a_fit';
