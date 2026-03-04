import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch just the basic order list with workflow data
export const fetchOrders = createAsyncThunk(
  'pendingOrders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      const res = await axios.get('/api/orders', { headers });
      const orders = res.data;

      // Fetch workflow data for each order
      const ordersWithWorkflow = await Promise.all(
        orders.map(async (order) => {
          const orderId = order._id || order.order?._id;
          // skip if orderId is missing
          if (!orderId) return order;
          try {
            const [
              financialRes,
              managementRes,
              finalRes,
              arrangeRes,
              billingRes,
              receiptRes,
              statusRes,
              invoiceRes,
              deliveryRes,
              feedbackRes,
            ] = await Promise.all([
              axios.get(`/api/financial-creditibility?orderId=${orderId}`, { headers }).catch(() => null),
              axios.get(`/api/management-approved?orderId=${orderId}`, { headers }).catch(() => null),
              axios.get(`/api/final-order?orderId=${orderId}`, { headers }).catch(() => null),
              axios.get(`/api/arrange-vehicle?orderId=${orderId}`, { headers }).catch(() => null),
              axios.get(`/api/billing-eway?orderId=${orderId}`, { headers }).catch(() => null),
              axios.get(`/api/receipt-from-client?orderId=${orderId}`, { headers }).catch(() => null),
              axios.get(`/api/status-material?orderId=${orderId}`, { headers }).catch(() => null),
              axios.get(`/api/order-invoice?orderId=${orderId}`, { headers }).catch(() => null),
              axios.get(`/api/delivery-info?orderId=${orderId}`, { headers }).catch(() => null),
              axios.get(`/api/feedback-call?orderId=${orderId}`, { headers }).catch(() => null),
            ]);

            return {
              ...order,
              financialCreditibility: financialRes?.data || null,
              managementApproved: managementRes?.data || null,
              finalOrder: finalRes?.data || null,
              arrangeVehicle: arrangeRes?.data || null,
              billingEway: billingRes?.data || null,
              receiptFromClient: receiptRes?.data || null,
              statusMaterial: statusRes?.data || null,
              orderInvoice: invoiceRes?.data || null,
              deliveryInfo: deliveryRes?.data || null,
              feedbackCall: feedbackRes?.data || null,
            };
          } catch (error) {
            return order;
          }
        })
      );

      return ordersWithWorkflow;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch orders');
    }
  }
);

// Fetch workflow details for a single order (debounced to prevent excessive API calls)
let detailsFetchTimeout = null;
export const fetchOrderDetails = createAsyncThunk(
  'pendingOrders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };
      if (!orderId) return rejectWithValue('Invalid order id');
      const orderRes = await axios.get(`/api/orders/${orderId}`, { headers });
      const order = orderRes.data;

      const [
        financialRes,
        managementRes,
        finalRes,
        arrangeRes,
        billingRes,
        receiptRes,
        statusRes,
        invoiceRes,
        deliveryRes,
        feedbackRes,
      ] = await Promise.all([
        axios.get(`/api/financial-creditibility?orderId=${orderId}`, { headers }).catch(() => null),
        axios.get(`/api/management-approved?orderId=${orderId}`, { headers }).catch(() => null),
        axios.get(`/api/final-order?orderId=${orderId}`, { headers }).catch(() => null),
        axios.get(`/api/arrange-vehicle?orderId=${orderId}`, { headers }).catch(() => null),
        axios.get(`/api/billing-eway?orderId=${orderId}`, { headers }).catch(() => null),
        axios.get(`/api/receipt-from-client?orderId=${orderId}`, { headers }).catch(() => null),
        axios.get(`/api/status-material?orderId=${orderId}`, { headers }).catch(() => null),
        axios.get(`/api/order-invoice?orderId=${orderId}`, { headers }).catch(() => null),
        axios.get(`/api/delivery-info?orderId=${orderId}`, { headers }).catch(() => null),
        axios.get(`/api/feedback-call?orderId=${orderId}`, { headers }).catch(() => null),
      ]);

      return {
        order,
        financialCreditibility: financialRes?.data || null,
        managementApproved: managementRes?.data || null,
        finalOrder: finalRes?.data || null,
        arrangeVehicle: arrangeRes?.data || null,
        billingEway: billingRes?.data || null,
        receiptFromClient: receiptRes?.data || null,
        statusMaterial: statusRes?.data || null,
        orderInvoice: invoiceRes?.data || null,
        deliveryInfo: deliveryRes?.data || null,
        feedbackCall: feedbackRes?.data || null,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch order details');
    }
  }
);

const initialState = {
  orders: [],               // basic list
  orderDetails: null,       // details for selected order
  ordersLoading: false,
  detailsLoading: false,
  error: null,
};

const pendingOrdersSlice = createSlice({
  name: 'pendingOrders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.ordersLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = pendingOrdersSlice.actions;
export default pendingOrdersSlice.reducer;
