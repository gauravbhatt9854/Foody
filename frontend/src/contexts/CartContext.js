import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  orderType: 'pickup', // 'pickup' or 'delivery'
  deliveryAddress: '',
  specialInstructions: '',
  paymentMethod: 'cash',
};

// Action types
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  UPDATE_SPECIAL_INSTRUCTIONS: 'UPDATE_SPECIAL_INSTRUCTIONS',
  SET_ORDER_TYPE: 'SET_ORDER_TYPE',
  SET_DELIVERY_ADDRESS: 'SET_DELIVERY_ADDRESS',
  SET_SPECIAL_INSTRUCTIONS: 'SET_SPECIAL_INSTRUCTIONS',
  SET_PAYMENT_METHOD: 'SET_PAYMENT_METHOD',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
};

// Helper function to calculate totals
const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  return {
    totalItems,
    totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
  };
};

// Reducer function
const cartReducer = (state, action) => {
  let newItems;
  let totals;

  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      const existingItemIndex = state.items.findIndex(
        item => item.menuItem._id === action.payload.menuItem._id
      );

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }

      totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals,
      };

    case CART_ACTIONS.REMOVE_ITEM:
      newItems = state.items.filter(item => item.menuItem._id !== action.payload);
      totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals,
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      newItems = state.items.map(item =>
        item.menuItem._id === action.payload.menuItemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0); // Remove items with 0 quantity

      totals = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        ...totals,
      };

    case CART_ACTIONS.UPDATE_SPECIAL_INSTRUCTIONS:
      newItems = state.items.map(item =>
        item.menuItem._id === action.payload.menuItemId
          ? { ...item, specialInstructions: action.payload.instructions }
          : item
      );
      return {
        ...state,
        items: newItems,
      };

    case CART_ACTIONS.SET_ORDER_TYPE:
      return {
        ...state,
        orderType: action.payload,
        // Clear delivery address if switching to pickup
        deliveryAddress: action.payload === 'pickup' ? '' : state.deliveryAddress,
      };

    case CART_ACTIONS.SET_DELIVERY_ADDRESS:
      return {
        ...state,
        deliveryAddress: action.payload,
      };

    case CART_ACTIONS.SET_SPECIAL_INSTRUCTIONS:
      return {
        ...state,
        specialInstructions: action.payload,
      };

    case CART_ACTIONS.SET_PAYMENT_METHOD:
      return {
        ...state,
        paymentMethod: action.payload,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...initialState,
        orderType: state.orderType, // Preserve order type preference
        paymentMethod: state.paymentMethod, // Preserve payment method preference
      };

    case CART_ACTIONS.LOAD_CART:
      totals = calculateTotals(action.payload.items || []);
      return {
        ...action.payload,
        ...totals,
      };

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  // Add item to cart
  const addItem = (menuItem, quantity = 1, specialInstructions = '') => {
    if (!menuItem.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }

    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: {
        menuItem,
        quantity,
        price: menuItem.price,
        specialInstructions,
      },
    });

    toast.success(`${menuItem.name} added to cart`);
  };

  // Remove item from cart
  const removeItem = (menuItemId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: menuItemId,
    });

    toast.info('Item removed from cart');
  };

  // Update item quantity
  const updateQuantity = (menuItemId, quantity) => {
    if (quantity < 0) return;

    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { menuItemId, quantity },
    });
  };

  // Update special instructions for an item
  const updateItemInstructions = (menuItemId, instructions) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_SPECIAL_INSTRUCTIONS,
      payload: { menuItemId, instructions },
    });
  };

  // Set order type
  const setOrderType = (type) => {
    dispatch({
      type: CART_ACTIONS.SET_ORDER_TYPE,
      payload: type,
    });
  };

  // Set delivery address
  const setDeliveryAddress = (address) => {
    dispatch({
      type: CART_ACTIONS.SET_DELIVERY_ADDRESS,
      payload: address,
    });
  };

  // Set special instructions
  const setSpecialInstructions = (instructions) => {
    dispatch({
      type: CART_ACTIONS.SET_SPECIAL_INSTRUCTIONS,
      payload: instructions,
    });
  };

  // Set payment method
  const setPaymentMethod = (method) => {
    dispatch({
      type: CART_ACTIONS.SET_PAYMENT_METHOD,
      payload: method,
    });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
    toast.success('Cart cleared');
  };

  // Get item quantity in cart
  const getItemQuantity = (menuItemId) => {
    const item = state.items.find(item => item.menuItem._id === menuItemId);
    return item ? item.quantity : 0;
  };

  // Check if cart is empty
  const isEmpty = state.items.length === 0;

  // Get cart summary for order
  const getOrderSummary = () => {
    return {
      items: state.items.map(item => ({
        menuItem: item.menuItem._id,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions,
      })),
      totalAmount: state.totalAmount,
      orderType: state.orderType,
      deliveryAddress: state.deliveryAddress,
      specialInstructions: state.specialInstructions,
      paymentMethod: state.paymentMethod,
    };
  };

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    updateItemInstructions,
    setOrderType,
    setDeliveryAddress,
    setSpecialInstructions,
    setPaymentMethod,
    clearCart,
    getItemQuantity,
    getOrderSummary,
    isEmpty,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;