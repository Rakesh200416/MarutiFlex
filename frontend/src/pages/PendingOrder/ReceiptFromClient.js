import React from 'react';
import PendingOrderSummary from './PendingOrderSummary';
import '../PendingOrder.css';

// Render filtered PendingOrderSummary for receipt-from-client stage
const ReceiptFromClient = () => {
  return <PendingOrderSummary filterStageProp="receiptFromClient" />;
};

export default ReceiptFromClient;

