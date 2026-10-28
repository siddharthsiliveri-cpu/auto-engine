import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Component, ComponentCategory, Supplier } from '../types';
import { Search, Filter, Cpu, Shield, Plus, X, Layers, CheckCircle2, AlertCircle, ArrowUpRight, ShoppingBag } from 'lucide-react';
import AutomotiveCanvas from '../components/3d/AutomotiveCanvas';
import { VehicleCustomization } from '../components/3d/VehicleModel3D';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Magnetic } from '@/components/core/magnetic';

export const ComponentLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [components, setComponents] = useState<Component[]>([]);
  const [categories, setCategories] = useState<ComponentCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New component form state
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newWeight, setNewWeight] = useState('50');
  const [newCost, setNewCost] = useState('5000');
  const [newSupplierId, setNewSupplierId] = useState('');

  const fetchComponents = async () => {
    try {
      const [compRes, catRes, supRes] = await Promise.all([
        api.components.getAll({
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          search: searchQuery || undefined,
        }),
        api.components.getCategories(),
        api.components.getSuppliers(),
      ]);

      if (compRes.success) setComponents(compRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (supRes.success) {
        setSuppliers(supRes.data);
        if (supRes.data.length > 0) setNewSupplierId(supRes.data[0].id);
      }
      if (catRes.data.length > 0 && !newCategoryId) setNewCategoryId(catRes.data[0].id);
    } catch (e) {
      console.error('Failed to load components:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [selectedCategory, searchQuery]);

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.components.create({
        categoryId: newCategoryId,
        partNumber: newPartNumber,
        name: newName,
        description: 'Engineered for next-generation 800V automotive platform.',
        manufacturer: newManufacturer || 'AutoEngine Lab',
        weightKg: parseFloat(newWeight),
        costUsd: parseFloat(newCost),
        supplierId: newSupplierId,
      });

      if (res.success) {
        setIsAddModalOpen(false);
        setNewPartNumber('');
        setNewName('');
        await fetchComponents();
      }
    } catch (err: any) {
      alert(`Component creation failed: ${err.message}`);
    }
  };

  const previewCustomization: VehicleCustomization = {
    paintColor: '#00F0FF',
    caliperColor: '#00F0FF',
    wheelStyle: 'aero',
    powertrain: 'dual',
    interiorTrim: 'carbon',
    isXRay: Boolean(selectedComponent?.name.includes('Battery') || selectedComponent?.name.includes('Motor')),
    explodedProgress: selectedComponent?.name.includes('Battery') ? 0.7 : 0,
  };

  const canAddComponent = user?.role === 'ADMIN' || user?.role === 'ENGINEER';

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#00F0FF] uppercase tracking-widest mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Digital Engineering Component Registry</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight">
            COMPONENT LIBRARY
          </h1>
        </div>

        {canAddComponent && (
          <Magnetic intensity={0.2} range={60}>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#00F0FF] text-black hover:bg-white font-bold text-xs uppercase px-5 py-2.5 rounded-full transition-all flex items-center space-x-2 shadow-lg shadow-[#00F0FF]/25"
            >
              <Plus className="w-4 h-4" />
              <span>Register Component</span>
            </button>
          </Magnetic>
        )}
      </div>

      {/* Search Bar & Category Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by part number (e.g. CMP-BAT-82KW), component name, manufacturer or certified supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00F0FF] transition-all"
          />
        </div>

        {/* Categories Carousel Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#00F0FF] text-black font-bold'
                : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            All Subsystems ({components.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.code)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.code
                  ? 'bg-[#00F0FF] text-black font-bold'
                  : 'bg-white/5 text-neutral-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {components.map((comp) => (
          <div
            key={comp.id}
            onClick={() => setSelectedComponent(comp)}
            className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-[#00F0FF]/50 transition-all cursor-pointer group flex flex-col justify-between hover:shadow-2xl hover:shadow-[#00F0FF]/10"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[#00F0FF] px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                  {comp.partNumber}
                </span>
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {comp.status}
                </span>
              </div>

              <h3 className="text-lg font-display font-bold text-white group-hover:text-[#00F0FF] transition-colors mb-1">
                {comp.name}
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
                {comp.description}
              </p>

              {/* Specifications preview */}
              <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-white/5 mb-4 font-mono text-[11px]">
                {comp.specifications?.slice(0, 2).map((s) => (
                  <div key={s.id} className="flex justify-between text-neutral-400">
                    <span>{s.specKey}</span>
                    <span className="text-white font-medium">
                      {s.specValue} {s.unit || ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between font-mono text-xs">
              <div className="text-neutral-400">
                <span>Mass: {comp.weightKg} kg</span>
                <div className="text-white font-bold">${comp.costUsd.toLocaleString()} USD</div>
              </div>
              <span className="text-[10px] text-[#00F0FF] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>3D Inspect</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 3D Component Inspector Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#0B0B0B] border border-white/15 rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setSelectedComponent(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Left 3D Viewport */}
              <div className="md:col-span-6 bg-[#080808] border border-white/10 rounded-2xl h-[340px] relative overflow-hidden">
                <AutomotiveCanvas
                  customization={previewCustomization}
                  enableControls={true}
                  autoRotate={true}
                  cameraPosition={[3.5, 1.6, 4.2]}
                />
                <div className="absolute bottom-3 left-3 text-[10px] font-mono text-[#00F0FF] bg-black/60 px-2 py-0.5 rounded">
                  3D SUB-ASSEMBLY CONTEXT
                </div>
              </div>

              {/* Right Specs Breakdown */}
              <div className="md:col-span-6 space-y-4">
                <div>
                  <span className="font-mono text-xs text-[#00F0FF] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    {selectedComponent.partNumber}
                  </span>
                  <h3 className="text-2xl font-display font-bold text-white mt-2">
                    {selectedComponent.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {selectedComponent.description}
                  </p>
                </div>

                <div className="bg-black/50 rounded-2xl p-4 border border-white/5 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-neutral-400 pb-1.5 border-b border-white/5">
                    <span>MANUFACTURER</span>
                    <span className="text-white">{selectedComponent.manufacturer}</span>
                  </div>

                  <div className="flex justify-between text-neutral-400 pb-1.5 border-b border-white/5">
                    <span>TIER-1 SUPPLIER</span>
                    <span className="text-[#00F0FF]">{selectedComponent.suppliers?.[0]?.supplier?.name || 'Bosch Mobility'}</span>
                  </div>

                  <div className="flex justify-between text-neutral-400 pb-1.5 border-b border-white/5">
                    <span>WEIGHT / MASS</span>
                    <span className="text-white">{selectedComponent.weightKg} kg</span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span>ESTIMATED UNIT COST</span>
                    <span className="text-emerald-400 font-bold">${selectedComponent.costUsd.toLocaleString()} USD</span>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">
                    Certified Technical Parameters
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedComponent.specifications?.map((s) => (
                      <div key={s.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-xs">
                        <div className="text-[10px] text-neutral-500">{s.specKey}</div>
                        <div className="text-white font-semibold">
                          {s.specValue} {s.unit || ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add to Cart Action */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!user) {
                        alert('Authentication Required: Please sign in or register to add components to your engineering cart and place orders.');
                        return;
                      }
                      addToCart({
                        type: 'component',
                        vehicleModelName: selectedComponent.name,
                        basePrice: selectedComponent.costUsd,
                        totalPrice: selectedComponent.costUsd,
                        quantity: 1,
                        modifications: [
                          {
                            category: selectedComponent.category?.name || 'Automotive Component',
                            name: selectedComponent.name,
                            spec: `Part #${selectedComponent.partNumber} • ${selectedComponent.weightKg} kg`,
                            cost: selectedComponent.costUsd,
                          },
                        ],
                      });
                      setIsCartOpen(true);
                      setSelectedComponent(null);
                    }}
                    className="w-full py-3 rounded-2xl bg-[#00F0FF] text-black hover:bg-white font-bold text-xs uppercase transition-all shadow-lg shadow-[#00F0FF]/25 flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Component to Cart (${selectedComponent.costUsd.toLocaleString()})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Component Modal (RBAC Protected) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateComponent}
            className="bg-[#0B0B0B] border border-white/15 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-display font-bold text-white">Register Engineering Component</h3>
              <button onClick={() => setIsAddModalOpen(false)} type="button" className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">PART NUMBER</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CMP-BAT-105KW"
                  value={newPartNumber}
                  onChange={(e) => setNewPartNumber(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">COMPONENT NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 105 kWh Solid-State Hypercell Pack"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">MASS (KG)</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">COST (USD)</label>
                  <input
                    type="number"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">TIER-1 CERTIFIED SUPPLIER</label>
                <select
                  value={newSupplierId}
                  onChange={(e) => setNewSupplierId(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#00F0FF]"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.country} • {s.tierLevel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#00F0FF] text-black hover:bg-white font-bold px-5 py-2 rounded-xl transition-colors"
              >
                Register & Audit Log
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ComponentLibraryPage;
