import React from 'react';
import PendingOrderSummary from './PendingOrderSummary';
import '../PendingOrder.css';

const DeliveryInfo = () => {
  return <PendingOrderSummary filterStageProp="deliveryInfo" />;
};

export default DeliveryInfo;
