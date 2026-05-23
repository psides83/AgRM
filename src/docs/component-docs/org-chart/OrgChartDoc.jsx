'use client';
import { initialConfig } from 'config';
import { folderBaseLink } from 'lib/constants';
import { OrganizationalChart } from 'components/base/OrganizationalChart';
import DashboardMenu from 'components/common/DashboardMenu';
import DocCard from 'components/docs/DocCard';
import DocPageLayout from 'components/docs/DocPageLayout';
import DocSection from 'components/docs/DocSection';
import {
  advancedOrgChartCode,
  basicOrgChartCode,
  standardOrgChartCode,
} from './orgChartLiveExamples';

const orgChartLiveScope = {
  OrganizationalChart,
  DashboardMenu,
  initialConfig,
};
const OrgChartDoc = () => {
  return (
    <DocPageLayout
      pageHeaderProps={{
        title: 'Organizational Chart',
        description: '',
        breadcrumbs: [
          {
            label: 'Docs',
            url: '#!',
          },
          {
            label: 'Organizational Chart',
          },
        ],
        docLink:
          'https://daniel-hauser.github.io/react-organizational-chart/?path=/story/example-tree--basic',
        docLinkLabel: 'React Organizational Chart Docs',
        folderLink: `${folderBaseLink}/OrgChartDoc.tsx`,
      }}
    >
      <DocSection title="Basic">
        <DocCard code={basicOrgChartCode} noInline scope={orgChartLiveScope} />
      </DocSection>
      <DocSection title="Standard">
        <DocCard code={standardOrgChartCode} noInline scope={orgChartLiveScope} />
      </DocSection>
      <DocSection title="Advanced">
        <DocCard code={advancedOrgChartCode} noInline scope={orgChartLiveScope} />
      </DocSection>
    </DocPageLayout>
  );
};
export default OrgChartDoc;
