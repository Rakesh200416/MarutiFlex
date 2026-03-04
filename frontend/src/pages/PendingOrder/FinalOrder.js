import React from 'react';
import PendingOrderSummary from './PendingOrderSummary';
import '../PendingOrder.css';

const FinalOrder = () => {
  return <PendingOrderSummary filterStageProp="finalOrder" />;
};

export default FinalOrder;
