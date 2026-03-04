import React from 'react';
import './Menu1.css';

const Menu1 = () => (
  <div className="menu-container">
    <div className="menu-content">
      <div className="menu-header">
        <h1>Status</h1>
        <p className="menu-subtitle">Explore advanced features and tools</p>
      </div>

      <div className="menu-cards-grid">
        <div className="menu-card">
          <div className="menu-card-icon">🔧</div>
          <h3>Settings & Configuration</h3>
          <p>Configure your dashboard settings and preferences to match your workflow.</p>
          <button className="menu-card-btn">Open Settings</button>
        </div>

        <div className="menu-card">
          <div className="menu-card-icon">👥</div>
          <h3>User Management</h3>
          <p>Manage team members and control access permissions across the platform.</p>
          <button className="menu-card-btn">Manage Users</button>
        </div>

        <div className="menu-card">
          <div className="menu-card-icon">📝</div>
          <h3>Reports</h3>
          <p>Generate comprehensive reports on orders, deliveries, and performance metrics.</p>
          <button className="menu-card-btn">View Reports</button>
        </div>

        <div className="menu-card">
          <div className="menu-card-icon">🔒</div>
          <h3>Security</h3>
          <p>Manage security settings, authentication, and data protection options.</p>
          <button className="menu-card-btn">Manage Security</button>
        </div>
      </div>

      <div className="menu-info-section">
        <h2>Status Overview</h2>
        <p>This section contains advanced features for managing your MarutiFlex dashboard. Explore the options above to customize your experience and manage your account settings more effectively.</p>
        <p>Each feature is designed to be intuitive and user-friendly, making it easy to navigate and use even for first-time users.</p>
      </div>
    </div>
  </div>
);

export default Menu1;
