import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './NavBar.css';
import logo from '../logoMF.jpeg';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showUserPanel, setShowUserPanel] = React.useState(false);
  const [showPendingDropdown, setShowPendingDropdown] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false); // controls mobile menu open/close

  const handleToggleUserPanel = () => {
    setShowUserPanel(!showUserPanel);
  };

  const handleNavItemClick = () => {
    // collapse mobile nav when any link is clicked
    setExpanded(false);
  };

  const handlePendingOrderItemClick = () => {
    setShowPendingDropdown(false);
    setExpanded(false);
  };

  const handleLogout = () => {
    setShowUserPanel(false);
    logout();
  };

  // Lock background scrolling when mobile menu is expanded
  React.useEffect(() => {
    if (expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // cleanup when component unmounts or expanded changes
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [expanded]);

  return (
    <>
      <Navbar
        bg="primary"
        variant="dark"
        expand="lg"
        collapseOnSelect
        className="custom-navbar"
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      >
        <Container>
          <Navbar.Brand as={NavLink} to="/" className="fw-bold navbar-brand-custom" onClick={handleNavItemClick}>
            <img src={logo} alt="Maruti Flex" className="navbar-logo" />
            <span className="brand-text">Maruti Flex</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto navbar-links">
              <Nav.Link as={NavLink} to="/" className="nav-item-custom" onClick={handleNavItemClick}>
                Home
              </Nav.Link>
              <Nav.Link as={NavLink} to="/new-order" className="nav-item-custom" onClick={handleNavItemClick}>
                New Order
              </Nav.Link>
              <Nav.Link as={NavLink} to="/orders" className="nav-item-custom" onClick={handleNavItemClick}>
                Orders
              </Nav.Link>
              <NavDropdown title="Pending Order" id="pending-order-dropdown" className="nav-item-custom" show={showPendingDropdown} onToggle={(show) => setShowPendingDropdown(show)}>
                <NavDropdown.Item as={NavLink} to="/pending-order" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Overall
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={NavLink} to="/pending-order/financial-creditibility" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Financial Creditibility
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/pending-order/management-approved" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Management Approved
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/pending-order/final-order" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Final Order
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/pending-order/arrange-vehicle" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Arrange Vehicle
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/pending-order/billing-eway" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Billing and E way
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/pending-order/receipt-from-client" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Receipt from Client
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/pending-order/status-of-material" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Status of the Material
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/pending-order/order-invoice" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Order Invoice
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/pending-order/delivery-info-to-client" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Delivery Information to Client
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/pending-order/feedback-call" onClick={handlePendingOrderItemClick} className="pending-dropdown-item">
                  Feedback Call
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={NavLink} to="/menu2" className="nav-item-custom" onClick={handleNavItemClick}>
                Menu2
              </Nav.Link>
            </Nav>
            <div className="navbar-user">
              {user ? (
                <button 
                  className="user-account-btn"
                  onClick={handleToggleUserPanel}
                  title="Account"
                >
                  <span className="user-icon">👤</span>
                  <span className="user-name">{user.name}</span>
                </button>
              ) : (
                <Nav.Link as={NavLink} to="/login" className="nav-item-custom" onClick={handleNavItemClick}>
                  Login
                </Nav.Link>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Mobile menu backdrop */}
      {/** mobile menu backdrop moved into CSS, toggling class for visibility */}
      <div
        className={`mobile-menu-backdrop${expanded ? ' show' : ''}`}
        onClick={() => setExpanded(false)}
      ></div>

      {/* User Panel Overlay */}
      {showUserPanel && (
        <div 
          className="user-panel-overlay"
          onClick={() => setShowUserPanel(false)}
        ></div>
      )}

      {/* User Side Panel */}
      {user && (
        <div className={`user-side-panel ${showUserPanel ? 'active' : ''}`}>
          <div className="user-panel-header">
            <h3>Account</h3>
            <button 
              className="close-panel-btn"
              onClick={() => setShowUserPanel(false)}
            >
              ✕
            </button>
          </div>
          <div className="user-panel-content">
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="user-panel-divider"></div>
            <nav className="user-panel-menu">
              <NavLink to="/settings" className="user-panel-item" onClick={() => setShowUserPanel(false)}>
                ⚙️ Settings
              </NavLink>
              <a href="#" className="user-panel-item">📋 Profile</a>
              <a href="#" className="user-panel-item">🔐 Security</a>
              <a href="#" className="user-panel-item">💬 Support</a>
            </nav>
            <div className="user-panel-divider"></div>
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
