import paths from './paths';

const sitemap = [
  {
    id: 'agrm',
    subheader: 'AgRM',
    key: 'agrm',
    icon: 'material-symbols:agriculture-outline-rounded',
    items: [
      {
        name: 'Dashboard',
        key: 'crm_dashboard',
        path: paths.crm,
        pathName: 'crm',
        icon: 'material-symbols:dashboard-outline-rounded',
        active: true,
      },
      {
        name: 'Contacts',
        key: 'contacts',
        path: paths.contacts,
        pathName: 'contacts',
        icon: 'material-symbols:contacts-outline-rounded',
        active: true,
      },
      {
        name: 'Leads',
        key: 'leads',
        path: paths.leads,
        pathName: 'leads',
        icon: 'material-symbols:filter-alt-outline-rounded',
        active: true,
      },
      {
        name: 'Deals',
        key: 'deals',
        path: paths.deals,
        pathName: 'deals',
        icon: 'material-symbols:handshake-outline-rounded',
        active: true,
      },
      {
        name: 'Equipment',
        key: 'equipment',
        path: paths.equipment,
        pathName: 'equipment',
        icon: 'material-symbols:agriculture-outline-rounded',
        active: true,
      },
      {
        name: 'Map',
        key: 'crm_map',
        path: paths.crmMap,
        pathName: 'map',
        icon: 'material-symbols:map-outline-rounded',
        active: true,
      },
      {
        name: 'Search',
        key: 'crm_search',
        path: paths.crmSearch,
        pathName: 'search',
        icon: 'material-symbols:search-rounded',
        active: true,
      },
      {
        name: 'Import CSV',
        key: 'crm_import',
        path: paths.crmImport,
        pathName: 'import',
        icon: 'material-symbols:upload-file-outline-rounded',
        active: true,
      },
      {
        name: 'Add Contact / Lead',
        key: 'add_contact',
        path: paths.addContact,
        pathName: 'add-contact',
        icon: 'material-symbols:person-add-outline-rounded',
        active: true,
      },
    ],
  },
  {
    id: 'account',
    subheader: 'Account',
    key: 'account',
    icon: 'material-symbols:manage-accounts-outline-rounded',
    items: [
      {
        name: 'Profile',
        key: 'profile',
        path: paths.account,
        pathName: 'account',
        icon: 'material-symbols:account-circle-outline-rounded',
        active: true,
      },
    ],
  },
];

export default sitemap;
