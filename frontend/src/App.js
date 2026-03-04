import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { AuthContext } from './context/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import NewOrder from './pages/NewOrder';
import Menu1 from './pages/Menu1';
import Menu2 from './pages/Menu2';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import FinancialCreditibility from './pages/PendingOrder/FinancialCreditibility';
import ManagementApproved from './pages/PendingOrder/ManagementApproved';
import FinalOrder from './pages/PendingOrder/FinalOrder';
import ArrangeVehicle from './pages/PendingOrder/ArrangeVehicle';
import BillingEway from './pages/PendingOrder/BillingEway';
import ReceiptFromClient from './pages/PendingOrder/ReceiptFromClient';
import StatusMaterial from './pages/PendingOrder/StatusMaterial';
import OrderInvoice from './pages/PendingOrder/OrderInvoice';
import DeliveryInfo from './pages/PendingOrder/DeliveryInfo';
import FeedbackCall from './pages/PendingOrder/FeedbackCall';
import PendingOrderSummary from './pages/PendingOrder/PendingOrderSummary';



function App() {
  const { user, loading } = useContext(AuthContext);
  const isLoginPage = window.location.pathname === '/login';

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="App">
        <main className="login-main">
          <div style={{ textAlign: 'center', color: '#999' }}>
            <h2>Loading...</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <div className="App">
        {user && <NavBar />}

        <main className={isLoginPage ? 'login-main' : 'default-main'}>
          <Routes>
            <Route
              path="/"
              element={user ? <Home /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/new-order"
              element={user ? <NewOrder /> : <Navigate to="/login" />}
            />
            <Route
              path="/orders"
              element={user ? <Orders /> : <Navigate to="/login" />}
            />
            <Route
              path="/settings"
              element={user ? <Settings /> : <Navigate to="/login" />}
            />
            <Route
              path="/menu1"
              element={user ? <Menu1 /> : <Navigate to="/login" />}
            />
            <Route
              path="/menu2"
              element={user ? <Menu2 /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/financial-creditibility"
              element={user ? <FinancialCreditibility /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/management-approved"
              element={user ? <ManagementApproved /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/final-order"
              element={user ? <FinalOrder /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/arrange-vehicle"
              element={user ? <ArrangeVehicle /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/billing-eway"
              element={user ? <BillingEway /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/receipt-from-client"
              element={user ? <ReceiptFromClient /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/status-of-material"
              element={user ? <StatusMaterial /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/order-invoice"
              element={user ? <OrderInvoice /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/delivery-info-to-client"
              element={user ? <DeliveryInfo /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/feedback-call"
              element={user ? <FeedbackCall /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order"
              element={user ? <PendingOrderSummary /> : <Navigate to="/login" />}
            />
            <Route
              path="/pending-order/summary"
              element={user ? <PendingOrderSummary /> : <Navigate to="/login" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {user && <Footer />}
      </div>
    </Provider>
  );
}

export default App;
