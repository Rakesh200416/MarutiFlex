import { configureStore } from '@reduxjs/toolkit';
import pendingOrdersReducer from './pendingOrdersSlice';

const store = configureStore({
  reducer: {
    pendingOrders: pendingOrdersReducer,
  },
});

export default store;
