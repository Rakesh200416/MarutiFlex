import React from 'react';
import PendingOrderSummary from './PendingOrderSummary';
import '../PendingOrder.css';

const OrderInvoice = () => {
  return <PendingOrderSummary filterStageProp="orderInvoice" />;
};

export default OrderInvoice;
