import { useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Box,
  Collapse,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  avatarClasses,
  useTheme,
} from '@mui/material';
import { DataGrid, GRID_CHECKBOX_SELECTION_COL_DEF, gridClasses } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';

const getStateIcon = (state) => {
  switch (state) {
    case 'On Track':
      return {
        color: 'success.main',
        icon: 'material-symbols:check-circle-outline-rounded',
      };
    case 'Overdue':
      return {
        color: 'warning.main',
        icon: 'material-symbols:warning-outline-rounded',
      };
    case 'Delayed':
      return {
        color: 'error.main',
        icon: 'material-symbols:warning-outline-rounded',
      };
    default:
      return {
        color: 'primary.main',
        icon: 'material-symbols:check-circle-outline-rounded',
      };
  }
};

const columns = [
  {
    ...GRID_CHECKBOX_SELECTION_COL_DEF,
    width: 64,
  },
  {
    field: 'name',
    headerName: 'Name',
    headerClassName: 'name-header',
    cellClassName: 'name-cell',
    minWidth: 210,
    flex: 0.16,
    renderCell: (params) => (
      <Typography
        variant="subtitle2"
        sx={{ textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: 400 }}
      >
        {params.row.name}
      </Typography>
    ),
  },
  {
    field: 'eta',
    headerName: 'ETA',
    headerClassName: 'eta-header',
    cellClassName: 'eta-cell',
    minWidth: 130,
    type: 'date',
    flex: 0.2,
    renderCell: (params) => (
      <Typography
        variant="subtitle2"
        sx={{ display: 'flex', alignItems: 'center', fontWeight: 400 }}
      >
        <IconifyIcon
          icon="material-symbols:calendar-today-outline-rounded"
          sx={{ mr: 1, fontSize: 16 }}
        />
        {dayjs(params.row.eta).format('DD MMM, YYYY')}
      </Typography>
    ),
    valueGetter: (value) => new Date(value),
  },
  {
    field: 'lead',
    headerName: 'Lead',
    headerClassName: 'lead-header',
    cellClassName: 'lead-cell',
    minWidth: 72,
    flex: 0.07,
    renderCell: (params) => (
      <Tooltip title={params.row.lead.name} key={params.row.lead.name}>
        <Avatar
          alt={params.row.lead.name}
          src={params.row.lead.avatar}
          sx={{ width: 28, height: 28 }}
        />
      </Tooltip>
    ),
  },
  {
    field: 'members',
    headerName: 'Members',
    headerClassName: 'members-header',
    cellClassName: 'members-cell',
    minWidth: 140,
    flex: 0.4,
    renderCell: (params) => (
      <AvatarGroup
        max={5}
        color="primary"
        sx={{
          display: 'inline-flex',
          [`& .${avatarClasses.root}`]: {
            width: 28,
            height: 28,
            fontSize: 12.8,
            fontWeight: 'medium',
            backgroundColor: 'primary.main',
          },
        }}
      >
        {params.row.members.map((member) => (
          <Tooltip title={member.name} key={member.name}>
            <Avatar alt={member.name} src={member.avatar} />
          </Tooltip>
        ))}
      </AvatarGroup>
    ),
  },
  {
    field: 'progress',
    headerName: 'Progress',
    headerClassName: 'progress-header',
    cellClassName: 'progress-cell',
    minWidth: 120,
    flex: 0.2,
    renderCell: (params) => {
      const progress = params.row.progress;

      const progressColor = progress >= 80 ? 'success' : progress <= 30 ? 'error' : 'warning';

      return (
        <LinearProgress
          variant="determinate"
          value={progress}
          color={progressColor}
          sx={{ height: 8, width: 109, borderRadius: 0.5 }}
        />
      );
    },
  },
  {
    field: 'state',
    headerName: 'State',
    headerClassName: 'state-header',
    cellClassName: 'state-cell',
    minWidth: 150,
    flex: 0.07,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Typography
        variant="subtitle2"
        sx={{ display: 'flex', alignItems: 'center', fontWeight: 400 }}
      >
        <IconifyIcon
          icon={getStateIcon(params.row.state).icon}
          sx={{ mr: 1, fontSize: 16, color: getStateIcon(params.row.state).color }}
        />
        {params.value}
      </Typography>
    ),
  },
];

const ProjectDataTable = ({ projectInfo }) => {
  const [open, setOpen] = useState(true);
  const { vars } = useTheme();
  const { name, color, tasks } = projectInfo;

  return (
    <Stack spacing={2} sx={{ width: 1 }}>
      <Box
        sx={{
          minWidth: 4,
          borderRadius: 0.5,
          bgcolor: vars.palette[color].main,
        }}
      />
      <Box sx={{ width: 1, minWidth: 0 }}>
        <Stack
          role="button"
          alignItems="center"
          justifyContent="space-between"
          onClick={() => setOpen(!open)}
          sx={{
            py: 2,
            bgcolor: 'background.elevation1',
            borderRadius: 4,
            px: 3,
            '&:hover': {
              cursor: 'pointer',
            },
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          <IconifyIcon
            icon="material-symbols:keyboard-arrow-down-rounded"
            sx={({ transitions }) => ({
              fontSize: 20,
              color: 'neutral.main',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: transitions.create('transform', {
                duration: transitions.duration.short,
                easing: transitions.easing.easeInOut,
              }),
            })}
          />
        </Stack>
        <Collapse in={open}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataGrid
              rows={tasks}
              columns={columns}
              checkboxSelection
              hideFooter
              sx={({ vars, spacing }) => ({
                '--DataGrid-containerBackground': 'transparent',
                '& .MuiDataGrid-row--lastVisible': {
                  borderBottom: `1px solid ${vars.palette.dividerLight}`,
                },
                '& .MuiDataGrid-row--firstVisible': {
                  borderTop: `1px solid ${vars.palette.dividerLight}`,
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: vars.palette.background.default,
                },
                [`& .${gridClasses.columnHeaders}`]: {
                  [`& .${gridClasses.columnHeader}`]: {
                    '&:not(.state-header)': {
                      p: `0 ${spacing(1.25)}`,
                    },
                    '&.state-header': {
                      pl: spacing(1.25),
                    },
                  },
                },
                [`& .${gridClasses.row}`]: {
                  [`& .${gridClasses.cell}`]: {
                    '&.agrm-data-grid-cell': {
                      '&:not(.state-cell)': {
                        p: `0 ${spacing(1.25)}`,
                      },
                      '&.state-cell': {
                        pl: spacing(1.25),
                      },
                    },
                  },
                },
              })}
            />
          </div>
        </Collapse>
      </Box>
    </Stack>
  );
};

export default ProjectDataTable;
