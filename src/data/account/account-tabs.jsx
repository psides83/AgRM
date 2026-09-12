import BusinessCardManager from 'components/sections/crm/business-card';
import PersonalInfoTabPanel from 'components/sections/account/personal-info/PersonalInfoTabPanel';
import PreferencesTabPanel from 'components/sections/account/preferences/PreferencesTabPanel';

export const accountTabs = [
  {
    id: 1,
    label: 'Personal Information',
    title: 'Personal Info',
    value: 'personal_information',
    icon: 'material-symbols:person-outline',
    panelIcon: 'material-symbols:person-outline',
    tabPanel: <PersonalInfoTabPanel />,
  },
  {
    id: 2,
    label: 'Preferences',
    title: 'Preferences',
    value: 'preferences',
    icon: 'material-symbols:tune-rounded',
    panelIcon: 'material-symbols:tune-rounded',
    tabPanel: <PreferencesTabPanel />,
  },
  {
    id: 'business_card',
    label: 'Business Card',
    title: 'Digital Business Card',
    value: 'business_card',
    icon: 'material-symbols:badge-outline-rounded',
    panelIcon: 'material-symbols:badge-outline-rounded',
    tabPanel: <BusinessCardManager embedded />,
  },
];
