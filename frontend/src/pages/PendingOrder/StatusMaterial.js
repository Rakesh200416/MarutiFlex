import React from 'react';
import PendingOrderSummary from './PendingOrderSummary';
import '../PendingOrder.css';

const StatusMaterial = () => {
  return <PendingOrderSummary filterStageProp="statusOfMaterial" />;
};

export default StatusMaterial;
