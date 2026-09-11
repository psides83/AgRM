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

export const equipmentCategories = [
  'tractor',
  'compact_tractor',
  'track_tractor',
  'four_wheel_drive_tractor',
  'combine',
  'combine_header',
  'planter',
  'air_seeder',
  'drill',
  'sprayer',
  'fertilizer_applicator',
  'spreader',
  'tillage',
  'hay',
  'hay_baler',
  'mower_conditioner',
  'disc_mower',
  'rake',
  'forage_harvester',
  'utility_vehicle',
  'mower',
  'loader',
  'skid_steer',
  'compact_track_loader',
  'wheel_loader',
  'excavator',
  'compact_excavator',
  'backhoe',
  'dozer',
  'motor_grader',
  'scraper',
  'telehandler',
  'truck',
  'trailer',
  'forklift',
  'forestry',
  'cotton_harvester',
  'sugar_harvester',
  'vineyard_orchard',
  'attachment',
  'other',
];

export const equipmentCategoryIcons = {
  tractor: '/deere-icons/tractor-row-crop.svg',
  compact_tractor: '/deere-icons/tractor-compact-cab.svg',
  track_tractor: '/deere-icons/tractor-track.svg',
  four_wheel_drive_tractor: '/deere-icons/tractor-four-wheel-drive.svg',
  combine: '/deere-icons/combine.svg',
  combine_header: '/deere-icons/combine-header-corn.svg',
  planter: '/deere-icons/planting-planter.svg',
  air_seeder: '/deere-icons/planting-air-seeder.svg',
  drill: '/deere-icons/drill.svg',
  sprayer: '/deere-icons/sprayer.svg',
  fertilizer_applicator: '/deere-icons/nutrient-application-nutrient-applicator.svg',
  spreader: '/deere-icons/nutrient-application-spreader.svg',
  tillage: '/deere-icons/tillage.svg',
  hay_baler: '/deere-icons/hay-baler.svg',
  hay: '/deere-icons/hay-baler.svg',
  mower_conditioner: '/deere-icons/hay-mower-conditioner.svg',
  disc_mower: '/deere-icons/hay-disc-mowers.svg',
  rake: '/deere-icons/hay-wheel-rake.svg',
  forage_harvester: '/deere-icons/hay-self-propelled-forage-harvester.svg',
  utility_vehicle: '/deere-icons/xuv-gator.svg',
  mower: '/deere-icons/zero-turn-riding-mower.svg',
  loader: '/deere-icons/loader.svg',
  skid_steer: '/deere-icons/skid-steer.svg',
  compact_track_loader: '/deere-icons/compact-track-loader.svg',
  wheel_loader: '/deere-icons/wheel-loader.svg',
  excavator: '/deere-icons/excavator.svg',
  compact_excavator: '/deere-icons/compact-excavator.svg',
  backhoe: '/deere-icons/icon-equipment-loader.svg',
  dozer: '/deere-icons/crawler.svg',
  motor_grader: '/deere-icons/grader.svg',
  scraper: '/deere-icons/scraper.svg',
  telehandler: '/deere-icons/telehandler.svg',
  truck: '/deere-icons/truck.svg',
  trailer: '/deere-icons/generic-semi-trailer.svg',
  forklift: '/deere-icons/generic-forklift.svg',
  forestry: '/deere-icons/harvester.svg',
  cotton_harvester: '/deere-icons/cotton-picker-and-stripper.svg',
  sugar_harvester: '/deere-icons/sugar-harvester-wheeled.svg',
  vineyard_orchard: '/deere-icons/hvc-vine-harvester-grapes.svg',
  attachment: '/deere-icons/3-point-rotary-cutter.svg',
  other: '/deere-icons/generic-equipment.svg',
};

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
