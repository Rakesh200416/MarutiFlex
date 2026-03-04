import React from 'react';
import PendingOrderSummary from './PendingOrderSummary';
import '../PendingOrder.css';

// Render filtered PendingOrderSummary for management approval stage
const ManagementApproved = () => {
  return <PendingOrderSummary filterStageProp="managementApproval" />;
};

export default ManagementApproved;

