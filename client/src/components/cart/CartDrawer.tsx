import React, { useState } from 'react';
import { useCart, CartItem } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  CreditCard,
  Building,
  Coins,
  FileText,
  Car,
  Sliders,
  Sparkles,
  Download,
} from 'lucide-react';
import { Magnetic } from '../core/magnetic';
import { OrderSuccessAnimation } from './OrderSuccessAnimation';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalCartItems,
    totalCartPrice,
    isCheckoutOpen,
    setIsCheckoutOpen,
    activeReceipt,
    setActiveReceipt,
    placeOrder,
    openTracking,
    openAuthModal,
  } = useCart();

  const { user } = useAuth();

  // Checkout Form State
  const [customerName, setCustomerName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client' : ''
  );
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 234-5678');
  const [deliveryMethod, setDeliveryMethod] = useState<'WHITE_GLOVE' | 'FACTORY_COLLECTION'>('WHITE_GLOVE');
  const [deliveryAddress, setDeliveryAddress] = useState('742 Evergreen Terrace, Silicon Valley, CA 94025');
  const [paymentMethod, setPaymentMethod] = useState<'WIRE_TRANSFER' | 'CRYPTO_ESCROW' | 'CORPORATE_PO' | 'CREDIT_CARD'>('WIRE_TRANSFER');
  const [notes, setNotes] = useState('Custom door sill plate engraved: "FIRST EDITION 001"');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Sync user details if user logs in
  React.useEffect(() => {
    if (user) {
      if (!customerName || customerName === 'Client') {
        setCustomerName(`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client');
      }
      if (!customerEmail) {
        setCustomerEmail(user.email);
      }
    }
  }, [user]);

  const handleOpenCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      openAuthModal('cart');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail) {
      alert('Please provide your name and contact email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await placeOrder({
        customerName,
        customerEmail,
        customerPhone,
        deliveryMethod,
        deliveryAddress:
          deliveryMethod === 'FACTORY_COLLECTION'
            ? 'Stuttgart Customer Handover Pavilion & Proving Ground'
            : deliveryAddress,
        paymentMethod,
        notes,
      });
      setShowSuccessAnimation(true);
    } catch (err: any) {
      console.error('Order error:', err);
      alert('Order placement failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadInvoice = (receipt: typeof activeReceipt) => {
    if (!receipt) return;
    const content = `=====================================================
AUTOENGINE AUTOMOTIVE DIGITAL ENGINEERING PLATFORM
OFFICIAL VEHICLE BUILD ORDER RECEIPT & PRODUCTION SPEC
=====================================================
Order Number:        ${receipt.orderNumber}
Assigned VIN:        ${receipt.vin || 'PENDING ALLOCATION'}
Date Placed:         ${new Date(receipt.createdAt).toLocaleString()}
Status:              ${receipt.status}
Customer Name:       ${receipt.customerName}
Customer Email:      ${receipt.customerEmail}
Contact Phone:       ${receipt.customerPhone || 'N/A'}
Delivery Method:     ${receipt.deliveryMethod}
Delivery Location:   ${receipt.deliveryAddress}
Payment Method:      ${receipt.paymentMethod}
Estimated Handover:  ${receipt.estimatedDelivery ? new Date(receipt.estimatedDelivery).toLocaleDateString() : '5-6 Days Express Handover'}
-----------------------------------------------------
ORDERED VEHICLES & MODIFIED SPECIFICATIONS:
-----------------------------------------------------
${receipt.items
  .map((item: any, idx: number) => {
    const mods = item.modifications
      ? item.modifications
      : item.modificationsJson
      ? JSON.parse(item.modificationsJson)
      : [];
    return `[Item ${idx + 1}] ${item.vehicleName || item.vehicleModelName} (${item.variantName || 'Custom Variant'})
Quantity:       ${item.quantity || 1}
Base MSRP:      $${Number(item.basePrice).toLocaleString()}
Build Total:    $${Number(item.totalPrice).toLocaleString()}
Config Code:    ${item.configCode || 'N/A'}
Selected Modifications & Custom Options:
${mods.map((m: any) => `  - ${m.category}: ${m.name} ${m.cost > 0 ? `(+$${m.cost.toLocaleString()})` : '(Included)'}`).join('\n')}
`;
  })
  .join('\n-----------------------------------------------------\n')}
=====================================================
TOTAL ORDER VALUE:   $${Number(receipt.totalAmount).toLocaleString()} USD
Factory Inspection:  INCLUDED (COMPLIMENTARY)
Enclosed Transport:  INCLUDED (COMPLIMENTARY)
=====================================================
Thank you for engineering your dream automobile with AUTOENGINE.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AUTOENGINE-ORDER-${receipt.orderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. SLIDE-OVER CART DRAWER                                */}
      {/* ======================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop blur */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Drawer Panel */}
          <aside className="relative z-10 w-full max-w-xl bg-[#09090B] border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden text-white">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-white tracking-wide">
                    Engineering Cart
                  </h2>
                  <p className="text-xs font-mono text-neutral-400">
                    {totalCartItems} {totalCartItems === 1 ? 'vehicle build' : 'vehicle builds / items'} selected
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    openTracking();
                  }}
                  className="text-xs font-mono text-neutral-300 hover:text-[#00F0FF] transition-colors flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#00F0FF]/10 border border-white/10"
                  title="Track Delivery & Order Status"
                >
                  <Truck className="w-3.5 h-3.5 text-[#00F0FF]" />
                  <span className="hidden sm:inline">Track Delivery</span>
                </button>

                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs font-mono text-neutral-400 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-neutral-400">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Car className="w-8 h-8 text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-1">Your cart is currently empty</h3>
                    <p className="text-xs max-w-xs leading-relaxed text-neutral-500">
                      Configure your vehicle in the 3D Studio or select performance components from the library to add them here.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs font-mono text-[#00F0FF] hover:underline pt-2 inline-flex items-center gap-1"
                  >
                    <span>Return to Vehicle Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-[#111318]/90 border border-white/10 hover:border-white/20 transition-all space-y-4 relative group"
                  >
                    {/* Top Row: Vehicle title & Delete button */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-[#00F0FF] px-2 py-0.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 uppercase font-bold">
                            {item.type === 'custom_vehicle' ? 'Bespoke Build' : 'Component'}
                          </span>
                          {item.configCode && (
                            <span className="text-[10px] font-mono text-neutral-500">
                              {item.configCode}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-display font-bold text-white">
                          {item.vehicleModelName}
                        </h4>
                        {item.variantName && (
                          <div className="text-xs text-neutral-400 font-mono">
                            {item.variantName}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove build from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* All Modified Items Selected by the Customer */}
                    {item.modifications && item.modifications.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                          Customized Modifications Selected:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
                          {item.modifications.map((mod, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center space-x-2 truncate">
                                {mod.colorPreview && (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/30"
                                    style={{ backgroundColor: mod.colorPreview }}
                                  />
                                )}
                                <div className="truncate">
                                  <span className="text-neutral-400 text-[9px] block uppercase">
                                    {mod.category}
                                  </span>
                                  <span className="text-white font-medium truncate block">
                                    {mod.name}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[#00F0FF] shrink-0 text-[10px] font-bold">
                                {mod.cost > 0 ? `+$${mod.cost.toLocaleString()}` : 'Std'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Row: Quantity Controls & Price */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-black/40 border border-white/10 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-neutral-500 block">Item Total</span>
                        <span className="text-base font-display font-extrabold text-[#00F0FF]">
                          ${(item.totalPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout Action */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/60 space-y-4">
                {/* Cost breakdown */}
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Base Vehicle & Modifications:</span>
                    <span className="text-white">${totalCartPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Factory Pre-Delivery Inspection (PDI):</span>
                    <span className="text-emerald-400 font-bold">COMPLIMENTARY</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Enclosed White-Glove Transport:</span>
                    <span className="text-emerald-400 font-bold">COMPLIMENTARY</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm">
                    <span className="font-display font-bold text-white uppercase tracking-wider">
                      Grand Total (USD):
                    </span>
                    <span className="text-xl font-display font-extrabold text-[#00F0FF]">
                      ${totalCartPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Primary Action Button: Buy / Place Order */}
                <Magnetic intensity={0.2} range={80}>
                  <button
                    onClick={handleOpenCheckout}
                    className="w-full bg-gradient-to-r from-[#00F0FF] to-[#0070F3] hover:from-white hover:to-white text-black font-display font-extrabold text-xs uppercase py-4 rounded-2xl transition-all shadow-xl shadow-[#00F0FF]/25 flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Buy Now & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Magnetic>

                <div className="flex items-center justify-center space-x-4 text-[10px] font-mono text-neutral-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>ACID Database Secured</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Direct Factory Allocation</span>
                  </span>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CHECKOUT & ORDER CONFIRMATION MODAL                   */}
      {/* ======================================================== */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            onClick={() => setIsCheckoutOpen(false)}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          />

          <div className="relative z-10 w-full max-w-2xl bg-[#09090B] border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00F0FF]/15 border border-[#00F0FF]/30 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-extrabold text-white">
                    Place Vehicle Build Order
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    Verify client allocation and delivery handover details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmOrder} className="flex-1 overflow-y-auto py-5 space-y-5">
              {/* Client Credentials */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest block font-bold">
                  1. Client & Commissioning Contact
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Elena Vance"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="client@autoengine.engineering"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 019-2831"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

              {/* Delivery Logistics */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest block font-bold">
                  2. Handover & Delivery Destination
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('WHITE_GLOVE')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      deliveryMethod === 'WHITE_GLOVE'
                        ? 'bg-[#00F0FF]/10 border-[#00F0FF] text-white'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <Truck className="w-4 h-4 mb-1 text-[#00F0FF]" />
                    <div className="text-xs font-bold font-display">White-Glove Transport</div>
                    <div className="text-[10px] font-mono text-neutral-400">Direct enclosed delivery to residence</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('FACTORY_COLLECTION')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      deliveryMethod === 'FACTORY_COLLECTION'
                        ? 'bg-[#00F0FF]/10 border-[#00F0FF] text-white'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <Building className="w-4 h-4 mb-1 text-[#00F0FF]" />
                    <div className="text-xs font-bold font-display">Factory Handover</div>
                    <div className="text-[10px] font-mono text-neutral-400">Stuttgart Experience Center Collection</div>
                  </button>
                </div>

                {deliveryMethod === 'WHITE_GLOVE' && (
                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                      Delivery Destination Address
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Street address, City, Country"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                    />
                  </div>
                )}
              </div>

              {/* Payment Protocol */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest block font-bold">
                  3. Escrow & Settlement Protocol
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'WIRE_TRANSFER', label: 'Bank Wire', icon: Building, desc: 'SWIFT / Fedwire' },
                    { id: 'CRYPTO_ESCROW', label: 'Crypto Escrow', icon: Coins, desc: 'USDC / ETH' },
                    { id: 'CORPORATE_PO', label: 'Corporate PO', icon: FileText, desc: 'Enterprise Net 30' },
                    { id: 'CREDIT_CARD', label: 'Card / Stripe', icon: CreditCard, desc: 'Instant Hold' },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = paymentMethod === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaymentMethod(p.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#00F0FF]/15 border-[#00F0FF] text-white shadow-lg shadow-[#00F0FF]/10'
                            : 'bg-white/5 border-white/10 text-neutral-400 hover:border-white/20'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1 text-[#00F0FF]" />
                        <div className="text-xs font-bold font-display">{p.label}</div>
                        <div className="text-[9px] font-mono text-neutral-500">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Special Commission Notes */}
              <div>
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                  Commission Notes / Plaque Inscription (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Personalized cockpit plaque inscription"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              {/* Order Final Review */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase">Total Order Allocation</span>
                  <span className="text-white font-bold">{totalCartItems} Custom Build(s)</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400 block text-[10px] uppercase">Final Price (USD)</span>
                  <span className="text-[#00F0FF] font-extrabold text-lg">${totalCartPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 font-mono text-xs transition-colors"
                >
                  Cancel
                </button>

                <Magnetic intensity={0.2} range={80}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-2xl bg-[#00F0FF] hover:bg-white text-black font-display font-extrabold text-xs uppercase transition-all shadow-xl shadow-[#00F0FF]/30 flex items-center space-x-2"
                  >
                    <span>{isSubmitting ? 'Allocating Build Slot...' : 'Confirm & Place Order'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Magnetic>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2.5. FUTURISTIC POST-ORDER CINEMATIC ANIMATION OVERLAY   */}
      {/* ======================================================== */}
      {showSuccessAnimation && activeReceipt && (
        <OrderSuccessAnimation
          orderNumber={activeReceipt.orderNumber}
          vin={activeReceipt.vin}
          customerName={activeReceipt.customerName}
          totalAmount={activeReceipt.totalAmount}
          deliveryMethod={activeReceipt.deliveryMethod}
          estimatedDelivery={activeReceipt.estimatedDelivery}
          onViewReceipt={() => setShowSuccessAnimation(false)}
          onTrackDelivery={() => {
            const num = activeReceipt.orderNumber;
            setShowSuccessAnimation(false);
            setActiveReceipt(null);
            openTracking(num);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 3. ORDER RECEIPT & CONFIRMATION MODAL                    */}
      {/* ======================================================== */}
      {activeReceipt && !showSuccessAnimation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            onClick={() => setActiveReceipt(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
          />

          <div className="relative z-10 w-full max-w-2xl bg-[#09090B] border border-emerald-500/40 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-white glow-cyan">
            {/* Success Header */}
            <div className="text-center pb-6 border-b border-white/10 space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase font-bold tracking-widest inline-block">
                BUILD ALLOCATION CONFIRMED
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-extrabold text-white">
                Order Placed Successfully!
              </h3>
              <p className="text-xs font-mono text-neutral-400 max-w-md mx-auto">
                Your custom vehicle configuration has been committed to the production queue with full database integrity.
              </p>
            </div>

            {/* Receipt Summary Grid */}
            <div className="flex-1 overflow-y-auto py-5 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">ORDER NUMBER</span>
                  <span className="text-[#00F0FF] font-bold">{activeReceipt.orderNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">ASSIGNED VIN</span>
                  <span className="text-white font-bold">{activeReceipt.vin || '1AE911TB8SA094821'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">TOTAL AMOUNT</span>
                  <span className="text-[#00F0FF] font-bold">${Number(activeReceipt.totalAmount).toLocaleString()} USD</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">CLIENT NAME</span>
                  <span className="text-white font-medium">{activeReceipt.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">DELIVERY METHOD</span>
                  <span className="text-white font-medium">
                    {activeReceipt.deliveryMethod === 'WHITE_GLOVE' ? 'White-Glove Transport' : 'Factory Handover'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">PAYMENT SETTLEMENT</span>
                  <span className="text-emerald-400 font-medium">{activeReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Ordered Items Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block font-bold">
                  Commissioned Vehicles & Modified Options:
                </span>
                {activeReceipt.items?.map((item: any, idx: number) => {
                  const mods = item.modifications
                    ? item.modifications
                    : item.modificationsJson
                    ? JSON.parse(item.modificationsJson)
                    : [];
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-white font-display font-bold text-sm">
                            {item.vehicleName || item.vehicleModelName}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {item.variantName || 'Bespoke Engineering Specification'} • Qty: {item.quantity || 1}
                          </div>
                        </div>
                        <span className="text-[#00F0FF] font-bold">
                          ${Number(item.totalPrice).toLocaleString()}
                        </span>
                      </div>

                      {mods.length > 0 && (
                        <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
                          {mods.map((m: any, mIdx: number) => (
                            <span
                              key={mIdx}
                              className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-neutral-300"
                            >
                              <strong className="text-neutral-400">{m.category}:</strong> {m.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Receipt Modal Footer Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleDownloadInvoice(activeReceipt)}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center space-x-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>Download Build Sheet (TXT)</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const orderNum = activeReceipt.orderNumber;
                    setActiveReceipt(null);
                    openTracking(orderNum);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-[#00F0FF] text-white hover:text-black font-display font-extrabold text-xs uppercase transition-all flex items-center space-x-1.5 border border-white/10"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Vehicle Delivery</span>
                </button>

                <button
                  onClick={() => setActiveReceipt(null)}
                  className="px-6 py-2.5 rounded-2xl bg-[#00F0FF] text-black hover:bg-white font-display font-extrabold text-xs uppercase transition-all shadow-lg shadow-[#00F0FF]/30"
                >
                  Done & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
