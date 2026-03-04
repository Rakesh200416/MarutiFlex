import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, fetchOrderDetails } from '../redux/pendingOrdersSlice';
import './Settings.css';

const Settings = () => {
  const dispatch = useDispatch();
  const { orders, ordersLoading, orderDetails, detailsLoading, error } = useSelector(state => state.pendingOrders);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectTimeoutId, setSelectTimeoutId] = useState(null);

  // fetch just the orders list quickly
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // when orders arrive, pick the first one
  useEffect(() => {
    if (orders.length > 0 && !selectedOrderId) {
      const firstId = orders[0]._id;
      setSelectedOrderId(firstId);
      dispatch(fetchOrderDetails(firstId));
    }
  }, [orders, selectedOrderId, dispatch]);

  // debounced order selection to prevent excessive API calls
  const handleOrderSelect = useCallback((orderId) => {
    setSelectedOrderId(orderId);
    
    if (selectTimeoutId) {
      clearTimeout(selectTimeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      dispatch(fetchOrderDetails(orderId));
    }, 300); // 300ms debounce delay
    
    setSelectTimeoutId(timeoutId);
  }, [dispatch, selectTimeoutId]);

  // when orderDetails are fetched, populate selectedOrder
  useEffect(() => {
    if (orderDetails && orderDetails.order && orderDetails.order._id === selectedOrderId) {
      setSelectedOrder(orderDetails);
    }
  }, [orderDetails, selectedOrderId]);

  const workflowSteps = [
    { key: 'financialCreditibility', label: 'Financial Creditibility', icon: '💰' },
    { key: 'managementApproved', label: 'Management Approved', icon: '✅' },
    { key: 'finalOrder', label: 'Final Order', icon: '📋' },
    { key: 'arrangeVehicle', label: 'Arrange Vehicle', icon: '🚚' },
    { key: 'billingEway', label: 'Billing & E-way', icon: '💳' },
    { key: 'receiptFromClient', label: 'Receipt from Client', icon: '📄' },
    { key: 'statusMaterial', label: 'Status of Material', icon: '📦' },
    { key: 'orderInvoice', label: 'Order Invoice', icon: '🧾' },
    { key: 'deliveryInfo', label: 'Delivery Information', icon: '🚛' },
    { key: 'feedbackCall', label: 'Feedback Call', icon: '📞' },
  ];

  const calculateProgress = (orderData) => {
    // Check if this is from the detailed order response which has workflow data
    if (orderData.financialCreditibility !== undefined) {
      const completed = workflowSteps.filter(step => orderData[step.key]).length;
      return (completed / workflowSteps.length) * 100;
    }
    
    // For basic orders list, return 0 since workflow data not loaded yet
    return 0;
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return 'bg-red-500';
    if (progress < 30) return 'bg-orange-500';
    if (progress < 60) return 'bg-yellow-500';
    if (progress < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (ordersLoading) {
    // only waiting for basic list
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-300 text-xl font-semibold">Loading Orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md w-full">
          <h3 className="text-xl font-bold text-red-300">Error Loading Dashboard</h3>
          <p className="text-red-200/80">{error}</p>
        </div>
      </div>
    );
  }

  const getCompletedOrdersCount = () => {
    return orders.filter(o => {
      const workflowCount = workflowSteps.filter(step => o[step.key]).length;
      return workflowCount === workflowSteps.length;
    }).length;
  };

  const getInProgressOrdersCount = () => {
    return orders.filter(o => {
      const workflowCount = workflowSteps.filter(step => o[step.key]).length;
      return workflowCount > 0 && workflowCount < workflowSteps.length;
    }).length;
  };

  const getNotStartedOrdersCount = () => {
    return orders.filter(o => {
      const workflowCount = workflowSteps.filter(step => o[step.key]).length;
      return workflowCount === 0;
    }).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      {/* Header */}
      <div className="header-container">
        <h1 className="header-title">Order Management</h1>
        <p className="header-subtitle">Monitor and manage all pending orders with workflow tracking</p>
      </div>

      {/* Stats Section (cards row) */}
      <div className="dashboard-stats">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg,#ffc107,#e0a800)', color: '#000' }}>
          <span className="stat-title">Total Orders:</span>
          <span className="stat-value">{orders.length}</span>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg,#ffc107,#e0a800)', color: '#000' }}>
          <span className="stat-title">Completed:</span>
          <span className="stat-value">{getCompletedOrdersCount()}</span>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg,#ffc107,#e0a800)', color: '#000' }}>
          <span className="stat-title">In Progress:</span>
          <span className="stat-value">{getInProgressOrdersCount()}</span>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg,#ffc107,#e0a800)', color: '#000' }}>
          <span className="stat-title">Not Started:</span>
          <span className="stat-value">{getNotStartedOrdersCount()}</span>
        </div>
      </div>

      {/* Main two-column card */}
      <div className="settings-card full-height">
        <div className="settings-layout">
          {/* Left panel */}
          <div className="settings-list">
            <div className="settings-list-header">
              <h3>All Orders <span className="settings-count">({orders.length})</span></h3>
            </div>
            {orders.length === 0 ? (
              <div className="empty-state p-6 text-center flex-1 flex items-center justify-center">
                <p>No orders found</p>
              </div>
            ) : (
              <div className="order-list-body divide-y divide-slate-700 flex-1 overflow-y-auto">
                {orders.map((orderData, index) => {
                  // some API responses wrap the order object in an `order` field;
                  // normalize so `ord` always contains the core document
                  const ord = orderData.order || orderData;
                  const workflowCount = workflowSteps.filter(step => orderData[step.key]).length;
                  const progress = (workflowCount / workflowSteps.length) * 100;
                  const isSelected = selectedOrder?.order._id === ord._id;
                  
                  // Helper to safely get string values
                  const getStringValue = (val, fallback = '') => typeof val === 'string' ? val : fallback;
                  const getDateString = (dateVal) => {
                    try {
                      return typeof dateVal === 'string' ? new Date(dateVal).toLocaleDateString() : 'N/A';
                    } catch {
                      return 'N/A';
                    }
                  };
                  
                  return (
                    <div
                      key={ord._id}
                      onClick={() => handleOrderSelect(ord._id)}
                      className={"order-item " + (isSelected ? 'selected' : '')}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <div className="order-item-top">
                        <strong className="order-party">{getStringValue(ord.customerName, `Order #${index+1}`)}</strong>
                        <span className="order-value">₹{typeof ord.orderValue === 'number' ? ord.orderValue : '0'}</span>
                      </div>
                      <div className="order-item-bottom">
                        <span className="order-city">{getStringValue(ord.from)}</span>
                        <span className="order-date">{getDateString(ord.updatedAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        {/* Right Column - Order Details */}
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden'}}>
          {selectedOrder ? (
            <>
              {/* Top Row - ID and Progress */}
              <div style={{display: 'flex', gap: '1.5rem', padding: '1.5rem', flexShrink: 0}}>
                {/* ID Box */}
                <div style={{flex: 1, background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(100, 116, 139, 0.5)', borderRadius: '0.5rem', padding: '1rem'}}>
                  <div style={{color: '#9ca3af', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.5rem'}}>Order ID</div>
                  <div style={{color: '#ffffff', fontWeight: 'bold', fontSize: '1.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{typeof selectedOrder.order._id === 'string' ? selectedOrder.order._id : 'N/A'}</div>
                </div>
                
                {/* Progress Box */}
                <div style={{flex: 1, background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(100, 116, 139, 0.5)', borderRadius: '0.5rem', padding: '1rem'}}>
                  <div style={{color: '#9ca3af', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.5rem'}}>Progress</div>
                  <div style={{color: '#ffffff', fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem'}}>{Math.round(calculateProgress(selectedOrder))}%</div>
                  <div style={{width: '100%', background: 'rgba(71, 85, 105, 0.5)', borderRadius: '9999px', height: '0.375rem'}}>
                    <div 
                      style={{background: '#22c55e', height: '0.375rem', borderRadius: '9999px', transition: 'width 0.3s', width: `${calculateProgress(selectedOrder)}%`}}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Two Boxes */}
              <div style={{display: 'flex', gap: '1.5rem', padding: '0 1.5rem 1.5rem 1.5rem', flex: 1, minHeight: 0, overflow: 'hidden'}}>
                {/* Order Information Box */}
                <div style={{flex: 1, background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(100, 116, 139, 0.5)', borderRadius: '0.5rem', padding: '1.25rem', overflow: 'auto', minWidth: 0}}>
                  <h3 style={{color: '#cbd5e1', fontWeight: '600', marginBottom: '1rem', fontSize: '1.125rem', position: 'sticky', top: 0, background: 'rgba(30, 41, 59, 0.8)', marginLeft: '-1.25rem', marginRight: '-1.25rem', paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.5rem', paddingBottom: '0.5rem'}}>📦 Order Information</h3>
                  <div style={{marginTop: '0.5rem'}}>
                    {selectedOrder.order.customerName && (
                      <div style={{marginBottom: '1rem'}}>
                        <span style={{color: '#9ca3af', fontSize: '0.75rem', fontWeight: '500', display: 'block'}}>Customer Name</span>
                        <p style={{color: '#ffffff', fontWeight: '600', marginTop: '0.25rem', margin: '0.25rem 0 0 0'}}>{typeof selectedOrder.order.customerName === 'string' ? selectedOrder.order.customerName : 'N/A'}</p>
                      </div>
                    )}
                    {selectedOrder.order.orderValue && (
                      <div style={{marginBottom: '1rem'}}>
                        <span style={{color: '#9ca3af', fontSize: '0.75rem', fontWeight: '500', display: 'block'}}>Order Value</span>
                        <p style={{color: '#ffffff', fontWeight: '600', marginTop: '0.25rem', margin: '0.25rem 0 0 0'}}>₹ {typeof selectedOrder.order.orderValue === 'number' ? selectedOrder.order.orderValue : 'N/A'}</p>
                      </div>
                    )}
                    {selectedOrder.order.from && (
                      <div style={{marginBottom: '1rem'}}>
                        <span style={{color: '#9ca3af', fontSize: '0.75rem', fontWeight: '500', display: 'block'}}>From</span>
                        <p style={{color: '#ffffff', fontWeight: '600', marginTop: '0.25rem', margin: '0.25rem 0 0 0'}}>{typeof selectedOrder.order.from === 'string' ? selectedOrder.order.from : 'N/A'}</p>
                      </div>
                    )}
                    {selectedOrder.order.to && (
                      <div style={{marginBottom: '1rem'}}>
                        <span style={{color: '#9ca3af', fontSize: '0.75rem', fontWeight: '500', display: 'block'}}>To</span>
                        <p style={{color: '#ffffff', fontWeight: '600', marginTop: '0.25rem', margin: '0.25rem 0 0 0'}}>{typeof selectedOrder.order.to === 'string' ? selectedOrder.order.to : 'N/A'}</p>
                      </div>
                    )}
                    {selectedOrder.order.status && (
                      <div>
                        <span style={{color: '#9ca3af', fontSize: '0.75rem', fontWeight: '500', display: 'block'}}>Status</span>
                        <span style={{fontWeight: '600', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.75rem', display: 'inline-block', marginTop: '0.5rem', background: selectedOrder.order.status === 'Completed' ? 'rgba(34, 197, 94, 0.2)' : selectedOrder.order.status === 'Pending' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: selectedOrder.order.status === 'Completed' ? '#86efac' : selectedOrder.order.status === 'Pending' ? '#fcd34d' : '#93c5fd'}}>
                          {typeof selectedOrder.order.status === 'string' ? selectedOrder.order.status : 'Unknown'}
                        </span>
                      </div>
                    )}
                    <div style={{fontSize: '0.75rem', color: '#949ca6', paddingTop: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid rgba(107, 114, 128, 0.5)'}}>
                      <p style={{margin: 0}}>Last Updated: {selectedOrder.order.updatedAt && typeof selectedOrder.order.updatedAt === 'string' ? new Date(selectedOrder.order.updatedAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Workflow Status Box */}
                <div style={{flex: 1, background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(100, 116, 139, 0.5)', borderRadius: '0.5rem', padding: '1.25rem', overflow: 'auto', minWidth: 0}}>
                  <h3 style={{color: '#cbd5e1', fontWeight: '600', marginBottom: '1rem', fontSize: '1.125rem', position: 'sticky', top: 0, background: 'rgba(30, 41, 59, 0.8)', marginLeft: '-1.25rem', marginRight: '-1.25rem', paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingTop: '0.5rem', paddingBottom: '0.5rem'}}>🔄 Workflow Status</h3>
                  <div style={{marginTop: '0.5rem'}}>
                    {workflowSteps.map((step) => {
                      const isCompleted = selectedOrder[step.key];
                      return (
                        <div key={step.key} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', marginBottom: '0.375rem', borderRadius: '0.25rem', fontSize: '0.875rem', cursor: 'pointer', transition: 'background 0.2s'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0}}>
                            <span style={{fontSize: '1rem', flexShrink: 0}}>{step.icon}</span>
                            <span style={{fontWeight: '600', color: isCompleted ? '#86efac' : '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{step.label}</span>
                          </div>
                          <span style={{fontSize: '1rem', flexShrink: 0, marginLeft: '0.5rem', color: isCompleted ? '#22c55e' : '#949ca6'}}>
                            {isCompleted ? '✓' : '○'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-400">Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
