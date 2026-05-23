import { useState } from 'react';
import { Button, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { orderDetailsList } from 'data/e-commerce/orders';
import SearchTextField from 'components/common/SearchTextField';
import CreateOrderItem from './CreateOrderItem';
import CreateOrderPaymentSummary from './CreateOrderPaymentSummary';

const CreateOrderContainer = () => {
  const [createOrderItems, setCreateOrderItems] = useState(orderDetailsList[0].items);

  return (
    <Paper sx={{ height: 1, flex: 1, p: { xs: 3, md: 5 } }}>
      <Container maxWidth="sm" sx={{ px: { xs: 0 } }}>
        <Stack direction="column" spacing={5}>
          <div>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Search to add an item
            </Typography>
            <SearchTextField variant="filled" fullWidth label="Search for an item..." />
          </div>

          <Stack
            direction="column"
            spacing={3}
            divider={<Divider flexItem orientation="horizontal" />}
          >
            {createOrderItems.map((item) => (
              <CreateOrderItem key={item.id} orderItem={item} setOrderItems={setCreateOrderItems} />
            ))}
          </Stack>

          <CreateOrderPaymentSummary items={createOrderItems} />

          <Button variant="contained" sx={{ alignSelf: 'flex-end' }}>
            Email invoice
          </Button>
        </Stack>
      </Container>
    </Paper>
  );
};

export default CreateOrderContainer;
