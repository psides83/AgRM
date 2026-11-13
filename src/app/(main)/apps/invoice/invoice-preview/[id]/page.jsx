import BackToListButton from 'components/base/BackToListButton';
import paths from 'routes/paths';
import React from 'react';
import InvoicePreview from 'components/sections/invoice/invoice-preview';

const Page = () => {
  return (
    <>
      <BackToListButton fallbackHref={paths.invoiceList} fallbackLabel="Invoices" />
      <InvoicePreview />
    </>
  );
};

export default Page;
