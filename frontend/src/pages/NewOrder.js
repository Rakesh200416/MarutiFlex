import React, { useState, useEffect, useRef } from 'react';
import './NewOrder.css';

const salesOptions = ['a', 'b', 'c', 'd'];

const partyNames = [
  'Rajesh Enterprise',
  'Kumar Trading Co',
  'Sharma Industries',
  'Patel Brothers Ltd',
  'Gupta Manufacturing',
  'Singh Commercial',
  'Desai Group',
  'Verma Solutions',
  'Nair Business House',
  'Bhat Enterprises',
  'Iyer Trading',
  'Reddy Import Export'
];

const NewOrder = () => {
  const [form, setForm] = useState({
    godownLocation: '',
    partyName: '',
    contactPerson: '',
    contactNumber: '',
    areaOfDelivery: '',
    placeCity: '',
    salesExecutive: '',
    orderTakenBy: '',
    crmTransporter: '',
    freightPaidBy: 'Party',
    freightAmount: '',
    deliveryType: 'Regular',
    approxOrderValue: '',
    orderDescription: '',
    orderRemarks: '',
    expectedDate: '',
    paymentDescription: '',
    productNotAvailable: false,
  });

  const [partySearch, setPartySearch] = useState('');
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const [selectedParty, setSelectedParty] = useState(false);
  const partyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (partyRef.current && !partyRef.current.contains(event.target)) {
        setShowPartyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePartySearch = (e) => {
    const value = e.target.value;
    setPartySearch(value);
    setForm((prev) => ({
      ...prev,
      partyName: value,
    }));
    setShowPartyDropdown(true);
    setSelectedParty(false);
  };

  const handlePartySelect = (name) => {
    setForm((prev) => ({
      ...prev,
      partyName: name,
    }));
    setPartySearch(name);
    setShowPartyDropdown(false);
    setSelectedParty(true);
  };

  const filteredParties = partySearch
    ? partyNames.filter((party) =>
        party.toLowerCase().includes(partySearch.toLowerCase())
      )
    : partyNames;

  const isPartyMatch =
    partySearch &&
    partyNames.some((party) => party.toLowerCase() === partySearch.toLowerCase());
  const partySearchColor = selectedParty ? '#000' : isPartyMatch ? '#22c55e' : partySearch ? '#ef4444' : '#000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      console.log('saved order', data);
      alert('Order saved successfully');
      setForm({
        godownLocation: '',
        partyName: '',
        contactPerson: '',
        contactNumber: '',
        areaOfDelivery: '',
        placeCity: '',
        salesExecutive: '',
        orderTakenBy: '',
        crmTransporter: '',
        freightPaidBy: 'Party',
        freightAmount: '',
        deliveryType: 'Regular',
        approxOrderValue: '',
        orderDescription: '',
        orderRemarks: '',
        expectedDate: '',
        paymentDescription: '',
        productNotAvailable: false,
      });
      setPartySearch('');
      setSelectedParty(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save order');
    }
  };

  return (
    <div className="new-order-container">
      <div className="new-order-content">
        <div className="page-header-new">
          <h1>Create New Order</h1>
          <p className="text-muted">Fill in the form below to create a new order</p>
        </div>
        
        <div className="form-card">
          <form onSubmit={handleSubmit} className="modern-form">
            {/* Section 1: Basic Information */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Godown Location*</label>
                  <select
                    className="form-control-modern"
                    name="godownLocation"
                    value={form.godownLocation}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option>Location 1</option>
                    <option>Location 2</option>
                    <option>Location 3</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Party Name*</label>
                  <div className="party-search-container" ref={partyRef}>
                    <input
                      type="text"
                      className="form-control-modern party-search-input"
                      placeholder="Search or enter party name"
                      value={form.partyName}
                      onChange={handlePartySearch}
                      onFocus={() => setShowPartyDropdown(true)}
                      style={{ color: partySearchColor }}
                      required
                    />
                    {showPartyDropdown && partySearch && (
                      <div className="party-dropdown">
                        {filteredParties.length > 0 ? (
                          filteredParties.map((party, idx) => (
                            <div
                              key={idx}
                              className="party-dropdown-item"
                              onClick={() => handlePartySelect(party)}
                            >
                              {party}
                            </div>
                          ))
                        ) : (
                          <div className="party-dropdown-no-match">No matches found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Person*</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    name="contactPerson"
                    placeholder="Enter contact person name"
                    value={form.contactPerson}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number*</label>
                  <input
                    type="tel"
                    className="form-control-modern"
                    name="contactNumber"
                    placeholder="Enter contact number"
                    value={form.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Information */}
            <div className="form-section">
              <h3 className="section-title">Delivery Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Area Of Delivery*</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    name="areaOfDelivery"
                    placeholder="Enter delivery area"
                    value={form.areaOfDelivery}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Place (City)*</label>
                  <input
                    type="text"
                    className="form-control-modern"
                    name="placeCity"
                    placeholder="Enter city name"
                    value={form.placeCity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Date of Delivery*</label>
                  <input
                    type="date"
                    className="form-control-modern"
                    name="expectedDate"
                    value={form.expectedDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Type*</label>
                  <div className="radio-group">
                    <div className="form-check-modern">
                      <input
                        id="deliveryUrgent"
                        className="form-check-input-modern"
                        type="radio"
                        name="deliveryType"
                        value="Urgent"
                        checked={form.deliveryType === 'Urgent'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label-modern" htmlFor="deliveryUrgent">
                        Urgent
                      </label>
                    </div>
                    <div className="form-check-modern">
                      <input
                        id="deliveryRegular"
                        className="form-check-input-modern"
                        type="radio"
                        name="deliveryType"
                        value="Regular"
                        checked={form.deliveryType === 'Regular'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label-modern" htmlFor="deliveryRegular">
                        Regular
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Personnel & Transport */}
            <div className="form-section">
              <h3 className="section-title">Personnel & Transport</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Sales Executive*</label>
                  <select
                    className="form-control-modern"
                    name="salesExecutive"
                    value={form.salesExecutive}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    {salesOptions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Order Taken By*</label>
                  <select
                    className="form-control-modern"
                    name="orderTakenBy"
                    value={form.orderTakenBy}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select...</option>
                    {salesOptions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">
                    CRM/Transporter Name (In case of outstation Delivery)
                  </label>
                  <input
                    type="text"
                    className="form-control-modern"
                    name="crmTransporter"
                    placeholder="Enter CRM or transporter name"
                    value={form.crmTransporter}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Freight & Payment */}
            <div className="form-section">
              <h3 className="section-title">Freight & Payment</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Freight Paid By*</label>
                  <div className="radio-group">
                    <div className="form-check-modern">
                      <input
                        id="freightParty"
                        className="form-check-input-modern"
                        type="radio"
                        name="freightPaidBy"
                        value="Party"
                        checked={form.freightPaidBy === 'Party'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label-modern" htmlFor="freightParty">
                        Party
                      </label>
                    </div>
                    <div className="form-check-modern">
                      <input
                        id="freightCompany"
                        className="form-check-input-modern"
                        type="radio"
                        name="freightPaidBy"
                        value="Company"
                        checked={form.freightPaidBy === 'Company'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label-modern" htmlFor="freightCompany">
                        Company
                      </label>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Freight Amount*</label>
                  <input
                    type="number"
                    className="form-control-modern"
                    name="freightAmount"
                    placeholder="Enter freight amount"
                    value={form.freightAmount}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Approx Order Value*</label>
                  <input
                    type="number"
                    className="form-control-modern"
                    name="approxOrderValue"
                    placeholder="Enter approximate order value"
                    value={form.approxOrderValue}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Order Details */}
            <div className="form-section">
              <h3 className="section-title">Order Details</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Order Description*</label>
                  <textarea
                    className="form-control-modern textarea-modern"
                    name="orderDescription"
                    placeholder="Enter order description"
                    value={form.orderDescription}
                    onChange={handleChange}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Order Remarks*</label>
                  <textarea
                    className="form-control-modern textarea-modern"
                    name="orderRemarks"
                    placeholder="Enter order remarks"
                    value={form.orderRemarks}
                    onChange={handleChange}
                    rows="4"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">Payment Description & Update*</label>
                  <textarea
                    className="form-control-modern textarea-modern"
                    name="paymentDescription"
                    placeholder="Enter payment description and updates"
                    value={form.paymentDescription}
                    onChange={handleChange}
                    rows="4"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="form-section">
              <div className="checkbox-group">
                <div className="form-check-modern">
                  <input
                    id="productNotAvailable"
                    className="form-check-input-modern"
                    type="checkbox"
                    name="productNotAvailable"
                    checked={form.productNotAvailable}
                    onChange={handleChange}
                  />
                  <label className="form-check-label-modern" htmlFor="productNotAvailable">
                    Product Not Available Now
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-submit-footer">
              <button className="btn-submit-modern" type="submit">
                <span>Submit Order</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
