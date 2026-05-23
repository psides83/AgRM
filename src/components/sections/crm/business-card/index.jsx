import BusinessCardManagerClient from './BusinessCardManagerClient';

const BusinessCardManager = ({ embedded = false }) => {
  return <BusinessCardManagerClient embedded={embedded} />;
};

export default BusinessCardManager;
