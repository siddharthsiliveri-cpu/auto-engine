import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useCart, OrderReceipt } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  RefreshCw,
  MapPin,
  Car,
  Download,
  Copy,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Sliders,
} from 'lucide-react';

interface DeliveryTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

const STAGES = [
  { key: 'CONFIRMED', label: 'Order Confirmed', description: 'Production allocation confirmed' },
  { key: 'FABRICATION', label: 'Chassis Fabrication', description: 'Carbon composite monocoque shaping' },
  { key: 'ASSEMBLY', label: 'Bespoke Assembly', description: 'Hand-crafted paint & interior fitment' },
  { key: 'QUALITY_AUDIT', label: 'Dyno & Quality Audit', description: '320+ km/h aerodynamic & powertrain testing' },
  { key: 'IN_TRANSIT', label: 'Enclosed Carrier', description: 'White-glove climate-controlled transit' },
  { key: 'DELIVERED', label: 'Client Handover', description: 'Vehicle officially delivered & titled' },
];

export const DeliveryTrackingModal: React.FC<DeliveryTrackingModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber,
}) => {
  const { placedOrders } = useCart();
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState(initialOrderNumber || '');
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedVin, setCopiedVin] = useState(false);

  // Sync initial order number if provided
  useEffect(() => {
    if (initialOrderNumber) {
      setSearchInput(initialOrderNumber);
      handleTrack(initialOrderNumber);
    } else if (placedOrders && placedOrders.length > 0) {
      const latest = placedOrders[0];
      setSearchInput(latest.orderNumber);
      handleTrack(latest.orderNumber);
    }
  }, [isOpen, initialOrderNumber]);

  const handleTrack = async (queryToTrack?: string) => {
    const q = (queryToTrack || searchInput || '').trim();
    if (!q) {
      setErrorMsg('Please enter an Order Number or VIN to track.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.orders.track(q);
      if (res.success && res.data) {
        setActiveOrder(res.data);
      } else {
        setErrorMsg(res.message || 'No active vehicle build order found for this reference.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not locate order. Please check the Order Number or VIN.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStageIndex = (status: string) => {
    const idx = STAGES.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const handleCopyVin = (vin: string) => {
    navigator.clipboard.writeText(vin);
    setCopiedVin(true);
    setTimeout(() => setCopiedVin(false), 2000);
  };

  const handleDownloadSpec = () => {
    if (!activeOrder) return;
    const content = `=====================================================
AUTOENGINE AUTOMOTIVE DIGITAL ENGINEERING PLATFORM
OFFICIAL CLIENT DELIVERY TRACKING & SPECIFICATION SHEET
=====================================================
Order Number:        ${activeOrder.orderNumber}
Assigned VIN:        ${activeOrder.vin || 'PENDING ALLOCATION'}
Current Status:      ${activeOrder.status}
Customer Name:       ${activeOrder.customerName}
Delivery Address:    ${activeOrder.deliveryAddress}
Estimated Handover:  ${
      activeOrder.estimatedDelivery
        ? new Date(activeOrder.estimatedDelivery).toLocaleDateString()
        : 'Scheduled'
    }
Total Order Value:   $${Number(activeOrder.totalAmount).toLocaleString()} USD
=====================================================
Thank you for engineering your dream automobile with AUTOENGINE.
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TRACKING-${activeOrder.orderNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const currentStageIdx = activeOrder ? getStageIndex(activeOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#0A0C10] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* Header Bar */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#111318]/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest font-bold">
                  REAL-TIME LOGISTICS DISPATCH
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
              </div>
              <h2 className="text-xl font-display font-extrabold text-white tracking-wide">
                Vehicle Delivery Tracking
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Order Selection Sub-Header */}
        <div className="p-4 bg-black/40 border-b border-white/10 space-y-3 font-mono text-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter your Order Number (e.g. AE-ORD-...) or 17-digit VIN..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-[#111318] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#00F0FF] text-black font-bold uppercase hover:bg-white transition-all flex items-center space-x-1.5 shadow-md shadow-[#00F0FF]/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Track Build</span>
            </button>
          </form>

          {/* Quick Select Buttons from Recent Orders */}
          {placedOrders.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pt-1">
              <span className="text-[10px] text-neutral-500 uppercase">Your Orders:</span>
              {placedOrders.map((o) => (
                <button
                  key={o.id || o.orderNumber}
                  onClick={() => {
                    setSearchInput(o.orderNumber);
                    handleTrack(o.orderNumber);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all border ${
                    activeOrder?.orderNumber === o.orderNumber
                      ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] font-bold'
                      : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {o.orderNumber} ({o.items?.[0]?.vehicleName || 'Build'})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeOrder ? (
            <>
              {/* Top Highlights Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#00F0FF]/10 via-[#111318] to-transparent border border-[#00F0FF]/30">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest block">
                    CURRENT DISPATCH STATUS
                  </span>
                  <div className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
                    <span>{STAGES[currentStageIdx]?.label || activeOrder.status}</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 block">
                    {STAGES[currentStageIdx]?.description}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                    ESTIMATED DELIVERY DATE
                  </span>
                  <div className="text-lg font-bold text-emerald-400 flex items-center space-x-2 font-mono">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>
                      {activeOrder.estimatedDelivery
                        ? new Date(activeOrder.estimatedDelivery).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Scheduled in 5-6 Days (Express Handover)'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400 block">
                    Method: {activeOrder.deliveryMethod === 'WHITE_GLOVE' ? 'Enclosed Transporter' : 'Handover Center'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                    ALLOCATED VIN NUMBER
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                      {activeOrder.vin || 'PENDING ASSIGNMENT'}
                    </span>
                    {activeOrder.vin && (
                      <button
                        onClick={() => handleCopyVin(activeOrder.vin)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors"
                        title="Copy VIN"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {copiedVin && <span className="text-[10px] text-emerald-400 font-mono">VIN Copied!</span>}
                </div>
              </div>

              {/* Visual Delivery Stepper Pipeline */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
                  PRODUCTION & FULFILLMENT TIMELINE
                </span>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div
                        key={stage.key}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between font-mono ${
                          isCurrent
                            ? 'bg-[#00F0FF]/15 border-[#00F0FF] shadow-lg shadow-[#00F0FF]/15'
                            : isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white/[0.02] border-white/5 opacity-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isCurrent
                                ? 'bg-[#00F0FF] text-black'
                                : isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-white/10 text-neutral-500'
                            }`}
                          >
                            0{idx + 1}
                          </span>
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-neutral-500" />
                          )}
                        </div>

                        <div>
                          <div
                            className={`text-[11px] font-bold leading-tight ${
                              isCurrent ? 'text-[#00F0FF]' : isCompleted ? 'text-white' : 'text-neutral-500'
                            }`}
                          >
                            {stage.label}
                          </div>
                          <div className="text-[9px] text-neutral-400 mt-1 line-clamp-2">
                            {stage.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Details & Ordered Vehicles Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Destination & Client Info */}
                <div className="p-4 rounded-2xl bg-[#111318] border border-white/10 font-mono text-xs space-y-2">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">
                    DESTINATION & RECIPIENT
                  </span>
                  <div className="text-white font-bold">{activeOrder.customerName}</div>
                  <div className="text-neutral-400 flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                    <span>{activeOrder.deliveryAddress}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 pt-1">
                    Contact: {activeOrder.customerEmail}
                  </div>
                  {activeOrder.notes && (
                    <div className="text-[10px] text-[#38BDF8] pt-1">Notes: {activeOrder.notes}</div>
                  )}
                </div>

                {/* Ordered Vehicles & Modified Items */}
                <div className="md:col-span-2 p-4 rounded-2xl bg-[#111318] border border-white/10 font-mono text-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
                      ORDERED VEHICLE BUILD ({activeOrder.items?.length || 1})
                    </span>
                    <span className="text-[#00F0FF] font-bold">
                      Build Total: ${Number(activeOrder.totalAmount).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {activeOrder.items?.map((item: any, iIdx: number) => {
                      const mods = item.modifications
                        ? item.modifications
                        : item.modificationsJson
                        ? JSON.parse(item.modificationsJson)
                        : [];

                      return (
                        <div key={iIdx} className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/5">
                          <div className="flex justify-between font-bold text-white">
                            <span className="flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-[#00F0FF]" />
                              <span>{item.vehicleName}</span>
                            </span>
                            <span className="text-emerald-400">${Number(item.totalPrice).toLocaleString()}</span>
                          </div>

                          {mods.length > 0 && (
                            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                              {mods.map((m: any, mIdx: number) => (
                                <div key={mIdx} className="text-neutral-300 flex items-center space-x-1">
                                  <span className="w-1 h-1 rounded-full bg-[#00F0FF]" />
                                  <span className="truncate">{m.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 space-y-3 font-mono text-xs text-neutral-400">
              <Truck className="w-8 h-8 text-neutral-600 mx-auto" />
              <p>Enter your Order Number or VIN to track production, inspection, and carrier delivery.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-[#111318]/90 flex items-center justify-between font-mono text-xs">
          {activeOrder ? (
            <button
              onClick={handleDownloadSpec}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Tracking Slip</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00F0FF] text-black font-bold uppercase hover:bg-white transition-colors"
          >
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTrackingModal;
