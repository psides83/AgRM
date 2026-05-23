const liveEditorOrgDataBlock = `const avatar = (index: number) => \`\${initialConfig.assetsDir}/images/avatar/\${index}.webp\`;

const ORG_DATA: OrgNode<Employee> = {
  id: '1',
  data: { name: 'Yaga Masamichi', role: 'CEO', avatar: avatar(1), department: 'admin' },
  children: [
    {
      id: '2',
      data: { name: 'Manami Suda', role: 'CTO', avatar: avatar(2), department: 'admin' },
      children: [
        {
          id: '3',
          data: {
            name: 'Okkotsu Yuta',
            role: 'Frontend Engineer',
            avatar: avatar(3),
            department: 'dev',
          },
        },
      ],
    },
    {
      id: '4',
      data: { name: 'Kugisaki Nobara', role: 'CMO', avatar: avatar(4), department: 'admin' },
      children: [
        {
          id: '5',
          data: {
            name: 'Nanami Kento',
            role: 'Backend Engineer',
            avatar: avatar(5),
            department: 'dev',
          },
          children: [
            {
              id: '6',
              data: {
                name: 'Fushiguro Megumi',
                role: 'QA Engineer',
                avatar: avatar(6),
                department: 'dev',
              },
              children: [
                {
                  id: '7',
                  data: {
                    name: 'Nitta Akari',
                    role: 'Support Engineer',
                    avatar: avatar(7),
                    department: 'dev',
                  },
                },
              ],
            },
            {
              id: '8',
              data: {
                name: 'Inumaki Toge',
                role: 'Designer',
                avatar: avatar(8),
                department: 'designer',
              },
            },
          ],
        },
      ],
    },
    {
      id: '9',
      data: {
        name: 'Todo Aoi',
        role: 'Senior Designer',
        avatar: avatar(9),
        department: 'designer',
      },
      children: [
        {
          id: '10',
          data: {
            name: 'Iori Utahime',
            role: 'Content Writer',
            avatar: avatar(10),
            department: 'writer',
          },
        },
        {
          id: '11',
          data: {
            name: 'Tsukumo Yuki',
            role: 'Blogger',
            avatar: avatar(11),
            department: 'writer',
          },
        },
      ],
    },
  ],
};
`;
export const basicOrgChartCode = `type Employee = {
  name: string;
  role: string;
  avatar: string;
  department: 'dev' | 'designer' | 'admin' | 'writer';
};

${liveEditorOrgDataBlock}

const BasicOrgNode = ({ node }: { node: OrgNode<Employee> }) => {
  return (
    <Paper
      sx={(theme) => ({
        p: \`\${theme.spacing(1.5)} \${theme.spacing(2)}\`,
        minWidth: 140,
        textAlign: 'center',
        borderRadius: 4,
        boxShadow: theme.vars.shadows[1],
        justifyContent: 'center',
        display: 'inline-flex',
      })}
    >
      <Stack direction="column" spacing={0.5}>
        <Typography variant="subtitle2">{node.data.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {node.data.role}
        </Typography>
      </Stack>
    </Paper>
  );
};

const BasicOrgChartExample = () => {
  return (
    <OrganizationalChart
      data={ORG_DATA}
      lineHeight="30px"
      renderNode={(node) => <BasicOrgNode node={node} />}
    />
  );
};

render(<BasicOrgChartExample />);`;
export const standardOrgChartCode = `type Employee = {
  name: string;
  role: string;
  avatar: string;
  department: 'dev' | 'designer' | 'admin' | 'writer';
};

${liveEditorOrgDataBlock}

const StandardOrgNode = ({ node }: { node: OrgNode<Employee> }) => {
  return (
    <Paper
      variant="elevation"
      elevation={3}
      sx={(theme) => ({
        position: 'relative',
        p: \`\${theme.spacing(1.5)} \${theme.spacing(2)}\`,
        minWidth: 180,
        borderRadius: 4,
        display: 'inline-flex',
      })}
    >
      <Stack direction="column" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Avatar src={node.data.avatar} alt={node.data.name} sx={{ width: 48, height: 48 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {node.data.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {node.data.role}
        </Typography>
      </Stack>

      <DashboardMenu
        menuItems={[
          {
            label: 'Edit',
          },
          {
            label: 'Delete',
            sx: { color: 'error.main' },
          },
        ]}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{ position: 'absolute', top: 12, right: 16 }}
      />
    </Paper>
  );
};

const StandardOrgChartExample = () => {
  return (
    <OrganizationalChart
      data={ORG_DATA}
      lineHeight="30px"
      renderNode={(node) => <StandardOrgNode node={node} />}
    />
  );
};

render(<StandardOrgChartExample />);`;
export const advancedOrgChartCode = `type Employee = {
  name: string;
  role: string;
  avatar: string;
  department: 'dev' | 'designer' | 'admin' | 'writer';
};

${liveEditorOrgDataBlock}

const getDepartmentColor = (department: Employee['department']) => {
  switch (department) {
    case 'admin':
      return 'primary.main';
    case 'dev':
      return 'success.main';
    case 'designer':
      return 'info.main';
    case 'writer':
      return 'warning.main';
  }
};

const AdvancedOrgNode = ({ node }: { node: OrgNode<Employee> }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        minWidth: 180,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Avatar
        src={node.data.avatar}
        alt={node.data.name}
        sx={({ vars, spacing }) => ({
          width: 56,
          height: 56,
          position: 'absolute',
          border: \`4px solid \${vars.palette.background.paper}\`,
          marginTop: \`\${spacing(-3.5)}\`,
          zIndex: 3,
        })}
      />
      <Paper
        variant="elevation"
        elevation={3}
        sx={({ spacing }) => ({
          borderRadius: 4,
          width: 1,
          position: 'relative',
          overflow: 'hidden',
          p: \`\${spacing(5.5)} \${spacing(1.5)} \${spacing(1.5)}\`,
        })}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1,
            height: 4,
            borderRadius: 1.5,
            bgcolor: getDepartmentColor(node.data.department),
          }}
        />
        <Stack direction="column" spacing={2}>
          <Stack direction="column" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineClamp: 1 }}>
              {node.data.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {node.data.role}
            </Typography>
          </Stack>

          <Stack spacing={1} sx={{ justifyContent: 'center' }}>
            <Button shape="circle" variant="soft" size="small" color="neutral">
              <IconifyIcon icon="ri:facebook-box-line" sx={{ fontSize: 16 }} />
            </Button>
            <Button shape="circle" variant="soft" size="small" color="neutral">
              <IconifyIcon icon="ri:twitter-x-fill" sx={{ fontSize: 16 }} />
            </Button>
            <Button shape="circle" variant="soft" size="small" color="neutral">
              <IconifyIcon icon="ri:instagram-line" sx={{ fontSize: 16 }} />
            </Button>
          </Stack>
        </Stack>

        <DashboardMenu
          menuItems={[
            {
              label: 'Edit',
            },
            {
              label: 'Delete',
              sx: { color: 'error.main' },
            },
          ]}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{ position: 'absolute', top: 12, right: 16 }}
        />
      </Paper>
    </Box>
  );
};

const AdvancedOrgChartExample = () => {
  return (
    <OrganizationalChart
      data={ORG_DATA}
      lineHeight="64px"
      lineBorderRadius="24px"
      renderNode={(node) => <AdvancedOrgNode node={node} />}
    />
  );
};

render(<AdvancedOrgChartExample />);`;
