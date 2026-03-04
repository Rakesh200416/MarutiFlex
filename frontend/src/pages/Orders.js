import React, { useState, useEffect } from 'react';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
      else setOrders([]);
    } catch (err) {
      console.error('Fetch Error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (filteredOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(filteredOrders[0]);
    }
  }, [orders, filterType, filterValue, searchTerm]);

  // Filter and search logic
  const filteredOrders = orders.filter((order) => {
    // Search term filter - searches across multiple fields
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm ||
      order.partyName?.toLowerCase().includes(searchLower) ||
      order.placeCity?.toLowerCase().includes(searchLower) ||
      order.contactPerson?.toLowerCase().includes(searchLower) ||
      order.contactNumber?.includes(searchTerm) ||
      order.salesExecutive?.toLowerCase().includes(searchLower) ||
      order.orderTakenBy?.toLowerCase().includes(searchLower);

    // Filter type specific filters
    let matchesFilter = true;
    if (filterType === 'city' && filterValue) {
      matchesFilter = order.placeCity?.toLowerCase() === filterValue.toLowerCase();
    } else if (filterType === 'executive' && filterValue) {
      matchesFilter = order.salesExecutive?.toLowerCase().includes(filterValue.toLowerCase());
    } else if (filterType === 'deliveryType' && filterValue) {
      matchesFilter = order.deliveryType?.toLowerCase() === filterValue.toLowerCase();
    } else if (filterType === 'dateFrom' && filterValue) {
      const orderDate = new Date(order.dateCreated);
      const filterDate = new Date(filterValue);
      matchesFilter = orderDate >= filterDate;
    } else if (filterType === 'dateTo' && filterValue) {
      const orderDate = new Date(order.dateCreated);
      const filterDate = new Date(filterValue);
      matchesFilter = orderDate <= filterDate;
    }

    return matchesSearch && matchesFilter;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterValue('');
  };

  if (loading) return (
    <div className="orders-container">
      <div className="loading-spinner">Loading...</div>
    </div>
  );

  return (
    <div className="orders-container full-page">
      <div className="orders-content">
        <div className="page-header-orders">
          <h1>Orders</h1>
          <p className="text-muted">All orders — select one to view full details</p>
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
              />
            )}
            {filterType === 'executive' && (
              <input
                type="text"
                placeholder="Enter executive name"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="filter-input"
              />
            )}
            {filterType === 'deliveryType' && (
              <input
                type="text"
                placeholder="Enter delivery type"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="filter-input"
              />
            )}
            {(filterType === 'dateFrom' || filterType === 'dateTo') && (
              <input
                type="date"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="filter-input"
              />
            )}

            {(searchTerm || filterType !== 'all') && (
              <button onClick={handleClearFilters} className="clear-btn">
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="orders-card full-height">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <p>{orders.length === 0 ? 'No orders found.' : 'No orders match your filters.'}</p>
            </div>
          ) : (
            <div className="orders-layout">
              <div className="orders-list">
                <div className="orders-list-header">
                  <h3>All Orders <span className="orders-count">({filteredOrders.length})</span></h3>
                </div>
                {filteredOrders.map((o) => (
                  <div
                    key={o._id}
                    className={"order-item " + (selectedOrder && selectedOrder._id === o._id ? 'selected' : '')}
                    onClick={() => setSelectedOrder(o)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="order-item-top">
                      <strong className="order-party">{o.partyName}</strong>
                      <span className="order-value">₹{o.approxOrderValue}</span>
                    </div>
                    <div className="order-item-bottom">
                      <span className="order-city">{o.placeCity}</span>
                      <span className="order-date">{new Date(o.dateCreated).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="orders-details">
                <div className="orders-details-header">
                  <div className="accent-strip"></div>
                  <h3>Order Details</h3>
                </div>
                {selectedOrder ? (
                  <div className="details-card">
                    <h2 className="details-title">{selectedOrder.partyName}</h2>
                    <p className="muted">{selectedOrder.contactPerson} • {selectedOrder.contactNumber}</p>

                    <div className="details-grid">
                      <div className="detail-block">
                        <label>Area of Delivery</label>
                        <div>{selectedOrder.areaOfDelivery || '—'}</div>
                      </div>
                      <div className="detail-block">
                        <label>City</label>
                        <div>{selectedOrder.placeCity || '—'}</div>
                      </div>
                      <div className="detail-block">
                        <label>Sales Executive</label>
                        <div>{selectedOrder.salesExecutive || '—'}</div>
                      </div>
                      <div className="detail-block">
                        <label>Order Taken By</label>
                        <div>{selectedOrder.orderTakenBy || '—'}</div>
                      </div>
                      <div className="detail-block">
                        <label>CRM / Transporter</label>
                        <div>{selectedOrder.crmTransporter || '—'}</div>
                      </div>
                      <div className="detail-block">
                        <label>Freight Paid By</label>
                        <div>{selectedOrder.freightPaidBy || '—'}</div>
                      </div>
                      <div className="detail-block">
                        <label>Freight Amount</label>
                        <div>{selectedOrder.freightAmount ? `₹${selectedOrder.freightAmount}` : '—'}</div>
                      </div>
                      <div className="detail-block">
                        <label>Delivery Type</label>
                        <div>{selectedOrder.deliveryType || '—'}</div>
                      </div>
                      <div className="detail-block">
                        <label>Approx Order Value</label>
                        <div>{selectedOrder.approxOrderValue ? `₹${selectedOrder.approxOrderValue}` : '—'}</div>
                      </div>
                      <div className="detail-block detail-block--full">
                        <label>Order Description</label>
                        <div className="pre-wrap">{selectedOrder.orderDescription || '—'}</div>
                      </div>
                      <div className="detail-block detail-block--full">
                        <label>Remarks</label>
                        <div className="pre-wrap">{selectedOrder.orderRemarks || '—'}</div>
                      </div>
                      <div className="detail-block detail-block--full">
                        <label>Payment Description</label>
                        <div className="pre-wrap">{selectedOrder.paymentDescription || '—'}</div>
                      </div>
                      <div className="detail-block">
                        <label>Expected Delivery</label>
                        <div>{selectedOrder.expectedDate ? new Date(selectedOrder.expectedDate).toLocaleDateString() : '—'}</div>
                      </div>
                      <div className="detail-block">
                        <label>Product Not Available</label>
                        <div>{selectedOrder.productNotAvailable ? 'Yes' : 'No'}</div>
                      </div>
                      <div className="detail-block detail-block--full">
                        <label>Order ID</label>
                        <div className="pre-wrap">{selectedOrder._id}</div>
                      </div>
                    </div>

                    {/* raw JSON removed - view-only details only */}
                  </div>
                ) : (
                  <div className="empty-state">Select an order to see details</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
