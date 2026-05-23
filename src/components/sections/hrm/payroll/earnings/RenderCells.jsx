import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { currencyFormat } from 'lib/utils';
import IconifyIcon from 'components/base/IconifyIcon';
import NumberTextField from 'components/base/NumberTextField';
import StyledTextField from 'components/styled/StyledTextField';
import useAddPayHandlers from './useAddPayHandlers';

const renderEmployeeCell = (params) => {
  return (
    <Stack spacing={1.5} alignItems="center">
      <Avatar src={params.row.employee.avatar} sx={{ width: 24, height: 24 }} />
      <Stack direction="column" spacing={0.5}>
        <Link href="#!" sx={{ typography: 'subtitle2', fontWeight: 400 }}>
          {params.row.employee.name}
        </Link>
        <Typography variant="caption" sx={{ lineHeight: 1.5 }}>
          {params.row.employee.wage}
        </Typography>
      </Stack>
    </Stack>
  );
};

const renderHoursCell = (params) => {
  return (
    <Stack direction="column" sx={{ width: '60%', minWidth: 150 }}>
      <Stack
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 36,
        }}
      >
        <Typography variant="body2">Regular</Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {params.row.hours.regular}hrs
        </Typography>
      </Stack>
      <Stack
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          height: 36,
        }}
      >
        <Typography variant="body2">Overtime</Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
          {params.row.hours.overtime}hrs
        </Typography>
      </Stack>
    </Stack>
  );
};

const renderExtraPayCell = (params, apiRef) => {
  const {
    currencyFormat,
    newLabel,
    setNewLabel,
    newAmount,
    setNewAmount,
    isAdding,
    handleAdd,
    handleKeyDown,
  } = useAddPayHandlers(params, 'extraPay', apiRef);

  return (
    <Stack direction="column" sx={{ width: '70%', minWidth: 230 }}>
      {params.row.extraPay.map((item, index) => (
        <Stack
          key={index}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 36,
          }}
        >
          <Typography variant="body2">{item.label}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {currencyFormat(item.amount, { maximumFractionDigits: 0 })}
          </Typography>
        </Stack>
      ))}

      {isAdding && (
        <Stack gap={1} sx={{ pt: 1 }}>
          <StyledTextField
            size="small"
            select
            fullWidth
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          >
            <MenuItem value="Bonus">Bonus</MenuItem>
            <MenuItem value="Commission">Commission</MenuItem>
            <MenuItem value="Housing allowance">Housing allowance</MenuItem>
            <MenuItem value="Vehicle allowance">Vehicle allowance</MenuItem>
            <MenuItem value="Medical allowance">Medical allowance</MenuItem>
            <MenuItem value="Overtime">Overtime</MenuItem>
          </StyledTextField>

          <NumberTextField
            size="small"
            placeholder="Amount"
            variant="custom"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Stack>
      )}

      {!isAdding && (
        <Button
          size="small"
          endIcon={<IconifyIcon icon="material-symbols:keyboard-arrow-down" />}
          sx={{ alignSelf: 'flex-start' }}
          onClick={handleAdd}
        >
          Add Pay
        </Button>
      )}
    </Stack>
  );
};

const renderDeductionCell = (params, apiRef) => {
  const {
    currencyFormat,
    newLabel,
    setNewLabel,
    newAmount,
    setNewAmount,
    isAdding,
    handleAdd,
    handleKeyDown,
  } = useAddPayHandlers(params, 'deduction', apiRef);

  return (
    <Stack direction="column" sx={{ width: '70%', minWidth: 230 }}>
      {params.row.deduction.map((item, index) => (
        <Stack
          key={index}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 36,
          }}
        >
          <Typography variant="body2">{item.label}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {currencyFormat(item.amount, { maximumFractionDigits: 0 })}
          </Typography>
        </Stack>
      ))}

      {isAdding && (
        <Stack gap={1} sx={{ pt: 1 }}>
          <StyledTextField
            size="small"
            placeholder="Label"
            value={newLabel}
            autoFocus
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <NumberTextField
            size="small"
            placeholder="Amount"
            variant="custom"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Stack>
      )}

      {!isAdding && (
        <Button
          size="small"
          endIcon={<IconifyIcon icon="material-symbols:keyboard-arrow-down" />}
          sx={{ alignSelf: 'flex-start' }}
          onClick={handleAdd}
        >
          Add Pay
        </Button>
      )}
    </Stack>
  );
};

const renderNetPayTypeCell = (params, apiRef) => {
  const handleChange = (e) => {
    const newType = e.target.value;

    const rowId = params.row.id;

    apiRef.current?.updateRows([
      {
        id: rowId,
        netPayType: {
          ...params.row.netPayType,
          type: newType,
        },
      },
    ]);
  };
  return (
    <Stack direction="column" gap={0.75} sx={{ alignItems: 'flex-end', width: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
        {currencyFormat(params.row.netPayType.amount, 'en-US', {
          maximumFractionDigits: 0,
        })}
      </Typography>
      <StyledTextField
        select
        size="small"
        fullWidth
        value={params.row.netPayType.type}
        onChange={handleChange}
        sx={{ maxWidth: 160, textAlign: 'left' }}
      >
        <MenuItem value="Direct Deposit">Direct Deposit</MenuItem>
        <MenuItem value="Cheque">Cheque</MenuItem>
        <MenuItem value="Cash Payment">Cash Payment</MenuItem>
      </StyledTextField>
    </Stack>
  );
};

export {
  renderDeductionCell,
  renderEmployeeCell,
  renderExtraPayCell,
  renderHoursCell,
  renderNetPayTypeCell,
};
