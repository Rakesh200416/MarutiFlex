import React from 'react';
import PendingOrderSummary from './PendingOrderSummary';
import '../PendingOrder.css';

// FinancialCreditibility page now shows a filtered summary table of orders
// that have completed the financial credibility step.  The actual form
// for adding/updating stages is handled via the modal in PendingOrderSummary
// when the user clicks "Update" on a record.
const FinancialCreditibility = () => {
  return <PendingOrderSummary filterStageProp="financialCreditibility" />;
};

export default FinancialCreditibility;

