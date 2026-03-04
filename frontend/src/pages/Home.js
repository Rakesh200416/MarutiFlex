import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="hero-section">
          <h1 className="hero-title">Welcome to Maruti Flex Dashboard</h1>
          <p className="hero-subtitle">Manage your orders and operations with ease</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3 className="feature-title">Create Orders</h3>
            <p className="feature-text">Quickly create and manage new orders with our intuitive form. Track all order details in one place.</p>
            <a href="/new-order" className="feature-link">Get Started →</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Track Orders</h3>
            <p className="feature-text">View all your orders in real-time. Update delivery status and monitor order progress easily.</p>
            <a href="/orders" className="feature-link">View Orders →</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3 className="feature-title">Manage Deliveries</h3>
            <p className="feature-text">Efficiently manage delivery information, expected dates, and transportation details for all orders.</p>
            <a href="/orders" className="feature-link">Manage →</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3 className="feature-title">Analytics</h3>
            <p className="feature-text">Get insights into your orders, delivery patterns, and operational metrics at a glance.</p>
            <a href="#" className="feature-link">View Analytics →</a>
          </div>
        </div>

        <div className="welcome-section">
          <div className="welcome-card">
            <h2 className="welcome-title">About MarutiFlex Dashboard</h2>
            <p className="welcome-text">
              This professional dashboard helps you manage orders, track deliveries, and maintain customer records with an easy-to-use interface. Access real-time updates from the Orders page and create new entries quickly from the New Order form.
            </p>
            <div className="welcome-features">
              <div className="welcome-item">
                <span className="check-icon">✓</span>
                <span>Real-time order management</span>
              </div>
              <div className="welcome-item">
                <span className="check-icon">✓</span>
                <span>Comprehensive order tracking</span>
              </div>
              <div className="welcome-item">
                <span className="check-icon">✓</span>
                <span>Professional delivery management</span>
              </div>
              <div className="welcome-item">
                <span className="check-icon">✓</span>
                <span>Secure data handling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
