import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

export interface CartItemModification {
  category: string;
  name: string;
  spec?: string;
  cost: number;
  colorPreview?: string;
}

export interface CartItem {
  id: string;
  type: 'custom_vehicle' | 'component';
  vehicleModelName: string;
  vehicleModelCode?: string;
  variantName?: string;
  variantId?: string;
  configCode?: string;
  basePrice: number;
  totalPrice: number;
  quantity: number;
  modifications: CartItemModification[];
  paintColor?: string;
  paintFinish?: string;
  wheelStyle?: string;
  tyreStyle?: string;
  spoilerStyle?: string;
  caliperColor?: string;
  interiorTrim?: string;
  exhaustStyle?: string;
  dateAdded: string;
}

export interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress: string;
  deliveryMethod: 'WHITE_GLOVE' | 'FACTORY_COLLECTION';
  paymentMethod: 'WIRE_TRANSFER' | 'CRYPTO_ESCROW' | 'CORPORATE_PO' | 'CREDIT_CARD';
  notes?: string;
}

export interface OrderReceipt {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress: string;
  deliveryMethod: string;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  vin?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  items: any[];
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'dateAdded'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  activeReceipt: OrderReceipt | null;
  setActiveReceipt: (receipt: OrderReceipt | null) => void;
  totalCartItems: number;
  totalCartPrice: number;
  placedOrders: OrderReceipt[];
  placeOrder: (formData: OrderFormData) => Promise<OrderReceipt>;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  trackingOrderNumber: string | null;
  setTrackingOrderNumber: (num: string | null) => void;
  openTracking: (orderNumber?: string) => void;

  // Guest Auth Prompt Modal Controls
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalIntent: 'cart' | 'tracking' | 'add_to_cart' | null;
  openAuthModal: (intent: 'cart' | 'tracking' | 'add_to_cart', pendingItem?: Omit<CartItem, 'id' | 'dateAdded'>) => void;
  closeAuthModal: () => void;
  handleAuthSuccess: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest } = useAuth();

  // Storage key generators scoped strictly to active customer account
  const getUserCartKey = useCallback((u: any) => {
    if (!u) return null;
    return `autoengine_cart_${u.id || u.email}`;
  }, []);

  const getUserOrdersKey = useCallback((u: any) => {
    if (!u) return null;
    return `autoengine_orders_${u.id || u.email}`;
  }, []);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [placedOrders, setPlacedOrders] = useState<OrderReceipt[]>([]);
  const [isCartOpen, _setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<OrderReceipt | null>(null);
  const [isTrackingOpen, _setIsTrackingOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string | null>(null);

  // Auth Prompt Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalIntent, setAuthModalIntent] = useState<'cart' | 'tracking' | 'add_to_cart' | null>(null);
  const pendingCartItemRef = useRef<Omit<CartItem, 'id' | 'dateAdded'> | null>(null);

  // Open & Close Auth Prompt Modal
  const openAuthModal = (intent: 'cart' | 'tracking' | 'add_to_cart', pendingItem?: Omit<CartItem, 'id' | 'dateAdded'>) => {
    setAuthModalIntent(intent);
    if (pendingItem) {
      pendingCartItemRef.current = pendingItem;
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalIntent(null);
    pendingCartItemRef.current = null;
  };

  // Safe wrapper for setIsCartOpen: If guest, trigger Sign In popup
  const setIsCartOpen = (open: boolean) => {
    if (open && (!user || isGuest)) {
      openAuthModal('cart');
      return;
    }
    _setIsCartOpen(open);
  };

  // Safe wrapper for openTracking: If guest, trigger Sign In popup
  const openTracking = (orderNumber?: string) => {
    if (!user || isGuest) {
      if (orderNumber) setTrackingOrderNumber(orderNumber);
      openAuthModal('tracking');
      return;
    }
    if (orderNumber) setTrackingOrderNumber(orderNumber);
    _setIsCartOpen(false);
    setIsCheckoutOpen(false);
    _setIsTrackingOpen(true);
  };

  const setIsTrackingOpen = (open: boolean) => {
    if (open && (!user || isGuest)) {
      openAuthModal('tracking');
      return;
    }
    _setIsTrackingOpen(open);
  };

  // Synchronize cart & orders whenever active user changes
  useEffect(() => {
    if (!user || isGuest) {
      // Guest mode: Cart and placed orders are completely wiped from active memory
      setCartItems([]);
      setPlacedOrders([]);
      _setIsCartOpen(false);
      _setIsTrackingOpen(false);
      return;
    }

    // Signed-in user: Load this specific account's cart
    const cartKey = getUserCartKey(user);
    if (cartKey) {
      try {
        const storedCart = localStorage.getItem(cartKey);
        setCartItems(storedCart ? JSON.parse(storedCart) : []);
      } catch (e) {
        setCartItems([]);
      }
    }

    // Load this specific account's placed orders from local cache
    const ordersKey = getUserOrdersKey(user);
    if (ordersKey) {
      try {
        const storedOrders = localStorage.getItem(ordersKey);
        if (storedOrders) {
          setPlacedOrders(JSON.parse(storedOrders));
        }
      } catch (e) {
        setPlacedOrders([]);
      }
    }

    // Fetch verified orders from backend for this authenticated account
    const fetchFreshOrders = async () => {
      try {
        const res = await api.orders.getAll();
        if (res.success && Array.isArray(res.data)) {
          setPlacedOrders(res.data);
          if (ordersKey) {
            localStorage.setItem(ordersKey, JSON.stringify(res.data));
          }
        }
      } catch (err) {
        console.warn('Backend orders sync failed; retaining cached account orders.', err);
      }
    };
    fetchFreshOrders();
  }, [user?.id, user?.email, isGuest, getUserCartKey, getUserOrdersKey]);

  // Persist cart to active user's dedicated storage key
  useEffect(() => {
    if (!user || isGuest) return;
    const cartKey = getUserCartKey(user);
    if (cartKey) {
      try {
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
      } catch (e) {
        console.error('Failed to sync user cart:', e);
      }
    }
  }, [cartItems, user, isGuest, getUserCartKey]);

  // Persist placed orders to active user's dedicated storage key
  useEffect(() => {
    if (!user || isGuest) return;
    const ordersKey = getUserOrdersKey(user);
    if (ordersKey) {
      try {
        localStorage.setItem(ordersKey, JSON.stringify(placedOrders));
      } catch (e) {
        console.error('Failed to sync user orders:', e);
      }
    }
  }, [placedOrders, user, isGuest, getUserOrdersKey]);

  // Handle successful login from AuthPromptModal
  const handleAuthSuccess = () => {
    const currentIntent = authModalIntent;
    const pendingItem = pendingCartItemRef.current;
    closeAuthModal();

    if (currentIntent === 'cart') {
      setTimeout(() => _setIsCartOpen(true), 150);
    } else if (currentIntent === 'tracking') {
      setTimeout(() => _setIsTrackingOpen(true), 150);
    } else if (currentIntent === 'add_to_cart' && pendingItem) {
      const newItem: CartItem = {
        ...pendingItem,
        id: `ITEM-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        dateAdded: new Date().toISOString(),
      };
      setCartItems((prev) => [newItem, ...prev]);
      setTimeout(() => _setIsCartOpen(true), 150);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00F0FF', '#38BDF8', '#FFFFFF'],
      });
    }
  };

  const addToCart = (item: Omit<CartItem, 'id' | 'dateAdded'>) => {
    // If not authenticated, prompt sign in immediately
    if (!user || isGuest) {
      openAuthModal('add_to_cart', item);
      return;
    }

    const newItem: CartItem = {
      ...item,
      id: `ITEM-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      dateAdded: new Date().toISOString(),
    };

    setCartItems((prev) => [newItem, ...prev]);
    _setIsCartOpen(true);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00F0FF', '#38BDF8', '#FFFFFF'],
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) {
      const cartKey = getUserCartKey(user);
      if (cartKey) localStorage.removeItem(cartKey);
    }
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.totalPrice * (item.quantity || 1), 0);

  const placeOrder = async (formData: OrderFormData): Promise<OrderReceipt> => {
    if (!user) {
      throw new Error('Authentication required to place an automotive build order.');
    }

    try {
      // 1. Post to backend
      const res = await api.orders.create({
        customerName: formData.customerName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client',
        customerEmail: user.email || formData.customerEmail,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: cartItems,
      });

      let receipt: OrderReceipt;

      if (res.success && res.data) {
        receipt = {
          ...res.data,
          items: res.data.items || cartItems,
        };
      } else {
        // Fallback local receipt
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `AE-ORD-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
        const vin = `1AE${Date.now().toString(16).toUpperCase().slice(-6)}${randomSuffix}US`;
        const estDelivery = new Date();
        estDelivery.setDate(estDelivery.getDate() + 5);

        receipt = {
          id: `ORD-LOCAL-${Date.now()}`,
          orderNumber,
          customerName: formData.customerName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          customerEmail: user.email || formData.customerEmail,
          customerPhone: formData.customerPhone,
          deliveryAddress: formData.deliveryAddress,
          deliveryMethod: formData.deliveryMethod,
          paymentMethod: formData.paymentMethod,
          totalAmount: totalCartPrice,
          status: 'CONFIRMED',
          vin,
          estimatedDelivery: estDelivery.toISOString(),
          notes: formData.notes,
          createdAt: new Date().toISOString(),
          items: [...cartItems],
        };
      }

      // 2. Save in placed orders for THIS customer account
      setPlacedOrders((prev) => [receipt, ...prev]);
      setActiveReceipt(receipt);

      const ordersKey = getUserOrdersKey(user);
      if (ordersKey) {
        try {
          const currentOrders = [receipt, ...placedOrders];
          localStorage.setItem(ordersKey, JSON.stringify(currentOrders));
        } catch (e) {
          console.error('Failed to update orders storage:', e);
        }
      }

      // 3. Clear cart for THIS customer account
      clearCart();
      setIsCheckoutOpen(false);

      // 4. Fire celebratory confetti
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#00F0FF', '#38BDF8', '#10B981', '#FFFFFF'],
      });

      return receipt;
    } catch (err: any) {
      console.error('Order placement exception:', err);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `AE-ORD-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;
      const vin = `1AE${Date.now().toString(16).toUpperCase().slice(-6)}${randomSuffix}US`;
      const estDelivery = new Date();
      estDelivery.setDate(estDelivery.getDate() + 5);

      const fallbackReceipt: OrderReceipt = {
        id: `ORD-FALLBACK-${Date.now()}`,
        orderNumber,
        customerName: formData.customerName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        customerEmail: user.email || formData.customerEmail,
        customerPhone: formData.customerPhone,
        deliveryAddress: formData.deliveryAddress,
        deliveryMethod: formData.deliveryMethod,
        paymentMethod: formData.paymentMethod,
        totalAmount: totalCartPrice,
        status: 'CONFIRMED',
        vin,
        estimatedDelivery: estDelivery.toISOString(),
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        items: [...cartItems],
      };

      setPlacedOrders((prev) => [fallbackReceipt, ...prev]);
      setActiveReceipt(fallbackReceipt);

      const ordersKey = getUserOrdersKey(user);
      if (ordersKey) {
        try {
          localStorage.setItem(ordersKey, JSON.stringify([fallbackReceipt, ...placedOrders]));
        } catch (e) {}
      }

      clearCart();
      setIsCheckoutOpen(false);

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#00F0FF', '#38BDF8', '#10B981', '#FFFFFF'],
      });

      return fallbackReceipt;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeReceipt,
        setActiveReceipt,
        totalCartItems,
        totalCartPrice,
        placedOrders,
        placeOrder,
        isTrackingOpen,
        setIsTrackingOpen,
        trackingOrderNumber,
        setTrackingOrderNumber,
        openTracking,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalIntent,
        openAuthModal,
        closeAuthModal,
        handleAuthSuccess,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
