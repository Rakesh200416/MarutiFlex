import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../PendingOrder.css';
import '../../components/Modal.css';

const PendingOrderSummary = ({ filterStageProp }) => {
  // derive backend URL for fetching uploaded assets in development
  const backendBase = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
  const normalizePath = (p) => {
    if (!p) return p;
    const clean = p.replace(/\\\\/g, '/');
    return `${backendBase}/${clean}`;
  }; // ensure forward slashes for URLs
  const navigate = useNavigate();
  const location = useLocation();
  const modalBodyRef = useRef(null);
  const [records, setRecords] = useState([]);
  // track filter either from prop (page-specific) or query param
  const [filterStage, setFilterStage] = useState(filterStageProp || null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [selectedRecordForUpdate, setSelectedRecordForUpdate] = useState(null);
  const [financialFormData, setFinancialFormData] = useState({
    overdueOfParty: '',
    creditLimitIfAccess: '',
    informationToCRM: '',
    whetherOrderProcessed: ''
  });
  const [financialLoading, setFinancialLoading] = useState(false);
  const [financialError, setFinancialError] = useState('');
  const [currentStageModal, setCurrentStageModal] = useState(null); // 'financial', 'management', 'finalOrder', etc.
  const [stageData, setStageData] = useState({});
  const [managementFormData, setManagementFormData] = useState({
    approvalStatus: '',
    remarks: ''
  });
  const [finalOrderFormData, setFinalOrderFormData] = useState({
    orderStatus: '',
    cancelledReason: '',
    otherReason: '',
    finalOrder: '',
    partDelivery: ''
  });
  const [arrangeVehicleFormData, setArrangeVehicleFormData] = useState({
    vehicleArrangementDetails: '',
    vehicleType: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    deliveryType: '',
    remark: '',
    actualFreight: ''
  });
  const [arrangeVehicleFiles, setArrangeVehicleFiles] = useState({
    loadingAttachment: null,
    challanAttachment: null
  });
  const [billingFormData, setBillingFormData] = useState({
    eWayBill: '',
    invoiceNo: '',
    invoiceValue: '',
    eInvoiceGenerated: ''
  });
  const [billingFiles, setBillingFiles] = useState({
    tallyInvoiceCopy: null
  });
  const [receiptFormData, setReceiptFormData] = useState({
    clientType: ''
  });
  const [receiptFiles, setReceiptFiles] = useState({
    receiptFile: null
  });
  const [statusFormData, setStatusFormData] = useState({
    materialReachedOnTime: ''
  });
  const [invoiceFormData, setInvoiceFormData] = useState({
    priceInvoiceChecked: '',
    freightInvoiceChecked: '',
    quantityChecked: '',
    needToHighlight: '',
    remarks: ''
  });
  const [deliveryFormData, setDeliveryFormData] = useState({
    informedAboutDelay: ''
  });
  const [feedbackFormData, setFeedbackFormData] = useState({
    customerPickedCall: ''
  });

  useEffect(() => {
    // update filter based on prop or query parameters
    if (filterStageProp) {
      setFilterStage(filterStageProp);
      fetchAllRecords();
    } else {
      const params = new URLSearchParams(location.search);
      const stage = params.get('stage');
      setFilterStage(stage);
      fetchAllRecords();
    }
  }, [location.search, filterStageProp]);

  // Scroll modal body to top when modal opens or stage changes
  useEffect(() => {
    if (showFinancialModal && modalBodyRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (modalBodyRef.current) {
          modalBodyRef.current.scrollTop = 0;
          modalBodyRef.current.scroll({ top: 0, left: 0, behavior: 'instant' });
        }
      });
      
      // Fallback with setTimeout
      const timer = setTimeout(() => {
        if (modalBodyRef.current) {
          modalBodyRef.current.scrollTop = 0;
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [showFinancialModal, currentStageModal]);

  // Helper: mark a completed stage on the selected record in-memory so the table updates immediately
  const markStageOnRecord = (stageKey, data) => {
    const selId = selectedRecordForUpdate?.id;
    if (!selId) return;
    setRecords(prev => prev.map(r => r.id === selId ? { ...r, [stageKey]: data } : r));
    setSelectedRecordForUpdate(prev => prev && prev.id === selId ? { ...prev, [stageKey]: data } : prev);
    if (selectedRecord && selectedRecord.id === selId) {
      setSelectedRecord(prev => prev ? { ...prev, [stageKey]: data } : prev);
    }
  };

  const getOrderStatus = (record) => {
    // Determine status based on stages present on the record:
    // - If all known stages are present -> Completed
    // - If any stage is present -> Ongoing
    // - Otherwise use existing record.status or Pending
    const stages = [
      'financialCreditibility',
      'managementApproval',
      'finalOrder',
      'arrangeVehicle',
      'billing',
      'receiptFromClient',
      'statusOfMaterial',
      'orderInvoice',
      'deliveryInfo',
      'feedback'
    ];
    const completed = stages.filter(s => !!record[s]);
    if (completed.length === stages.length) return 'Completed';
    if (completed.length > 0) return 'Ongoing';
    if (record.status === 'Processing') return 'Processing';
    if (record.status === 'Pending') return 'Pending';
    return record.status || 'Pending';
  };

  // determine effective filter stage and build filtered record list
  const activeFilter = filterStageProp || filterStage;

  // friendly labels for headings (used in header below)
  const stageLabels = {
    financialCreditibility: 'Financial Creditibility',
    managementApproval: 'Management Approval',
    finalOrder: 'Final Order',
    arrangeVehicle: 'Arrange Vehicle',
    billing: 'Billing & E-way',
    receiptFromClient: 'Receipt From Client',
    statusOfMaterial: 'Status of Material',
    orderInvoice: 'Order Invoice',
    deliveryInfo: 'Delivery Info',
    feedback: 'Feedback Call'
  };

  const displayedRecords = records
    .filter(r => {
      if (activeFilter === 'financialCreditibility') {
        // show orders that still need the financial credibility step
        return !r.financialCreditibility;
      } else if (activeFilter === 'managementApproval') {
        // records that have passed financial check but not yet had management approval
        return !!r.financialCreditibility && !r.managementApproval;
      } else if (activeFilter === 'finalOrder') {
        // show orders that received management approval but haven't been finalized
        return !!r.managementApproval && !r.finalOrder;
      } else if (activeFilter === 'arrangeVehicle') {
        // after final order submission, orders should move to arrange vehicle list
        return !!r.finalOrder && !r.arrangeVehicle;
      } else if (activeFilter === 'billing') {
        // after vehicle arrangement, orders go to billing/E-way
        return !!r.arrangeVehicle && !r.billing;
      } else if (activeFilter === 'receiptFromClient') {
        // after billing, orders move to receipt collection
        return !!r.billing && !r.receiptFromClient;
      } else if (activeFilter === 'statusOfMaterial') {
        // after receipt, orders move to status check
        return !!r.receiptFromClient && !r.statusOfMaterial;
      } else if (activeFilter === 'orderInvoice') {
        // after status check, orders go to invoice verification
        return !!r.statusOfMaterial && !r.orderInvoice;
      } else if (activeFilter === 'deliveryInfo') {
        // after invoice check, orders move to delivery info
        return !!r.orderInvoice && !r.deliveryInfo;
      } else if (activeFilter === 'feedback') {
        // after delivery info, orders move to feedback
        return !!r.deliveryInfo && !r.feedback;
      } else if (activeFilter) {
        return r[activeFilter];
      }
      return true;
    })
    .filter(r => {
      // Search filter logic
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        r.partyName?.toLowerCase().includes(searchLower) ||
        r.placeCity?.toLowerCase().includes(searchLower) ||
        r.contactPerson?.toLowerCase().includes(searchLower) ||
        r.contactNumber?.includes(searchTerm) ||
        r.salesExecutive?.toLowerCase().includes(searchLower) ||
        r.orderTakenBy?.toLowerCase().includes(searchLower)
      );
    })
    .filter(r => {
      // Additional filter type logic (city, executive, deliveryType, date)
      if (filterType === 'city' && filterValue) {
        // allow partial matches like Orders page search
        return r.placeCity?.toLowerCase().includes(filterValue.toLowerCase());
      } else if (filterType === 'executive' && filterValue) {
        return r.salesExecutive?.toLowerCase().includes(filterValue.toLowerCase());
      } else if (filterType === 'deliveryType' && filterValue) {
        return r.deliveryType?.toLowerCase().includes(filterValue.toLowerCase());
      } else if (filterType === 'dateFrom' && filterValue) {
        const recordDate = new Date(r.dateCreated);
        const filterDate = new Date(filterValue);
        return recordDate >= filterDate;
      } else if (filterType === 'dateTo' && filterValue) {
        const recordDate = new Date(r.dateCreated);
        const filterDate = new Date(filterValue);
        return recordDate <= filterDate;
      }
      return true;
    });

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterValue('');
  };

  // keep selectedRecord in sync with filter changes
  useEffect(() => {
    if (records.length === 0) return;
    if (activeFilter) {
      const rec = records.find(r => r[activeFilter]);
      setSelectedRecord(rec || records[0]);
    } else {
      setSelectedRecord(records[0]);
    }
  }, [activeFilter, records]);

  const getOrderDetails = (record) => {
    // Get order details for display in table
    if (record.partyName) {
      return `${record.partyName} - ${record.placeCity || 'N/A'}`;
    }
    if (record.receiptFromClient) {
      return `Receipt: ${record.receiptFromClient.clientType}`;
    }
    if (record.statusOfMaterial) {
      return `Material Status: ${record.statusOfMaterial.materialReachedOnTime}`;
    }
    if (record.deliveryInfo) {
      return `Delivery Delay Info: ${record.deliveryInfo.informedAboutDelay}`;
    }
    if (record.orderInvoice) {
      return `Invoice Check - Price: ${record.orderInvoice.priceInvoiceChecked}`;
    }
    return 'Pending Review';
  };

  const stageKeyToModal = {
    financialCreditibility: 'financial',
    managementApproval: 'management',
    finalOrder: 'finalOrder',
    arrangeVehicle: 'arrangeVehicle',
    billing: 'billing',
    receiptFromClient: 'receipt',
    statusOfMaterial: 'status',
    orderInvoice: 'invoice',
    deliveryInfo: 'delivery',
    feedback: 'feedback'
  };

  const getFirstIncompleteModal = (record) => {
    for (const key of Object.keys(stageKeyToModal)) {
      if (!record[key]) {
        return stageKeyToModal[key];
      }
    }
    return null;
  };

  const handleUpdateClick = async (record) => {
    // If we're on a page that focuses only on a single stage, fetch the
    // freshest copy before showing the popup.  this applies to financial
    // (new credit checks), management (approval), and final order editing.
    const activeFilter = filterStageProp || filterStage;
    if (
      activeFilter === 'managementApproval' ||
      activeFilter === 'finalOrder' ||
      activeFilter === 'financialCreditibility' ||
      activeFilter === 'arrangeVehicle' ||
      activeFilter === 'billing' ||
      activeFilter === 'receiptFromClient' ||
      activeFilter === 'statusOfMaterial' ||
      activeFilter === 'orderInvoice' ||
      activeFilter === 'deliveryInfo' ||
      activeFilter === 'feedback'
    ) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`/api/orders/${record.id}`, {
            headers: { 'x-auth-token': token }
          });
          if (res.ok) {
            const fresh = await res.json();
            // merge potentially updated stage data
            if (activeFilter === 'managementApproval') {
              record = { ...record, managementApproval: fresh.managementApproval };
            } else if (activeFilter === 'finalOrder') {
              record = { ...record, finalOrder: fresh.finalOrder };
            } else if (activeFilter === 'financialCreditibility') {
              record = { ...record, financialCreditibility: fresh.financialCreditibility };
            } else if (activeFilter === 'arrangeVehicle') {
              record = { ...record, arrangeVehicle: fresh.arrangeVehicle };
            } else if (activeFilter === 'billing') {
              record = { ...record, billing: fresh.billing };
            } else if (activeFilter === 'receiptFromClient') {
              record = { ...record, receiptFromClient: fresh.receiptFromClient };
            } else if (activeFilter === 'statusOfMaterial') {
              record = { ...record, statusOfMaterial: fresh.statusOfMaterial };
            } else if (activeFilter === 'orderInvoice') {
              record = { ...record, orderInvoice: fresh.orderInvoice };
            } else if (activeFilter === 'deliveryInfo') {
              record = { ...record, deliveryInfo: fresh.deliveryInfo };
            } else if (activeFilter === 'feedback') {
              record = { ...record, feedback: fresh.feedback };
            }
          }
        } catch (err) {
          console.warn('Failed to re-fetch order for edit', err);
        }
      }
    }

    setSelectedRecordForUpdate(record);
    // keep a copy of the full record to reference existing stage data
    setStageData({ ...record });

    // compute active filter (prop overrides state)
    // const activeFilter defined above

    // pick which modal we want to display.  on financial and management
    // pages we always show the respective form (blank if no prior data).
    let nextModal;
    if (activeFilter === 'managementApproval' || activeFilter === 'finalOrder' || activeFilter === 'financialCreditibility' || activeFilter === 'arrangeVehicle' || activeFilter === 'billing' || activeFilter === 'receiptFromClient' || activeFilter === 'statusOfMaterial' || activeFilter === 'orderInvoice' || activeFilter === 'deliveryInfo' || activeFilter === 'feedback') {
      if (activeFilter === 'managementApproval') {
        nextModal = 'management';
      } else if (activeFilter === 'finalOrder') {
        nextModal = 'finalOrder';
      } else if (activeFilter === 'arrangeVehicle') {
        nextModal = 'arrangeVehicle';
      } else if (activeFilter === 'billing') {
        nextModal = 'billing';
      } else if (activeFilter === 'receiptFromClient') {
        nextModal = 'receipt';
      } else if (activeFilter === 'statusOfMaterial') {
        nextModal = 'status';
      } else if (activeFilter === 'orderInvoice') {
        nextModal = 'invoice';
      } else if (activeFilter === 'deliveryInfo') {
        nextModal = 'delivery';
      } else if (activeFilter === 'feedback') {
        nextModal = 'feedback';
      } else {
        nextModal = 'financial';
      }
    } else {
      // general behaviour for other filters/stages
      // if the user clicked from a filtered state and that stage isn't already
      // completed for this order, open that stage first.  additionally treat
      // financial filter as a hard override so we always show that popup even if
      // the step has stored data (to allow editing).
      let desiredModal = null;
      if (activeFilter === 'financialCreditibility') {
        desiredModal = 'financial';
      } else if (activeFilter && !record[activeFilter]) {
        desiredModal = stageKeyToModal[activeFilter];
      }

      // otherwise find the first incomplete stage
      nextModal = desiredModal || getFirstIncompleteModal(record) || 'financial';
    }

    // populate form data if we're editing an existing stage
    switch (nextModal) {
      case 'financial':
        if (activeFilter === 'financialCreditibility') {
          // always show a blank form on the dedicated financial page
          setFinancialFormData({
            overdueOfParty: '',
            creditLimitIfAccess: '',
            informationToCRM: '',
            whetherOrderProcessed: ''
          });
        } else {
          setFinancialFormData({
            overdueOfParty: record.financialCreditibility?.overdueOfParty || '',
            creditLimitIfAccess: record.financialCreditibility?.creditLimitIfAccess || '',
            informationToCRM: record.financialCreditibility?.informationToCRM || '',
            whetherOrderProcessed: record.financialCreditibility?.whetherOrderProcessed || ''
          });
        }
        break;
      case 'management':
        if (activeFilter === 'managementApproval') {
          // always show fresh form on the management page
          setManagementFormData({ approvalStatus: '', remarks: '' });
        } else {
          setManagementFormData({
            approvalStatus: record.managementApproval?.approvalStatus || '',
            remarks: record.managementApproval?.remarks || ''
          });
        }
        break;
      case 'finalOrder':
        if (activeFilter === 'finalOrder') {
          // blank final order form on dedicated page
          setFinalOrderFormData({
            orderStatus: '',
            cancelledReason: '',
            otherReason: '',
            finalOrder: '',
            partDelivery: ''
          });
        } else {
          setFinalOrderFormData({
            orderStatus: record.finalOrder?.orderStatus || '',
            cancelledReason: record.finalOrder?.cancelledReason || '',
            otherReason: record.finalOrder?.otherReason || '',
            finalOrder: record.finalOrder?.finalOrder || '',
            partDelivery: record.finalOrder?.partDelivery || ''
          });
        }
        break;
      case 'arrangeVehicle':
        if (activeFilter === 'arrangeVehicle') {
          setArrangeVehicleFormData({
            vehicleArrangementDetails: '',
            vehicleType: '',
            vehicleNumber: '',
            driverName: '',
            driverPhone: '',
            deliveryType: '',
            remark: '',
            actualFreight: ''
          });
          setArrangeVehicleFiles({ loadingAttachment: null, challanAttachment: null });
        } else {
          setArrangeVehicleFormData({
            vehicleArrangementDetails: record.arrangeVehicle?.vehicleArrangementDetails || '',
            vehicleType: record.arrangeVehicle?.vehicleType || '',
            vehicleNumber: record.arrangeVehicle?.vehicleNumber || '',
            driverName: record.arrangeVehicle?.driverName || '',
            driverPhone: record.arrangeVehicle?.driverPhone || '',
            deliveryType: record.arrangeVehicle?.deliveryType || '',
            remark: record.arrangeVehicle?.remark || '',
            actualFreight: record.arrangeVehicle?.actualFreight || ''
          });
          setArrangeVehicleFiles({
            loadingAttachment: null,
            challanAttachment: null
          });
        }
        break;
      case 'billing':
        if (activeFilter === 'billing') {
          // blank billing form on dedicated page
          setBillingFormData({ eWayBill: '', invoiceNo: '', invoiceValue: '', eInvoiceGenerated: '' });
          setBillingFiles({ tallyInvoiceCopy: null });
        } else {
          setBillingFormData({
            eWayBill: record.billing?.eWayBill || '',
            invoiceNo: record.billing?.invoiceNo || '',
            invoiceValue: record.billing?.invoiceValue || '',
            eInvoiceGenerated: record.billing?.eInvoiceGenerated || ''
          });
          setBillingFiles({ tallyInvoiceCopy: null });
        }
        break;
      case 'receipt':
        if (activeFilter === 'receiptFromClient') {
          // blank receipt form on dedicated page
          setReceiptFormData({ clientType: '' });
          setReceiptFiles({ receiptFile: null });
        } else {
          setReceiptFormData({
            clientType: record.receiptFromClient?.clientType || ''
          });
          setReceiptFiles({ receiptFile: null });
        }
        break;
      case 'status':
        if (activeFilter === 'statusOfMaterial') {
          // blank status form on dedicated page
          setStatusFormData({ materialReachedOnTime: '' });
        } else {
          setStatusFormData({
            materialReachedOnTime: record.statusOfMaterial?.materialReachedOnTime || ''
          });
        }
        break;
      case 'invoice':
        if (activeFilter === 'orderInvoice') {
          // blank invoice form on dedicated page
          setInvoiceFormData({
            priceInvoiceChecked: '',
            freightInvoiceChecked: '',
            quantityChecked: '',
            needToHighlight: '',
            remarks: ''
          });
        } else {
          setInvoiceFormData({
            priceInvoiceChecked: record.orderInvoice?.priceInvoiceChecked || '',
            freightInvoiceChecked: record.orderInvoice?.freightInvoiceChecked || '',
            quantityChecked: record.orderInvoice?.quantityChecked || '',
            needToHighlight: record.orderInvoice?.needToHighlight || '',
            remarks: record.orderInvoice?.remarks || ''
          });
        }
        break;
      case 'delivery':
        if (activeFilter === 'deliveryInfo') {
          // blank delivery form on dedicated page
          setDeliveryFormData({ informedAboutDelay: '' });
        } else {
          setDeliveryFormData({
            informedAboutDelay: record.deliveryInfo?.informedAboutDelay || ''
          });
        }
        break;
      case 'feedback':
        if (activeFilter === 'feedback') {
          // blank feedback form on dedicated page
          setFeedbackFormData({ customerPickedCall: '' });
        } else {
          setFeedbackFormData({
            customerPickedCall: record.feedback?.customerPickedCall || ''
          });
        }
        break;
      case 'finalOrder':
        setFinalOrderFormData({
          orderStatus: record.finalOrder?.orderStatus || '',
          cancelledReason: record.finalOrder?.cancelledReason || '',
          otherReason: record.finalOrder?.otherReason || '',
          finalOrder: record.finalOrder?.finalOrder || '',
          partDelivery: record.finalOrder?.partDelivery || ''
        });
        break;
      // other cases could be added similarly if editing required
      default:
        break;
    }

    setFinancialError('');
    setCurrentStageModal(nextModal);
    setShowFinancialModal(true);
  };

  const handleFinancialChange = (e) => {
    const { name, value } = e.target;
    setFinancialFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFinancialSubmit = async (e) => {
    e.preventDefault();
    setFinancialError('');
    setFinancialLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setFinancialError('No token found. Please login first.');
        setFinancialLoading(false);
        return;
      }

      // Validate all fields are filled
      if (!financialFormData.overdueOfParty || !financialFormData.creditLimitIfAccess || !financialFormData.informationToCRM || !financialFormData.whetherOrderProcessed) {
        setFinancialError('Please fill in all fields');
        setFinancialLoading(false);
        return;
      }

      console.log('Submitting:', financialFormData);

      const res = await fetch('/api/financial-creditibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          ...financialFormData,
          orderId: selectedRecordForUpdate?.id
        })
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Response:', text);
        setFinancialError(`Server error: ${text || 'Unknown error'}`);
        setFinancialLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        console.error('Error response:', data);
        setFinancialError(data.message || 'Failed to submit form');
        setFinancialLoading(false);
        return;
      }

      console.log('Financial Credibility saved:', data);
      setStageData({ ...stageData, financialCreditibility: data });
      markStageOnRecord('financialCreditibility', data);
      
      // close modal after submit; user can click Update again to progress
      setCurrentStageModal(null);
      setShowFinancialModal(false);
      setFinancialError('');
      setFinancialLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setFinancialError('Error submitting form: ' + err.message);
      setFinancialLoading(false);
    }
  };

  const handleManagementChange = (e) => {
    const { name, value } = e.target;
    setManagementFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManagementSubmit = async (e) => {
    e.preventDefault();
    setFinancialError('');
    setFinancialLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setFinancialError('No token found. Please login first.');
        setFinancialLoading(false);
        return;
      }

      // Validate all fields are filled
      if (!managementFormData.approvalStatus || !managementFormData.remarks.trim()) {
        setFinancialError('Please fill in all fields');
        setFinancialLoading(false);
        return;
      }

      // Get the financial credibility ID from stageData
      if (!stageData.financialCreditibility?._id) {
        setFinancialError('Financial Credibility record not found. Please go back and resubmit.');
        setFinancialLoading(false);
        return;
      }

      const payload = {
        financialCreditibilityId: stageData.financialCreditibility._id,
        approvalStatus: managementFormData.approvalStatus,
        remarks: managementFormData.remarks,
        orderId: selectedRecordForUpdate?.id
      };

      const res = await fetch('/api/management-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFinancialError(`Server error: Expected JSON. Status: ${res.status}`);
        setFinancialLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setFinancialError(data.message || 'Failed to submit form');
        setFinancialLoading(false);
        return;
      }

      console.log('Management Approval saved:', data);
      setStageData({ ...stageData, managementApproval: data });
      markStageOnRecord('managementApproval', data);
      
      setCurrentStageModal(null);
      setShowFinancialModal(false);
      setFinancialError('');
      setFinancialLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setFinancialError('Error submitting form: ' + err.message);
      setFinancialLoading(false);
    }
  };

  const handleFinalOrderChange = (e) => {
    const { name, value } = e.target;
    setFinalOrderFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFinalOrderSubmit = async (e) => {
    e.preventDefault();
    setFinancialError('');
    setFinancialLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setFinancialError('No token found. Please login first.');
        setFinancialLoading(false);
        return;
      }

      // Validate all required fields
      if (!finalOrderFormData.orderStatus) {
        setFinancialError('Please select Order Status');
        setFinancialLoading(false);
        return;
      }

      if (!finalOrderFormData.finalOrder || !finalOrderFormData.finalOrder.trim()) {
        setFinancialError('Please enter Final Order Details');
        setFinancialLoading(false);
        return;
      }

      if (!finalOrderFormData.partDelivery) {
        setFinancialError('Please select Part Delivery option');
        setFinancialLoading(false);
        return;
      }

      if (finalOrderFormData.orderStatus === 'Support' && !finalOrderFormData.cancelledReason) {
        setFinancialError('Please select a Cancellation Reason');
        setFinancialLoading(false);
        return;
      }

      if (finalOrderFormData.cancelledReason === 'Other' && (!finalOrderFormData.otherReason || !finalOrderFormData.otherReason.trim())) {
        setFinancialError('Please specify the Other Reason');
        setFinancialLoading(false);
        return;
      }

      const payload = {
        ...finalOrderFormData,
        financialCreditibilityId: stageData.financialCreditibility?._id,
        managementApprovalId: stageData.managementApproval?._id,
        orderId: selectedRecordForUpdate?.id
      };

      console.log('Submitting final order:', payload);

      const res = await fetch('/api/final-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFinancialError(`Server error: Expected JSON. Status: ${res.status}`);
        setFinancialLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setFinancialError(data.message || 'Failed to submit form');
        setFinancialLoading(false);
        return;
      }

      console.log('Final Order saved:', data);
      setStageData({ ...stageData, finalOrder: data });
      markStageOnRecord('finalOrder', data);
      
      setCurrentStageModal(null);
      setShowFinancialModal(false);
      setFinancialError('');
      setFinancialLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setFinancialError('Error submitting form: ' + err.message);
      setFinancialLoading(false);
    }
  };

  const handleArrangeVehicleChange = (e) => {
    const { name, value } = e.target;
    setArrangeVehicleFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrangeVehicleSubmit = async (e) => {
    e.preventDefault();
    setFinancialError('');
    setFinancialLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFinancialError('No token found. Please login first.');
        setFinancialLoading(false);
        return;
      }

      const formData = new FormData();
      // Add form fields
      Object.keys(arrangeVehicleFormData).forEach(key => {
        formData.append(key, arrangeVehicleFormData[key]);
      });
      // Add files
      if (arrangeVehicleFiles.loadingAttachment) {
        formData.append('loadingAttachment', arrangeVehicleFiles.loadingAttachment);
      }
      if (arrangeVehicleFiles.challanAttachment) {
        formData.append('challanAttachment', arrangeVehicleFiles.challanAttachment);
      }
      formData.append('finalOrderId', stageData.finalOrder?._id || '');
      formData.append('orderId', selectedRecordForUpdate?.id || '');

      const res = await fetch('/api/arrange-vehicle', {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: formData
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFinancialError(`Server error: Expected JSON. Status: ${res.status}`);
        setFinancialLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setFinancialError(data.message || 'Failed to submit form');
        setFinancialLoading(false);
        return;
      }

      console.log('Arrange Vehicle saved:', data);
      setStageData({ ...stageData, arrangeVehicle: data });
      markStageOnRecord('arrangeVehicle', data);
      
      setCurrentStageModal(null);
      setShowFinancialModal(false);
      setFinancialError('');
      setFinancialLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setFinancialError('Error submitting form: ' + err.message);
      setFinancialLoading(false);
    }
  };

  const handleArrangeVehicleFileChange = (e) => {
    const { name, files } = e.target;
    setArrangeVehicleFiles((prev) => ({
      ...prev,
      [name]: files && files[0] ? files[0] : null
    }));
  };

  const handleBillingFileChange = (e) => {
    const { name, files } = e.target;
    setBillingFiles((prev) => ({
      ...prev,
      [name]: files && files[0] ? files[0] : null
    }));
  };

  const handleReceiptFileChange = (e) => {
    const { name, files } = e.target;
    setReceiptFiles((prev) => ({
      ...prev,
      [name]: files && files[0] ? files[0] : null
    }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    setFinancialError('');
    setFinancialLoading(true);

    // Validate all required fields
    if (!billingFormData.eWayBill) {
      setFinancialError('E-Way Bill is required');
      setFinancialLoading(false);
      return;
    }
    if (!billingFormData.invoiceNo || !billingFormData.invoiceNo.toString().trim()) {
      setFinancialError('Invoice No is required');
      setFinancialLoading(false);
      return;
    }
    if (!billingFormData.invoiceValue || !billingFormData.invoiceValue.toString().trim()) {
      setFinancialError('Invoice Value is required');
      setFinancialLoading(false);
      return;
    }
    if (!billingFormData.eInvoiceGenerated) {
      setFinancialError('E-Invoice Generated status is required');
      setFinancialLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFinancialError('No token found. Please login first.');
        return;
      }

      const formData = new FormData();
      Object.keys(billingFormData).forEach((key) => {
        formData.append(key, billingFormData[key]);
      });
      if (billingFiles.tallyInvoiceCopy) {
        formData.append('tallyInvoiceCopy', billingFiles.tallyInvoiceCopy);
      }
      formData.append('finalOrderId', stageData.finalOrder?._id || '');
      formData.append('orderId', selectedRecordForUpdate?.id || '');

      console.log('Submitting billing form with:', billingFormData);

      const res = await fetch('/api/billing-eway', {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: formData
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.log('Response text:', text);
        setFinancialError(`Server error: Expected JSON. Status: ${res.status}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        let errMsg = data.message || 'Failed to submit form';
        if (data.missing && Array.isArray(data.missing)) {
          errMsg += ' (missing: ' + data.missing.join(', ') + ')';
        }
        if (data.error) {
          errMsg += ' (' + data.error + ')';
        }
        setFinancialError(errMsg);
        return;
      }

      console.log('Billing saved:', data);
      setStageData({ ...stageData, billing: data });
      markStageOnRecord('billing', data);
      
      setCurrentStageModal(null);
      setShowFinancialModal(false);
      setFinancialError('');
      setBillingFormData({ eWayBill: '', invoiceNo: '', invoiceValue: '', eInvoiceGenerated: '' });
      setBillingFiles({ tallyInvoiceCopy: null });
    } catch (err) {
      console.error('Error:', err);
      setFinancialError('Error submitting form: ' + err.message);
    } finally {
      setFinancialLoading(false);
    }
  };

  const handleReceiptChange = (e) => {
    const { name, value } = e.target;
    setReceiptFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    setFinancialError('');
    setFinancialLoading(true);

    try {
      // basic client-side validation to avoid unnecessary API calls
      if (!receiptFormData.clientType) {
        setFinancialError('Please select a client type');
        setFinancialLoading(false);
        return;
      }
      if (!stageData.billing?._id) {
        setFinancialError('Billing information missing - please refresh and try again');
        setFinancialLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setFinancialError('No token found. Please login first.');
        setFinancialLoading(false);
        return;
      }

      const formData = new FormData();
      Object.keys(receiptFormData).forEach(key => {
        formData.append(key, receiptFormData[key]);
      });
      if (receiptFiles.receiptFile) {
        formData.append('receiptFile', receiptFiles.receiptFile);
      }
      formData.append('billingEwayId', stageData.billing?._id || '');
      formData.append('orderId', selectedRecordForUpdate?.id || '');

      const res = await fetch('/api/receipt-from-client', {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: formData
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFinancialError(`Server error: Expected JSON. Status: ${res.status}`);
        setFinancialLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        // if auth failed, clear stored token to force re-login
        if (res.status === 401) {
          localStorage.removeItem('token');
        }
        const msg = data.message || data.msg || data.error || `Failed to submit form (status ${res.status})`;
        setFinancialError(msg);
        setFinancialLoading(false);
        return;
      }

      console.log('Receipt saved:', data);
      setStageData({ ...stageData, receiptFromClient: data });
      markStageOnRecord('receiptFromClient', data);
      // clear local form state so next open is always blank
      setReceiptFormData({ clientType: '' });
      setReceiptFiles({ receiptFile: null });
      setCurrentStageModal(null);
      setShowFinancialModal(false);
      setFinancialError('');
      setFinancialLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setFinancialError('Error submitting form: ' + err.message);
      setFinancialLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setFinancialError('');
    setFinancialLoading(true);

    try {
      // validate field
      if (!statusFormData.materialReachedOnTime) {
        setFinancialError('Please select whether material reached on time');
        setFinancialLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setFinancialError('No token found. Please login first.');
        setFinancialLoading(false);
        return;
      }

      const res = await fetch('/api/status-of-material', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({...statusFormData, orderId: selectedRecordForUpdate?.id})
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFinancialError(`Server error: Expected JSON. Status: ${res.status}`);
        setFinancialLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
        }
        const msg = data.message || data.msg || data.error || `Failed to submit form (status ${res.status})`;
        setFinancialError(msg);
        setFinancialLoading(false);
        return;
      }

      console.log('Status saved:', data);
      setStageData({ ...stageData, statusOfMaterial: data });
      markStageOnRecord('statusOfMaterial', data);
      // reset form for next time on dedicated page
      setStatusFormData({ materialReachedOnTime: '' });
      setCurrentStageModal(null);
      setShowFinancialModal(false);
      setFinancialError('');
      setFinancialLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setFinancialError('Error submitting form: ' + err.message);
      setFinancialLoading(false);
    }
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setFinancialError('');
    setFinancialLoading(true);

    try {
      // validate all fields are filled
      if (!invoiceFormData.priceInvoiceChecked || !invoiceFormData.freightInvoiceChecked || !invoiceFormData.quantityChecked || !invoiceFormData.needToHighlight) {
        setFinancialError('Please fill in all required fields');
        setFinancialLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setFinancialError('No token found. Please login first.');
        setFinancialLoading(false);
        return;
      }

      const res = await fetch('/api/order-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({...invoiceFormData, orderId: selectedRecordForUpdate?.id})
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFinancialError(`Server error: Expected JSON. Status: ${res.status}`);
        setFinancialLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
        }
        const msg = data.message || data.msg || data.error || `Failed to submit form (status ${res.status})`;
        setFinancialError(msg);
        setFinancialLoading(false);
        return;
      }

      console.log('Invoice saved:', data);
      setStageData({ ...stageData, orderInvoice: data });
      markStageOnRecord('orderInvoice', data);
      // reset form for next time on dedicated page
      setInvoiceFormData({
        priceInvoiceChecked: '',
        freightInvoiceChecked: '',
        quantityChecked: '',
        needToHighlight: '',
        remarks: ''
      });
      setCurrentStageModal(null);
      setShowFinancialModal(false);
      setFinancialError('');
      setFinancialLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setFinancialError('Error submitting form: ' + err.message);
      setFinancialLoading(false);
    }
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    setFinancialError('');
    setFinancialLoading(true);

    try {
      // validate required field
      if (!deliveryFormData.informedAboutDelay) {
        setFinancialError('Please select whether customer was informed about delay');
        setFinancialLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setFinancialError('No token found. Please login first.');
        setFinancialLoading(false);
        return;
      }

      const res = await fetch('/api/delivery-info-to-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({...deliveryFormData, orderId: selectedRecordForUpdate?.id})
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFinancialError(`Server error: Expected JSON. Status: ${res.status}`);
        setFinancialLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
        }
        const msg = data.message || data.msg || data.error || `Failed to submit form (status ${res.status})`;
        setFinancialError(msg);
        setFinancialLoading(false);
        return;
      }

      console.log('Delivery saved:', data);
      setStageData({ ...stageData, deliveryInfo: data });
      markStageOnRecord('deliveryInfo', data);
      // reset form for next time on dedicated page
      setDeliveryFormData({ informedAboutDelay: '' });
      setCurrentStageModal(null);
      setShowFinancialModal(false);
      setFinancialError('');
      setFinancialLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setFinancialError('Error submitting form: ' + err.message);
      setFinancialLoading(false);
    }
  }

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFinancialError('');
    setFinancialLoading(true);

    try {
      // validate required field
      if (!feedbackFormData.customerPickedCall) {
        setFinancialError('Please select whether customer picked the call');
        setFinancialLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setFinancialError('No token found. Please login first.');
        setFinancialLoading(false);
        return;
      }

      const res = await fetch('/api/feedback-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({...feedbackFormData, orderId: selectedRecordForUpdate?.id})
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFinancialError(`Server error: Expected JSON. Status: ${res.status}`);
        setFinancialLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
        }
        const msg = data.message || data.msg || data.error || `Failed to submit form (status ${res.status})`;
        setFinancialError(msg);
        setFinancialLoading(false);
        return;
      }

      console.log('Feedback saved:', data);
      setStageData({ ...stageData, feedback: data });
      markStageOnRecord('feedback', data);
      // reset form for next time on dedicated page
      setFeedbackFormData({ customerPickedCall: '' });
      alert('✓ All stages completed successfully! Order processed through all stages.');
      setShowFinancialModal(false);
      setCurrentStageModal(null);
      fetchAllRecords();
      setFinancialLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setFinancialError('Error submitting form: ' + err.message);
      setFinancialLoading(false);
    }
  };

  const closeFinancialModal = () => {
    setShowFinancialModal(false);
    setCurrentStageModal(null);
    setSelectedRecordForUpdate(null);
    setFinancialError('');
    setFinancialFormData({
      overdueOfParty: '',
      creditLimitIfAccess: '',
      informationToCRM: '',
      whetherOrderProcessed: ''
    });
    setStageData({});
  };

  const fetchAllRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch all orders from the orders API
      const res = await fetch('/api/orders', {
        headers: { 'x-auth-token': token }
      });
      
      if (res.ok) {
        const orders = await res.json();
        
        // Transform orders into the expected format
        const enrichedRecords = orders.map((order) => ({
          id: order._id,
          // Use actual stage data from order
          financialCreditibility: order.financialCreditibility || null,
          managementApproval: order.managementApproval || null,
          finalOrder: order.finalOrder || null,
          arrangeVehicle: order.arrangeVehicle || null,
          billing: order.billing || null,
          receiptFromClient: order.receiptFromClient || null,
          statusOfMaterial: order.statusOfMaterial || null,
          orderInvoice: order.orderInvoice || null,
          deliveryInfo: order.deliveryInfo || null,
          feedback: order.feedback || null,
          // preserve order basic fields
          partyName: order.partyName,
          placeCity: order.placeCity,
          contactPerson: order.contactPerson,
          contactNumber: order.contactNumber,
          deliveryType: order.deliveryType,
          orderTakenBy: order.orderTakenBy,
          salesExecutive: order.salesExecutive,
          status: order.status || 'Pending'
        }));

        setRecords(enrichedRecords);
        if (enrichedRecords.length > 0) {
          // pick either first matching filter or default first
          if (activeFilter) {
            const firstMatch = enrichedRecords.find(r => r[activeFilter]);
            setSelectedRecord(firstMatch || enrichedRecords[0]);
          } else {
            setSelectedRecord(enrichedRecords[0]);
          }
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="orders-container full-page" style={{ paddingTop: '0px' }}>
      <div className="orders-content">
        <div className="page-header-orders">
          <h1>{filterStageProp === 'financialCreditibility' ? 'Pending Orders Summary - Financial Creditibility of Party & Material Availability at Godown' : filterStageProp === 'managementApproval' ? 'Over due approval from management' : filterStageProp === 'finalOrder' ? 'Final Order to be Punched' : filterStageProp === 'arrangeVehicle' ? 'Arrange Vehicle & After Loading Material, Inform to Accounts for Billing' : filterStageProp === 'billing' ? 'Billing/E way Bill & intimation to CRM for dispatch' : filterStageProp === 'receiptFromClient' ? 'Receipt from client on Bill or LR from Transporter and inform to CRM and file the receipt copy' : filterStageProp === 'statusOfMaterial' ? 'Check the Staus of the Material whether reached or not as per LR' : filterStageProp === 'orderInvoice' ? 'Check Price of Invoice & Order along with Freight' : filterStageProp === 'deliveryInfo' ? 'Whether Informed to Client About Daley in Dispatch' : filterStageProp === 'feedback' ? 'Feedback Call To Client' : 'Pending Orders Summary'}</h1>
          {filterStageProp !== 'financialCreditibility' && filterStageProp !== 'managementApproval' && filterStageProp !== 'finalOrder' && filterStageProp !== 'arrangeVehicle' && filterStageProp !== 'billing' && filterStageProp !== 'receiptFromClient' && filterStageProp !== 'statusOfMaterial' && filterStageProp !== 'orderInvoice' && filterStageProp !== 'deliveryInfo' && filterStageProp !== 'feedback' && <p className="text-muted">Monitor and manage all pending orders with workflow tracking</p>}
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-box">
            <input
              type="text"
              placeholder=" Search by party name, city, contact, or executive..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select 
              value={filterType} 
              onChange={(e) => {
                setFilterType(e.target.value);
                setFilterValue('');
              }}
              className="filter-select"
            >
              <option value="all">Filter By</option>
              <option value="city">City</option>
              <option value="executive">Sales Executive</option>
              <option value="deliveryType">Delivery Type</option>
              <option value="dateFrom">Date From</option>
              <option value="dateTo">Date To</option>
            </select>

          {filterType === 'city' && (
            <input
              type="text"
              placeholder="Enter city name"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="filter-input"
              style={{
                padding: '10px 12px',
                border: '2px solid rgba(122, 170, 206, 0.2)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1a1a1a',
                background: '#f8f9fa',
                outline: 'none',
                transition: 'all 0.3s ease',
                minWidth: '150px'
              }}
            />
          )}
          {filterType === 'executive' && (
            <input
              type="text"
              placeholder="Enter executive name"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="filter-input"
              style={{
                padding: '10px 12px',
                border: '2px solid rgba(122, 170, 206, 0.2)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1a1a1a',
                background: '#f8f9fa',
                outline: 'none',
                transition: 'all 0.3s ease',
                minWidth: '150px'
              }}
            />
          )}
          {filterType === 'deliveryType' && (
            <input
              type="text"
              placeholder="Enter delivery type"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="filter-input"
              style={{
                padding: '10px 12px',
                border: '2px solid rgba(122, 170, 206, 0.2)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1a1a1a',
                background: '#f8f9fa',
                outline: 'none',
                transition: 'all 0.3s ease',
                minWidth: '150px'
              }}
            />
          )}
          {(filterType === 'dateFrom' || filterType === 'dateTo') && (
            <input
              type="date"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="filter-input"
              style={{
                padding: '10px 12px',
                border: '2px solid rgba(122, 170, 206, 0.2)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1a1a1a',
                background: '#f8f9fa',
                outline: 'none',
                transition: 'all 0.3s ease',
                minWidth: '150px'
              }}
            />
          )}

          {(searchTerm || filterType !== 'all') && (
            <button onClick={handleClearFilters} className="clear-btn" style={{
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}>
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="pending-order-content" style={{ maxWidth: '100%', padding: '0' }}>
        <div className="info-card" style={{ padding: 0, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '16px', color: '#666' }}>Loading...</div>
          ) : displayedRecords.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '16px', color: '#666' }}>No pending orders found</div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f5f5f5',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#333',
                    borderRight: '1px solid #e0e0e0'
                  }}>Order Details</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#333',
                    borderRight: '1px solid #e0e0e0'
                  }}>Party</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#333',
                    borderRight: '1px solid #e0e0e0'
                  }}>City</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#333',
                    borderRight: '1px solid #e0e0e0'
                  }}>Contact</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#333',
                    borderRight: '1px solid #e0e0e0'
                  }}>Sales Executive</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#333',
                    borderRight: '1px solid #e0e0e0'
                  }}>Delivery Type</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#333',
                    borderRight: '1px solid #e0e0e0'
                  }}>Date Created</th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#333'
                  }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedRecords.map((record, index) => {
                  const statusLabel = getOrderStatus(record);
                  const isCompleted = statusLabel === 'Completed';
                  return (
                  <tr key={record.id} style={{
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#fafafa'}
                  >
                    <td style={{
                      padding: '12px',
                      borderRight: '1px solid #e0e0e0',
                      color: '#555'
                    }}>{getOrderDetails(record)}</td>
                    <td style={{
                      padding: '12px',
                      borderRight: '1px solid #e0e0e0',
                      color: '#333'
                    }}>{record.partyName || '-'}</td>
                    <td style={{
                      padding: '12px',
                      borderRight: '1px solid #e0e0e0',
                      color: '#333'
                    }}>{record.placeCity || '-'}</td>
                    <td style={{
                      padding: '12px',
                      borderRight: '1px solid #e0e0e0',
                      color: '#333'
                    }}>{(record.contactPerson ? record.contactPerson + (record.contactNumber ? ' / ' : '') : '') + (record.contactNumber || '') || '-'}</td>
                    <td style={{
                      padding: '12px',
                      borderRight: '1px solid #e0e0e0',
                      color: '#333'
                    }}>{record.salesExecutive || record.orderTakenBy || '-'}</td>
                    <td style={{
                      padding: '12px',
                      borderRight: '1px solid #e0e0e0',
                      color: '#333',
                      borderRight: '1px solid #e0e0e0'
                    }}>{record.deliveryType || '-'}</td>
                    <td style={{
                      padding: '12px',
                      borderRight: '1px solid #e0e0e0',
                      color: '#999',
                      fontSize: '12px'
                    }}>{new Date(record.feedback?.dateCreated).toLocaleDateString()}</td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center'
                    }}>
                      <button
                        onClick={() => handleUpdateClick(record)}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '12px',
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transformOrigin = 'center';
                          e.target.style.transform = 'scale(1.05)';
                          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                        }}
                      >
                        {isCompleted ? '✏️ Edit' : '📝 Update'}
                      </button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Financial Credibility Modal */}
      {showFinancialModal && (
        <div className="modal-overlay" onClick={closeFinancialModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h3>
                  {currentStageModal === 'financial' && '1. Financial Credibility'}
                  {currentStageModal === 'management' && '2. Management Approval'}
                  {currentStageModal === 'finalOrder' && '3. Final Order'}
                  {currentStageModal === 'arrangeVehicle' && '4. Arrange Vehicle'}
                  {currentStageModal === 'billing' && '5. Billing & E-Way'}
                  {currentStageModal === 'receipt' && '6. Receipt from Client'}
                  {currentStageModal === 'status' && '7. Status of Material'}
                  {currentStageModal === 'invoice' && '8. Order Invoice'}
                  {currentStageModal === 'delivery' && '9. Delivery Information'}
                  {currentStageModal === 'feedback' && '10. Feedback Call'}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                  Order #{selectedRecordForUpdate?.id.slice(-6).toUpperCase()}
                </p>
              </div>
              <button
                onClick={closeFinancialModal}
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Scrollable Content Area */}
            <div className="modal-body" ref={modalBodyRef}>
              {/* FINANCIAL CREDIBILITY FORM */}
              {currentStageModal === 'financial' && (
              <form onSubmit={handleFinancialSubmit}>
                {financialError && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>{financialError}</div>}
                
                <div className="form-section">
                  <label>Is there any Overdue of Party <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="overdueOfParty" value="Yes" checked={financialFormData.overdueOfParty === 'Yes'} onChange={handleFinancialChange} required style={{ marginRight: '8px' }} />Yes</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="overdueOfParty" value="No" checked={financialFormData.overdueOfParty === 'No'} onChange={handleFinancialChange} required style={{ marginRight: '8px' }} />No</label>
                  </div>
                </div>
                
                <div className="form-section">
                  <label>Credit Limit If Access <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="creditLimitIfAccess" value="Yes" checked={financialFormData.creditLimitIfAccess === 'Yes'} onChange={handleFinancialChange} required style={{ marginRight: '8px' }} />Yes</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="creditLimitIfAccess" value="No" checked={financialFormData.creditLimitIfAccess === 'No'} onChange={handleFinancialChange} required style={{ marginRight: '8px' }} />No</label>
                  </div>
                </div>
                
                <div className="form-section">
                  <label>Information to CRM for any kind of deficiency <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="informationToCRM" value="Yes" checked={financialFormData.informationToCRM === 'Yes'} onChange={handleFinancialChange} required style={{ marginRight: '8px' }} />Yes</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="informationToCRM" value="No" checked={financialFormData.informationToCRM === 'No'} onChange={handleFinancialChange} required style={{ marginRight: '8px' }} />No</label>
                  </div>
                </div>
                
                <div className="form-section">
                  <label>Whether order can be processed? <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="whetherOrderProcessed" value="Yes" checked={financialFormData.whetherOrderProcessed === 'Yes'} onChange={handleFinancialChange} required style={{ marginRight: '8px' }} />Yes</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="whetherOrderProcessed" value="No" checked={financialFormData.whetherOrderProcessed === 'No'} onChange={handleFinancialChange} required style={{ marginRight: '8px' }} />No</label>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" onClick={closeFinancialModal} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={financialLoading} className="submit-btn">{financialLoading ? 'Submitting...' : 'Submit'}</button>
                </div>
              </form>
              )}

              {/* MANAGEMENT APPROVAL FORM */}
              {currentStageModal === 'management' && (
              <form onSubmit={handleManagementSubmit}>
                {financialError && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>{financialError}</div>}
                
                <div className="form-section">
                  <label>Approval Status <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="approvalStatus" value="Approved" checked={managementFormData.approvalStatus === 'Approved'} onChange={handleManagementChange} required style={{ marginRight: '8px' }} />Approved</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="approvalStatus" value="Rejected" checked={managementFormData.approvalStatus === 'Rejected'} onChange={handleManagementChange} required style={{ marginRight: '8px' }} />Rejected</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="approvalStatus" value="Hold By Management" checked={managementFormData.approvalStatus === 'Hold By Management'} onChange={handleManagementChange} required style={{ marginRight: '8px' }} />Hold By Management</label>
                  </div>
                </div>
                
                <div className="form-section">
                  <label>Remarks <span style={{ color: '#d32f2f' }}>*</span></label>
                  <textarea name="remarks" value={managementFormData.remarks} onChange={handleManagementChange} placeholder="Enter remarks..." required rows="4" />
                </div>
                
                <div className="modal-footer">
                  <button type="button" onClick={closeFinancialModal} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={financialLoading} className="submit-btn">{financialLoading ? 'Submitting...' : 'Submit'}</button>
                </div>
              </form>
              )}

              {/* FINAL ORDER FORM */}
              {currentStageModal === 'finalOrder' && (
              <form onSubmit={handleFinalOrderSubmit}>
                {financialError && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>{financialError}</div>}
                
                <div className="form-section">
                  <label>Order Status <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="orderStatus" value="Proceed" checked={finalOrderFormData.orderStatus === 'Proceed'} onChange={handleFinalOrderChange} required style={{ marginRight: '8px' }} />Proceed</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="orderStatus" value="Support" checked={finalOrderFormData.orderStatus === 'Support'} onChange={handleFinalOrderChange} required style={{ marginRight: '8px' }} />Support</label>
                  </div>
                </div>
                
                {finalOrderFormData.orderStatus === 'Support' && (
                <div className="form-section">
                  <label>Cancellation Reason <span style={{ color: '#d32f2f' }}>*</span></label>
                  <select name="cancelledReason" value={finalOrderFormData.cancelledReason} onChange={handleFinalOrderChange} required>
                    <option value="">Select...</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                )}
                
                {finalOrderFormData.cancelledReason === 'Other' && (
                <div className="form-section">
                  <label>Other Reason <span style={{ color: '#d32f2f' }}>*</span></label>
                  <textarea name="otherReason" value={finalOrderFormData.otherReason} onChange={handleFinalOrderChange} placeholder="Please specify..." required rows="3" />
                </div>
                )}
                
                <div className="form-section">
                  <label>Final Order Details <span style={{ color: '#d32f2f' }}>*</span></label>
                  <textarea name="finalOrder" value={finalOrderFormData.finalOrder} onChange={handleFinalOrderChange} placeholder="Enter final order details..." required rows="4" />
                </div>
                
                <div className="form-section">
                  <label>Part Delivery <span style={{ color: '#d32f2f' }}>*</span></label>
                  <select name="partDelivery" value={finalOrderFormData.partDelivery} onChange={handleFinalOrderChange} required>
                    <option value="">Select part delivery option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                
                <div className="modal-footer">
                  <button type="button" onClick={closeFinancialModal} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={financialLoading} className="submit-btn">{financialLoading ? 'Submitting...' : 'Submit'}</button>
                </div>
              </form>
              )}

              {/* ARRANGE VEHICLE FORM */}
              {currentStageModal === 'arrangeVehicle' && (
              <form onSubmit={handleArrangeVehicleSubmit}>
                {financialError && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>{financialError}</div>}
                <div className="form-section">
                  <label>Vehicle Arrangement Details <span style={{ color: '#d32f2f' }}>*</span></label>
                  <textarea name="vehicleArrangementDetails" value={arrangeVehicleFormData.vehicleArrangementDetails} onChange={handleArrangeVehicleChange} placeholder="Enter vehicle arrangement details..." required rows="4" />
                </div>
                <div className="form-section">
                  <label>Vehicle Type</label>
                  <input type="text" name="vehicleType" value={arrangeVehicleFormData.vehicleType} onChange={handleArrangeVehicleChange} placeholder="e.g., Truck, Van, etc." />
                </div>
                <div className="form-section">
                  <label>Vehicle Number</label>
                  <input type="text" name="vehicleNumber" value={arrangeVehicleFormData.vehicleNumber} onChange={handleArrangeVehicleChange} placeholder="e.g., MH01AB1234" />
                </div>
                <div className="form-section">
                  <label>Driver Name <span style={{ color: '#d32f2f' }}>*</span></label>
                  <input type="text" name="driverName" value={arrangeVehicleFormData.driverName} onChange={handleArrangeVehicleChange} placeholder="Enter driver name" required />
                </div>
                <div className="form-section">
                  <label>Driver Phone <span style={{ color: '#d32f2f' }}>*</span></label>
                  <input type="tel" name="driverPhone" value={arrangeVehicleFormData.driverPhone} onChange={handleArrangeVehicleChange} placeholder="Enter driver phone number" required />
                </div>
                <div className="form-section">
                  <label>Delivery Type <span style={{ color: '#d32f2f' }}>*</span></label>
                  <select name="deliveryType" value={arrangeVehicleFormData.deliveryType} onChange={handleArrangeVehicleChange} required>
                    <option value="">Select delivery type</option>
                    <option value="Through LR for Outstation delivery">Through LR for Outstation delivery</option>
                    <option value="Local Vehicle for local delivery">Local Vehicle for local delivery</option>
                    <option value="Client Own Vehicle">Client Own Vehicle</option>
                  </select>
                </div>
                <div className="form-section">
                  <label>Remark <span style={{ color: '#d32f2f' }}>*</span></label>
                  <textarea name="remark" value={arrangeVehicleFormData.remark} onChange={handleArrangeVehicleChange} placeholder="Enter remarks..." required rows="4" />
                </div>
                <div className="form-section">
                  <label>Actual Freight Amount Paid <span style={{ color: '#d32f2f' }}>*</span></label>
                  <input type="number" name="actualFreight" value={arrangeVehicleFormData.actualFreight} onChange={handleArrangeVehicleChange} placeholder="Enter amount" required />
                </div>
                <div className="form-section">
                  <label>Upload Attachment of Loading <span style={{ color: '#d32f2f' }}>*</span></label>
                  <input type="file" name="loadingAttachment" accept="image/*" onChange={handleArrangeVehicleFileChange} required />
                </div>
                <div className="form-section">
                  <label>Challan Upload <span style={{ color: '#d32f2f' }}>*</span></label>
                  <input type="file" name="challanAttachment" accept="image/*" onChange={handleArrangeVehicleFileChange} required />
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={closeFinancialModal} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={financialLoading} className="submit-btn">{financialLoading ? 'Submitting...' : 'Submit'}</button>
                </div>
              </form>
              )}

              {/* BILLING FORM */}
              {currentStageModal === 'billing' && (
              <form onSubmit={handleBillingSubmit}>
                {financialError && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>{financialError}</div>}
                <div className="form-section">
                  <label>E-Way Bill <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="eWayBill" value="Yes" checked={billingFormData.eWayBill === 'Yes'} onChange={handleBillingChange} required style={{ marginRight: '8px' }} />Yes</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="eWayBill" value="No" checked={billingFormData.eWayBill === 'No'} onChange={handleBillingChange} required style={{ marginRight: '8px' }} />No</label>
                  </div>
                </div>
                <div className="form-section">
                  <label>Invoice No <span style={{ color: '#d32f2f' }}>*</span></label>
                  <input type="text" name="invoiceNo" value={billingFormData.invoiceNo} onChange={handleBillingChange} placeholder="Enter invoice number" required />
                </div>
                <div className="form-section">
                  <label>Invoice Value <span style={{ color: '#d32f2f' }}>*</span></label>
                  <input type="number" name="invoiceValue" value={billingFormData.invoiceValue} onChange={handleBillingChange} placeholder="Enter invoice value" required />
                </div>
                <div className="form-section">
                  <label>E-Invoice Generated <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="eInvoiceGenerated" value="Yes" checked={billingFormData.eInvoiceGenerated === 'Yes'} onChange={handleBillingChange} required style={{ marginRight: '8px' }} />Yes</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="eInvoiceGenerated" value="No" checked={billingFormData.eInvoiceGenerated === 'No'} onChange={handleBillingChange} required style={{ marginRight: '8px' }} />No</label>
                  </div>
                </div>
                <div className="form-section">
                  <label>Tally Invoice Copy</label>
                  <input type="file" name="tallyInvoiceCopy" accept="image/*,application/pdf" onChange={handleBillingFileChange} />
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={closeFinancialModal} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={financialLoading} className="submit-btn">{financialLoading ? 'Submitting...' : 'Submit'}</button>
                </div>
              </form>
              )}

              {/* RECEIPT FORM */}
              {currentStageModal === 'receipt' && (
              <form onSubmit={handleReceiptSubmit}>
                {financialError && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>{financialError}</div>}
                <div className="form-section">
                  <label>Client Type <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="clientType" value="Local" checked={receiptFormData.clientType === 'Local'} onChange={handleReceiptChange} required style={{ marginRight: '8px' }} />Local</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="clientType" value="Outstation" checked={receiptFormData.clientType === 'Outstation'} onChange={handleReceiptChange} required style={{ marginRight: '8px' }} />Outstation</label>
                  </div>
                </div>
                <div className="form-section">
                  <label>Receipt File</label>
                  <input type="file" name="receiptFile" accept="image/*,application/pdf" onChange={handleReceiptFileChange} />
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={closeFinancialModal} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={financialLoading} className="submit-btn">{financialLoading ? 'Submitting...' : 'Submit'}</button>
                </div>
              </form>
              )}

              {/* STATUS FORM */}
              {currentStageModal === 'status' && (
              <form onSubmit={handleStatusSubmit}>
                {financialError && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>{financialError}</div>}
                <div className="form-section">
                  <label>Material Reached on Time <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="materialReachedOnTime" value="On Time" checked={statusFormData.materialReachedOnTime === 'On Time'} onChange={handleStatusChange} required style={{ marginRight: '8px' }} />On Time</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="materialReachedOnTime" value="Delay" checked={statusFormData.materialReachedOnTime === 'Delay'} onChange={handleStatusChange} required style={{ marginRight: '8px' }} />Delay</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={closeFinancialModal} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={financialLoading} className="submit-btn">{financialLoading ? 'Submitting...' : 'Submit'}</button>
                </div>
              </form>
              )}

              {/* INVOICE FORM */}
              {currentStageModal === 'invoice' && (
              <form onSubmit={handleInvoiceSubmit}>
                {financialError && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>{financialError}</div>}
                <div className="form-section">
                  <label>Price Checked <span style={{ color: '#d32f2f' }}>*</span></label>
                  <select name="priceInvoiceChecked" value={invoiceFormData.priceInvoiceChecked} onChange={handleInvoiceChange} required>
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-section">
                  <label>Freight Checked <span style={{ color: '#d32f2f' }}>*</span></label>
                  <select name="freightInvoiceChecked" value={invoiceFormData.freightInvoiceChecked} onChange={handleInvoiceChange} required>
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-section">
                  <label>Quantity Checked <span style={{ color: '#d32f2f' }}>*</span></label>
                  <select name="quantityChecked" value={invoiceFormData.quantityChecked} onChange={handleInvoiceChange} required>
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-section">
                  <label>Need to Highlight <span style={{ color: '#d32f2f' }}>*</span></label>
                  <select name="needToHighlight" value={invoiceFormData.needToHighlight} onChange={handleInvoiceChange} required>
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-section">
                  <label>Remarks</label>
                  <textarea name="remarks" value={invoiceFormData.remarks} onChange={handleInvoiceChange} placeholder="Enter remarks..." rows="3" />
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={closeFinancialModal} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={financialLoading} className="submit-btn">{financialLoading ? 'Submitting...' : 'Submit'}</button>
                </div>
              </form>
              )}

              {/* DELIVERY FORM */}
              {currentStageModal === 'delivery' && (
              <form onSubmit={handleDeliverySubmit}>
                {financialError && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>{financialError}</div>}
                <div className="form-section">
                  <label>Informed About Delay <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="informedAboutDelay" value="Yes" checked={deliveryFormData.informedAboutDelay === 'Yes'} onChange={handleDeliveryChange} required style={{ marginRight: '8px' }} />Yes</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="informedAboutDelay" value="No" checked={deliveryFormData.informedAboutDelay === 'No'} onChange={handleDeliveryChange} required style={{ marginRight: '8px' }} />No</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={closeFinancialModal} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={financialLoading} className="submit-btn">{financialLoading ? 'Submitting...' : 'Submit'}</button>
                </div>
              </form>
              )}

              {/* FEEDBACK FORM */}
              {currentStageModal === 'feedback' && (
              <form onSubmit={handleFeedbackSubmit}>
                {financialError && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px' }}>{financialError}</div>}
                <div className="form-section">
                  <label>Whether Customer Picked The Call <span style={{ color: '#d32f2f' }}>*</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="customerPickedCall" value="Picked" checked={feedbackFormData.customerPickedCall === 'Picked'} onChange={handleFeedbackChange} required style={{ marginRight: '8px' }} />Picked</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="customerPickedCall" value="Not Picked" checked={feedbackFormData.customerPickedCall === 'Not Picked'} onChange={handleFeedbackChange} required style={{ marginRight: '8px' }} />Not Picked</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="customerPickedCall" value="Branch" checked={feedbackFormData.customerPickedCall === 'Branch'} onChange={handleFeedbackChange} required style={{ marginRight: '8px' }} />Branch</label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}><input type="radio" name="customerPickedCall" value="Cus Not Yet Received Stock" checked={feedbackFormData.customerPickedCall === 'Cus Not Yet Received Stock'} onChange={handleFeedbackChange} required style={{ marginRight: '8px' }} />Cus Not Yet Received Stock</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" onClick={closeFinancialModal} className="cancel-btn">Cancel</button>
                  <button type="submit" disabled={financialLoading} className="submit-btn">{financialLoading ? 'Completing...' : 'Complete All Stages'}</button>
                </div>
              </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  </div>
  );
};

export default PendingOrderSummary;
