import { createSlice } from '@reduxjs/toolkit';
import { updateCart } from '../utils/cartUtils';

const initialState = localStorage.getItem('cart')
  ? JSON.parse(localStorage.getItem('cart'))
  : { cartItems: [], shippingAddress: {}, paymentMethod: 'COD' };

initialState.checkoutKey ||= crypto.randomUUID();

// Older carts do not identify a size/color variant and must be selected again.
initialState.cartItems = initialState.cartItems.filter(item => item.variantId);
if (!['COD', 'BankTransfer'].includes(initialState.paymentMethod)) initialState.paymentMethod = 'COD';
updateCart(initialState);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      state.checkoutKey = crypto.randomUUID();

      const existItem = state.cartItems.find((x) => x.cartKey === item.cartKey);

      if (existItem) {
        state.cartItems = state.cartItems.map((x) =>
          x.cartKey === existItem.cartKey ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }

      return updateCart(state, item);
    },
    removeFromCart: (state, action) => {
      state.checkoutKey = crypto.randomUUID();
      state.cartItems = state.cartItems.filter((x) => x.cartKey !== action.payload);
      return updateCart(state);
    },
    saveShippingAddress: (state, action) => {
      state.checkoutKey = crypto.randomUUID();
      state.shippingAddress = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    savePaymentMethod: (state, action) => {
      state.checkoutKey = crypto.randomUUID();
      state.paymentMethod = action.payload;
      localStorage.setItem('cart', JSON.stringify(state));
    },
    clearCartItems: (state, action) => {
      state.checkoutKey = crypto.randomUUID();
      state.cartItems = [];
      localStorage.setItem('cart', JSON.stringify(state));
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
