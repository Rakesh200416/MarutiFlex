import React from 'react';
import PendingOrderSummary from './PendingOrderSummary';
import '../PendingOrder.css';

const FeedbackCall = () => {
  return <PendingOrderSummary filterStageProp="feedback" />;
};

export default FeedbackCall;
