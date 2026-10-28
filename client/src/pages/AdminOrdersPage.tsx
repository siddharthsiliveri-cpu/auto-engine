import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Car,
  ChevronDown,
  ChevronUp,
  Save,
  Download,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface OrderItem {
  id: string;
  vehicleName: string;
  variantName?: string;
  configCode?: string;
  basePrice: number;
  totalPrice: number;
  quantity: number;
  modificationsJson?: string;
  paintColor?: string;
  paintFinish?: string;
  wheelStyle?: string;
  tyreStyle?: string;
  spoilerStyle?: string;
  caliperColor?: string;
  interiorTrim?: string;
  exhaustStyle?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
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
  items: OrderItem[];
}

export const AdminOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Editing state for order status / delivery date
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>('CONFIRMED');
  const [editEstimatedDate, setEditEstimatedDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.orders.getAll();
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load orders for admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStartEdit = (order: Order) => {
    setEditingOrderId(order.id);
    setEditStatus(order.status);
    setEditEstimatedDate(
      order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : ''
    );
    setEditNotes(order.notes || '');
  };

  const handleSaveEdit = async (orderId: string) => {
    setIsUpdating(true);
    setUpdateFeedback(null);
    try {
      const res = await api.orders.updateStatus(orderId, {
        status: editStatus,
        estimatedDelivery: editEstimatedDate || undefined,
        notes: editNotes,
      });

      if (res.success) {
        setUpdateFeedback(`Order updated successfully!`);
        setEditingOrderId(null);
        await fetchOrders();
        setTimeout(() => setUpdateFeedback(null), 3500);
      } else {
        alert(res.message || 'Failed to update order');
      }
    } catch (err: any) {
      console.error('Failed to update order:', err);
      alert(err.message || 'Error updating order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.vin && o.vin.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const inProductionCount = orders.filter((o) =>
    ['CONFIRMED', 'FABRICATION', 'ASSEMBLY', 'QUALITY_AUDIT'].includes(o.status)
  ).length;
  const inTransitCount = orders.filter((o) => o.status === 'IN_TRANSIT').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'Order Confirmed', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'FABRICATION':
        return { label: 'Chassis Fabrication', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'ASSEMBLY':
        return { label: 'Bespoke Assembly', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' };
      case 'QUALITY_AUDIT':
        return { label: 'Dyno & Quality Audit', color: 'bg-cyan-500/10 text-[#00F0FF] border-[#00F0FF]/30' };
      case 'IN_TRANSIT':
        return { label: 'Carrier In-Transit', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'DELIVERED':
        return { label: 'Delivered to Client', color: 'bg-green-500/20 text-green-300 border-green-500/40' };
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      default:
        return { label: status, color: 'bg-white/10 text-white border-white/20' };
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8 max-w-[1700px] mx-auto text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#00F0FF] uppercase tracking-widest mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Fulfillment & Dispatch Console</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight uppercase">
            Client Orders & Deliveries
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            Comprehensive audit log of all customer orders, custom specifications, delivery schedules, and carrier handovers.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      {/* Update Feedback Toast */}
      {updateFeedback && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{updateFeedback}</span>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#09090B] space-y-1">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-mono">
            <span>TOTAL CLIENT ORDERS</span>
            <Package className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="text-2xl md:text-3xl font-display font-black text-white">{orders.length}</div>
          <div className="text-[10px] text-neutral-500 font-mono">All-time database records</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#09090B] space-y-1">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-mono">
            <span>TOTAL ORDER VALUE</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl md:text-3xl font-display font-black text-emerald-400">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">Gross build allocations</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#09090B] space-y-1">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-mono">
            <span>ACTIVE IN PRODUCTION</span>
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl md:text-3xl font-display font-black text-amber-400">{inProductionCount}</div>
          <div className="text-[10px] text-neutral-500 font-mono">Chassis & Assembly stages</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-[#09090B] space-y-1">
          <div className="flex justify-between items-center text-neutral-400 text-xs font-mono">
            <span>DISPATCH / DELIVERED</span>
            <Truck className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl md:text-3xl font-display font-black text-[#38BDF8]">
            {inTransitCount + deliveredCount}
          </div>
          <div className="text-[10px] text-neutral-500 font-mono">
            {inTransitCount} En-route • {deliveredCount} Completed
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, Email, or VIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111318] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#00F0FF]"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto scrollbar-none font-mono text-xs">
          <span className="text-neutral-500 uppercase text-[10px] pr-1">Filter:</span>
          {['ALL', 'CONFIRMED', 'FABRICATION', 'ASSEMBLY', 'QUALITY_AUDIT', 'IN_TRANSIT', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#00F0FF] text-black font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center py-24 space-y-3 font-mono text-xs text-neutral-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#00F0FF]" />
          <p>Loading client orders from database...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 rounded-3xl bg-[#09090B] border border-white/10 space-y-3 font-mono text-neutral-400">
          <Package className="w-8 h-8 mx-auto text-neutral-600" />
          <p className="text-sm">No orders matching your criteria found.</p>
          <p className="text-xs text-neutral-500">
            {orders.length === 0
              ? 'No customer orders have been placed in the database yet.'
              : 'Try clearing the search query or status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isEditing = editingOrderId === order.id;
            const badge = getStatusBadge(order.status);

            return (
              <div
                key={order.id}
                className="rounded-3xl bg-[#0B0D12] border border-white/10 hover:border-white/20 transition-all overflow-hidden shadow-xl"
              >
                {/* Order Summary Header Bar */}
                <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00F0FF] tracking-wider">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        Placed {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-300">
                      <span className="flex items-center gap-1 font-bold text-white">
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{order.customerName}</span>
                      </span>
                      <span className="flex items-center gap-1 text-neutral-400">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{order.customerEmail}</span>
                      </span>
                      {order.customerPhone && (
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.customerPhone}</span>
                        </span>
                      )}
                      {order.vin && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                          VIN: <span className="font-bold text-white">{order.vin}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end md:self-auto">
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-neutral-400 uppercase">ORDER TOTAL</div>
                      <div className="text-lg md:text-xl font-display font-extrabold text-emerald-400">
                        ${Number(order.totalAmount).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white transition-colors"
                      title={isExpanded ? 'Collapse Details' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Section */}
                {isExpanded && (
                  <div className="p-6 bg-black/40 space-y-6 text-xs font-mono">
                    {/* Delivery & Payment Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest block mb-1">
                          DELIVERY DESTINATION & METHOD
                        </span>
                        <div className="text-white font-medium flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </div>
                        <div className="text-[11px] text-[#38BDF8] mt-1">
                          Method: {order.deliveryMethod === 'WHITE_GLOVE' ? 'White-Glove Enclosed Carrier' : 'Factory Handover Experience'}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest block mb-1">
                          PAYMENT METHOD
                        </span>
                        <div className="text-white font-medium flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          <span>{order.paymentMethod.replace('_', ' ')}</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 mt-1">Status: VERIFIED / SETTLED</div>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest block mb-1">
                          ESTIMATED HANDOVER DATE
                        </span>
                        <div className="text-white font-bold flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#00F0FF]" />
                          <span>
                            {order.estimatedDelivery
                              ? new Date(order.estimatedDelivery).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '5-6 Days (Express)'}
                          </span>
                        </div>
                        {order.notes && (
                          <div className="text-[10px] text-neutral-400 mt-1">Notes: {order.notes}</div>
                        )}
                      </div>
                    </div>

                    {/* Ordered Items & Modifications Breakdown */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">
                        ORDERED VEHICLES & MODIFIED COMPONENTS BREAKDOWN ({order.items?.length || 0})
                      </span>

                      <div className="space-y-3">
                        {order.items?.map((item, idx) => {
                          const mods = item.modificationsJson ? JSON.parse(item.modificationsJson) : [];

                          return (
                            <div
                              key={item.id || idx}
                              className="p-4 rounded-2xl bg-[#111318] border border-white/10 space-y-3"
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-0.5">
                                  <div className="flex items-center space-x-2">
                                    <Car className="w-4 h-4 text-[#00F0FF]" />
                                    <h4 className="text-sm font-bold text-white">{item.vehicleName}</h4>
                                    {item.variantName && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-400">
                                        {item.variantName}
                                      </span>
                                    )}
                                  </div>
                                  {item.configCode && (
                                    <span className="text-[10px] text-neutral-400 font-mono">
                                      Build Code: {item.configCode}
                                    </span>
                                  )}
                                </div>

                                <div className="text-right">
                                  <div className="text-sm font-bold text-white">
                                    ${Number(item.totalPrice).toLocaleString()}
                                  </div>
                                  <div className="text-[10px] text-neutral-400">Qty: {item.quantity || 1}</div>
                                </div>
                              </div>

                              {/* Itemized Modifications */}
                              {mods.length > 0 && (
                                <div className="pt-2 border-t border-white/5 space-y-1.5">
                                  <span className="text-[9px] uppercase tracking-wider text-neutral-500 block">
                                    Selected Client Customizations:
                                  </span>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {mods.map((mod: any, mIdx: number) => (
                                      <div
                                        key={mIdx}
                                        className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[11px]"
                                      >
                                        <div className="flex items-center space-x-2">
                                          {mod.colorPreview && (
                                            <span
                                              className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                                              style={{ backgroundColor: mod.colorPreview }}
                                            />
                                          )}
                                          <div>
                                            <div className="text-white font-medium leading-tight">{mod.name}</div>
                                            <div className="text-[9px] text-neutral-400">{mod.category}</div>
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-400 shrink-0 ml-2">
                                          {mod.cost > 0 ? `+$${mod.cost.toLocaleString()}` : 'Included'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Admin Status & Delivery Management Controls */}
                    <div className="pt-4 border-t border-white/10">
                      {isEditing ? (
                        <div className="p-4 rounded-2xl bg-[#00F0FF]/5 border border-[#00F0FF]/30 space-y-4">
                          <div className="flex items-center space-x-2 text-[#00F0FF] font-bold text-xs uppercase tracking-wider">
                            <Sliders className="w-4 h-4" />
                            <span>Update Order Delivery & Production Status</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] text-neutral-400 block mb-1">FULFILLMENT STATUS</label>
                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="w-full bg-[#111318] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                              >
                                <option value="CONFIRMED">CONFIRMED (Order Received)</option>
                                <option value="FABRICATION">FABRICATION (Chassis & Aerodynamics)</option>
                                <option value="ASSEMBLY">ASSEMBLY (Interior & Paint)</option>
                                <option value="QUALITY_AUDIT">QUALITY_AUDIT (Dyno & Testing)</option>
                                <option value="IN_TRANSIT">IN_TRANSIT (Enclosed Carrier)</option>
                                <option value="DELIVERED">DELIVERED (Client Handover)</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-neutral-400 block mb-1">
                                ESTIMATED DELIVERY DATE
                              </label>
                              <input
                                type="date"
                                value={editEstimatedDate}
                                onChange={(e) => setEditEstimatedDate(e.target.value)}
                                className="w-full bg-[#111318] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-neutral-400 block mb-1">
                                CARRIER / TRACKING NOTES
                              </label>
                              <input
                                type="text"
                                placeholder="Carrier tracking # or proving ground notes"
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="w-full bg-[#111318] border border-white/15 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              onClick={() => setEditingOrderId(null)}
                              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(order.id)}
                              disabled={isUpdating}
                              className="px-5 py-2 rounded-xl bg-[#00F0FF] text-black font-bold hover:bg-white transition-colors flex items-center space-x-1.5 shadow-md shadow-[#00F0FF]/20"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{isUpdating ? 'Saving...' : 'Save & Notify Client'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-neutral-500">
                            Updates made here immediately sync with the client's live delivery tracking portal.
                          </span>

                          <button
                            onClick={() => handleStartEdit(order)}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#00F0FF] text-white hover:text-black font-bold transition-all flex items-center space-x-1.5"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Modify Status & Delivery Date</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
