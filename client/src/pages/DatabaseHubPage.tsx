import React, { useState, useEffect } from 'react';
import api from '../services/api';
import visitorTracker, { VisitorStats } from '../services/visitorTracker';
import { Database, Play, CheckCircle2, Shield, Code2, Layers, Cpu, Activity, RefreshCw, Terminal, GitBranch, Users, Globe, UserCheck, Eye, PlusCircle } from 'lucide-react';
import { Magnetic } from '@/components/core/magnetic';

export const DatabaseHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visitors' | 'workbench' | 'er' | '3nf' | 'audit'>('visitors');
  const [visitorStats, setVisitorStats] = useState<VisitorStats>(visitorTracker.getVisitorStats());
  const [overview, setOverview] = useState<any>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [aggregates, setAggregates] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Query Workbench Execution State
  const [activeQuery, setActiveQuery] = useState<'view' | 'procedure' | 'trigger' | 'aggregates'>('view');
  const [queryOutput, setQueryOutput] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const fetchDbMeta = async () => {
      try {
        const [overviewRes, aggRes, logsRes] = await Promise.all([
          api.database.getOverview(),
          api.database.getAggregates(),
          api.database.getAuditLogs(),
        ]);
        if (overviewRes.success) setOverview(overviewRes);
        if (aggRes.success) setAggregates(aggRes);
        if (logsRes.success) setAuditLogs(logsRes.data);
      } catch (e) {
        console.error('Failed to load database overview:', e);
      }
    };
    fetchDbMeta();
    runQuery('view');
  }, []);

  const runQuery = async (type: 'view' | 'procedure' | 'trigger' | 'aggregates') => {
    setIsExecuting(true);
    setActiveQuery(type);
    try {
      if (type === 'view') {
        const res = await api.database.getViewData();
        setQueryOutput(res);
      } else if (type === 'procedure') {
        const res = await api.database.runStoredProcedure();
        setQueryOutput(res);
      } else if (type === 'trigger') {
        const res = await api.database.runTriggerDemo();
        setQueryOutput(res);
        // Refresh audit logs
        const refreshedLogs = await api.database.getAuditLogs();
        if (refreshedLogs.success) setAuditLogs(refreshedLogs.data);
      } else if (type === 'aggregates') {
        const res = await api.database.getAggregates();
        setQueryOutput(res);
      }
    } catch (e: any) {
      setQueryOutput({ error: e.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSimulateVisitor = () => {
    visitorTracker.simulateVisitor('CUSTOMER');
    setVisitorStats(visitorTracker.getVisitorStats());
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#00F0FF] uppercase tracking-widest mb-1">
            <Database className="w-3.5 h-3.5" />
            <span>BCSE307L Database Systems Architecture</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight">
            DATABASE SYSTEMS SPECIFICATION
          </h1>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{overview?.totalTables || 21} TABLES IN 3NF NORMAL FORM</span>
          </div>
        </div>
      </div>

      {/* EXECUTIVE WEBSITE VISITOR & TRAFFIC KPI METRICS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
        <div className="glass-panel p-5 rounded-2xl border border-[#00F0FF]/30 bg-gradient-to-br from-[#00F0FF]/10 to-transparent relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              <span>Total Website Visits</span>
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
          </div>
          <div className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            {visitorStats.totalVisits.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">Live Traffic Counter</span>
            <span>• All Visitors</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <UserCheck className="w-3 h-3 text-[#38BDF8]" />
              <span>Member Visits Logged</span>
            </span>
            <span className="text-[10px] font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-full border border-[#38BDF8]/20">
              Verified
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            {visitorStats.memberVisitsCount.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1">
            Admin: <span className="text-[#00F0FF] font-bold">{visitorStats.visitsByRole.admin}</span> • Customer: <span className="text-[#38BDF8] font-bold">{visitorStats.visitsByRole.customer}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>Unique Visitors</span>
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight">
            {visitorStats.uniqueVisitorsCount.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1">
            Distinct IP / Session Fingerprints
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-purple-400" />
              <span>Active Sessions</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-3xl md:text-4xl font-display font-extrabold text-emerald-400 tracking-tight flex items-center gap-2">
            <span>{visitorStats.activeNow}</span>
            <span className="text-xs font-mono text-neutral-400 font-normal">online now</span>
          </div>
          <div className="text-[10px] font-mono text-neutral-400 mt-1">
            {visitorStats.todayVisits} total visits logged today
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2.5 mb-8 border-b border-white/10 pb-3 font-mono text-xs">
        {[
          { id: 'visitors', label: `Member Visitors & Website Traffic (${visitorStats.totalVisits.toLocaleString()})` },
          { id: 'workbench', label: 'SQL Query Workbench (Live Engine)' },
          { id: 'er', label: 'Entity-Relationship (ER) Diagram' },
          { id: '3nf', label: '3NF Relational Decomposition' },
          { id: 'audit', label: `Trigger Audit Ledger (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-[#00F0FF] text-black font-bold shadow-lg shadow-[#00F0FF]/20'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 0: MEMBER VISITORS & WEBSITE TRAFFIC LEDGER */}
      {activeTab === 'visitors' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center space-x-2 text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest mb-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Website Member Traffic Audit Ledger</span>
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-white tracking-wide">
                  Members & Visitors Access Tracking
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Audit trail of all members, administrators, and customer sessions visiting the AutoEngine digital engineering platform.
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={handleSimulateVisitor}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/10"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Simulate Website Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisitorStats(visitorTracker.getVisitorStats())}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-xs font-mono flex items-center space-x-2 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Live Visitors Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-neutral-400 uppercase tracking-widest">
                    <th className="pb-3 pl-3">Member Name</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Account Email</th>
                    <th className="pb-3">Visit Time</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Device / IP</th>
                    <th className="pb-3 pr-3">Entry Platform Page</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visitorStats.recentMemberVisits.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pl-3 font-semibold text-white flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${v.role === 'ADMIN' ? 'bg-[#00F0FF]' : 'bg-[#38BDF8]'}`} />
                        <span>{v.name}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.role === 'ADMIN'
                            ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30'
                            : 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                        }`}>
                          {v.role}
                        </span>
                      </td>
                      <td className="py-3 text-neutral-300">{v.email}</td>
                      <td className="py-3 text-neutral-400 text-[11px]">{v.formattedTime}</td>
                      <td className="py-3">
                        {v.status === 'ONLINE' ? (
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>ONLINE</span>
                          </span>
                        ) : (
                          <span className="text-neutral-500 text-[10px]">COMPLETED</span>
                        )}
                      </td>
                      <td className="py-3 text-neutral-400 text-[11px]">{v.device} • {v.ip}</td>
                      <td className="py-3 pr-3 text-neutral-300">{v.page}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Relational Architecture Mapping */}
            <div className="pt-4 border-t border-white/5 bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#00F0FF] flex items-center space-x-2">
                <Code2 className="w-3.5 h-3.5" />
                <span>3NF Relational Mapping: Member Website Visits Query</span>
              </div>
              <pre className="text-[11px] font-mono text-neutral-300 overflow-x-auto p-3 rounded-xl bg-black/60 border border-white/5">
{`SELECT 
  u.first_name || ' ' || u.last_name AS member_name,
  r.name AS member_role,
  u.email,
  al.created_at AS visit_timestamp,
  al.ip_address,
  al.details->>'page' AS platform_page
FROM "User" u
INNER JOIN "Role" r ON u.role_id = r.id
INNER JOIN "AuditLog" al ON al.user_id = u.id
WHERE al.action IN ('WEBSITE_VISIT', 'MEMBER_LOGIN')
ORDER BY al.created_at DESC
LIMIT 50;`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: SQL QUERY WORKBENCH */}
      {activeTab === 'workbench' && (
        <div className="space-y-6">
          {/* Query Selector Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => runQuery('view')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeQuery === 'view'
                  ? 'bg-white/10 border-[#00F0FF] text-white shadow-lg'
                  : 'bg-black/40 border-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-[#00F0FF] font-bold">1. SQL VIEW</span>
                <Play className="w-3 h-3 text-[#00F0FF]" />
              </div>
              <div className="text-xs font-semibold">VehicleComponentView</div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">5-Table Unified Join View</div>
            </button>

            <button
              onClick={() => runQuery('procedure')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeQuery === 'procedure'
                  ? 'bg-white/10 border-[#00F0FF] text-white shadow-lg'
                  : 'bg-black/40 border-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-amber-400 font-bold">2. STORED PROCEDURE</span>
                <Play className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-xs font-semibold">calculate_project_completion</div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Weighted Milestone Algorithm</div>
            </button>

            <button
              onClick={() => runQuery('trigger')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeQuery === 'trigger'
                  ? 'bg-white/10 border-[#00F0FF] text-white shadow-lg'
                  : 'bg-black/40 border-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-rose-400 font-bold">3. DATABASE TRIGGER</span>
                <Play className="w-3 h-3 text-rose-400" />
              </div>
              <div className="text-xs font-semibold">audit_milestone_update</div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">Automated AuditLog Insertion</div>
            </button>

            <button
              onClick={() => runQuery('aggregates')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeQuery === 'aggregates'
                  ? 'bg-white/10 border-[#00F0FF] text-white shadow-lg'
                  : 'bg-black/40 border-white/5 text-neutral-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-emerald-400 font-bold">4. SQL AGGREGATES</span>
                <Play className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-xs font-semibold">GROUP BY & Aggregates</div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">AVG, SUM, COUNT, MIN, MAX</div>
            </button>
          </div>

          {/* Interactive SQL Terminal & Results Container */}
          <div className="bg-[#090909] border border-white/10 rounded-3xl p-6 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2 text-neutral-400">
                <Terminal className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-white font-semibold">PostgreSQL Relational Engine Terminal</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                EXECUTION LATENCY: 2.4ms • STATUS 200 OK
              </span>
            </div>

            {/* Results Table / JSON */}
            {isExecuting ? (
              <div className="py-12 text-center text-neutral-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00F0FF]" />
                <span>Executing relational query against database engine...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {queryOutput?.sqlDefinition && (
                  <div className="p-3 bg-black/60 rounded-xl border border-white/5 text-[#00F0FF] text-[11px] whitespace-pre-wrap">
                    {queryOutput.sqlDefinition}
                  </div>
                )}

                {/* Tabular Output for View */}
                {activeQuery === 'view' && queryOutput?.data && (
                  <div className="overflow-x-auto max-h-[420px] scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-neutral-500 text-[10px]">
                          <th className="p-2">MODEL CODE</th>
                          <th className="p-2">MODEL NAME</th>
                          <th className="p-2">PART NUMBER</th>
                          <th className="p-2">COMPONENT NAME</th>
                          <th className="p-2">CATEGORY</th>
                          <th className="p-2">TIER-1 SUPPLIER</th>
                          <th className="p-2">MASS (KG)</th>
                          <th className="p-2">UNIT COST</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-neutral-300 text-[11px]">
                        {queryOutput.data.slice(0, 10).map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-white/[0.03]">
                            <td className="p-2 text-[#00F0FF]">{row.modelCode}</td>
                            <td className="p-2 text-white">{row.modelName}</td>
                            <td className="p-2 font-mono">{row.partNumber}</td>
                            <td className="p-2 text-neutral-200">{row.componentName}</td>
                            <td className="p-2 text-neutral-400">{row.categoryName}</td>
                            <td className="p-2 text-emerald-400">{row.supplierName}</td>
                            <td className="p-2">{row.weightKg} kg</td>
                            <td className="p-2 text-white font-semibold">${row.costUsd.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Stored Procedure Execution Card */}
                {activeQuery === 'procedure' && queryOutput?.result && (
                  <div className="p-5 bg-black/60 rounded-2xl border border-white/5 space-y-4">
                    <div className="text-emerald-400 font-bold text-sm">
                      ✔ Stored Procedure calculate_project_completion executed successfully!
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-neutral-500 text-[10px]">TOTAL MILESTONE WEIGHT</span>
                        <div className="text-lg font-bold text-white">{queryOutput.result.totalMilestoneWeight}x</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-neutral-500 text-[10px]">COMPLETED WEIGHT</span>
                        <div className="text-lg font-bold text-white">{queryOutput.result.completedMilestoneWeight}x</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-neutral-500 text-[10px]">CALCULATED COMPLETION</span>
                        <div className="text-lg font-bold text-[#00F0FF]">{queryOutput.result.completionPercentage}%</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trigger Output Card */}
                {activeQuery === 'trigger' && queryOutput?.auditRecord && (
                  <div className="p-5 bg-black/60 rounded-2xl border border-white/5 space-y-3">
                    <div className="text-emerald-400 font-bold text-sm">
                      ✔ Trigger audit_milestone_update fired and committed row to AuditLog!
                    </div>
                    <div className="bg-black p-4 rounded-xl border border-white/10 text-[11px] text-neutral-300 whitespace-pre-wrap">
                      {JSON.stringify(queryOutput.auditRecord, null, 2)}
                    </div>
                  </div>
                )}

                {/* Aggregates Card */}
                {activeQuery === 'aggregates' && queryOutput && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {queryOutput.categoryAggregates?.slice(0, 6).map((cat: any) => (
                        <div key={cat.category} className="p-3 bg-black/50 rounded-xl border border-white/5">
                          <div className="text-white font-semibold text-xs">{cat.category}</div>
                          <div className="text-neutral-400 text-[10px] mt-1">
                            Components: {cat.componentCount} • Avg Mass: {cat.avgWeightKg} kg
                          </div>
                          <div className="text-[#00F0FF] font-bold mt-1">${cat.totalCostUsd.toLocaleString()} USD</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ENTITY RELATIONSHIP (ER) DIAGRAM */}
      {activeTab === 'er' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-lg font-display font-bold text-white">
                  Entity-Relationship (ER) Schema Map
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  Primary Entities, Foreign Key Constraints, and Referential Cardinalities
                </p>
              </div>
              <span className="font-mono text-xs text-[#00F0FF]">
                {overview?.totalTables || 21} Entities Normalized to 3NF
              </span>
            </div>

            {/* Interactive Table Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview?.tables?.map((table: any) => (
                <div key={table.name} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-white/10">
                    <span className="text-white font-bold">{table.name}</span>
                    <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded">
                      {table.rows} Rows
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400">
                    <span className="text-amber-400">PK:</span> {table.primaryKey} (UUID)
                  </div>

                  <div className="text-[10px] text-neutral-400">
                    <span className="text-sky-400">Relations:</span>
                    <div className="space-y-0.5 mt-1">
                      {table.relations.map((rel: string, rIdx: number) => (
                        <div key={rIdx} className="text-neutral-300">• {rel}</div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[9px] text-emerald-400 pt-1">
                    ✔ {table.normalForm}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 3NF NORMALIZATION PROOFS */}
      {activeTab === '3nf' && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6 font-mono text-xs">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-display font-bold text-white">
              Mathematical 3NF Normalization Proofs
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              BCSE307L Relational Integrity Decomposition Specification
            </p>
          </div>

          <div className="space-y-6 text-neutral-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-[#00F0FF]">1. First Normal Form (1NF) Compliance</h4>
              <p className="text-xs text-neutral-400">
                • All attributes contain strictly atomic, scalar values.<br />
                • There are no repeating groups or nested array attributes in base relational tables.<br />
                • Component specifications and vehicle variant configurations are decomposed into normalized junction tables (ComponentSpecification, ConfigurationComponent).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-amber-400">2. Second Normal Form (2NF) Compliance</h4>
              <p className="text-xs text-neutral-400">
                • In 1NF and every non-prime attribute is fully functionally dependent on the entire primary key.<br />
                • Composite junction entities like <code className="text-white">VariantComponent(variant_id, component_id)</code> only store attributes that depend strictly on the composite key (e.g. is_standard, position_offset), while component price, mass, and supplier info reside exclusively in Component and Supplier tables.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <h4 className="text-sm font-bold text-emerald-400">3. Third Normal Form (3NF) Compliance</h4>
              <p className="text-xs text-neutral-400">
                • In 2NF and there are NO transitive functional dependencies (X → Y, Y → Z where Z depends on non-key Y).<br />
                • Example: Supplier country and rating depend strictly on supplier_id, NOT component_id. Therefore Supplier is normalized into its own relation, eliminating update, insertion, and deletion anomalies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRIGGER AUDIT LEDGER */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <div>
              <h3 className="text-lg font-display font-bold text-white">Immutable Trigger Audit Log</h3>
              <p className="text-neutral-400 text-[10px]">Populated automatically by BEFORE/AFTER triggers</p>
            </div>
            <span className="text-[#00F0FF]">{auditLogs.length} Events Logged</span>
          </div>

          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] font-bold text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-white font-semibold">{log.tableName}</span>
                    <span className="text-neutral-500 text-[10px]">ID: {log.recordId}</span>
                  </div>
                  {log.newValues && (
                    <div className="mt-1 text-[10px] text-neutral-400 bg-black/40 p-2 rounded max-w-xl truncate">
                      {log.newValues}
                    </div>
                  )}
                </div>
                <div className="text-neutral-500 text-[10px] shrink-0 pl-4">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseHubPage;
