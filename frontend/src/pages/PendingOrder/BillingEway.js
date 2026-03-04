import React from 'react';
import PendingOrderSummary from './PendingOrderSummary';
import '../PendingOrder.css';

// Render filtered PendingOrderSummary for billing stage
const BillingEway = () => {
  return <PendingOrderSummary filterStageProp="billing" />;
};

export default BillingEway;
