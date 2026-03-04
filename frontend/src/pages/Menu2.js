import React from 'react';
import './Menu2.css';

const Menu2 = () => (
  <div className="menu-container">
    <div className="menu-content">
      <div className="menu-header">
        <h1>Menu 2</h1>
        <p className="menu-subtitle">Additional tools and resources</p>
      </div>

      <div className="menu-cards-grid">
        <div className="menu-card">
          <div className="menu-card-icon">📱</div>
          <h3>Mobile Integration</h3>
          <p>Access your orders and manage deliveries on the go with our mobile-friendly interface.</p>
          <button className="menu-card-btn">Download App</button>
        </div>

        <div className="menu-card">
          <div className="menu-card-icon">🌐</div>
          <h3>API Documentation</h3>
          <p>Integrate MarutiFlex with your existing systems using our comprehensive API documentation.</p>
          <button className="menu-card-btn">View API Docs</button>
        </div>

        <div className="menu-card">
          <div className="menu-card-icon">💬</div>
          <h3>Support & Help</h3>
          <p>Get instant help from our support team. Check FAQs or contact us for detailed assistance.</p>
          <button className="menu-card-btn">Get Help</button>
        </div>

        <div className="menu-card">
          <div className="menu-card-icon">🎓</div>
          <h3>Training & Tutorials</h3>
          <p>Learn how to use MarutiFlex effectively with our video tutorials and documentation.</p>
          <button className="menu-card-btn">Learn More</button>
        </div>
      </div>

      <div className="menu-info-section">
        <h2>Menu 2 Overview</h2>
        <p>Access additional tools and resources to enhance your MarutiFlex experience. Our comprehensive support system ensures you get the most out of your dashboard.</p>
        <p>Whether you need technical support, want to integrate with other systems, or need training resources, everything you need is available right here.</p>
      </div>
    </div>
  </div>
);

export default Menu2;
