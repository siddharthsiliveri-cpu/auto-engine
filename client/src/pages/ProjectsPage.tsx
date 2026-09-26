import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AutomotiveProject, EngineeringReview } from '../types';
import { Layers, Activity, CheckCircle, Clock, ChevronRight, Zap, Cpu, Users, FileText, ArrowUpRight } from 'lucide-react';
import { Magnetic } from '@/components/core/magnetic';

interface ProjectsPageProps {
  onSelectProject: (projectId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectProject, onNavigateToTab }) => {
  const [projects, setProjects] = useState<AutomotiveProject[]>([]);
  const [reviews, setReviews] = useState<EngineeringReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, revRes] = await Promise.all([
          api.projects.getAll(),
          api.reviews.getAll(),
        ]);
        if (projRes.success) setProjects(projRes.data);
        if (revRes.success) setReviews(revRes.data);
      } catch (e) {
        console.error('Failed to load projects:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-[#00F0FF] uppercase tracking-widest mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Automotive Engineering Control Center</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight">
            VEHICLE PROGRAMS
          </h1>
        </div>

        <Magnetic intensity={0.25} range={70}>
          <button
            onClick={() => onNavigateToTab('studio')}
            className="bg-[#00F0FF] text-black hover:bg-white font-bold text-xs uppercase px-5 py-2.5 rounded-full transition-all shadow-lg shadow-[#00F0FF]/25 flex items-center space-x-1.5"
          >
            <span>Launch Configurator</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </Magnetic>
      </div>

      {/* Top Engineering Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            ACTIVE PROGRAMS
          </div>
          <div className="text-4xl md:text-5xl font-display font-extrabold text-white">
            12
          </div>
          <div className="text-xs text-neutral-400 font-mono flex items-center gap-1">
            <span className="text-emerald-400">●</span> 3 In-Production Testing
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="text-[10px] font-mono tracking-widest text-[#00F0FF] uppercase">
            HOMOLOGATED VEHICLES
          </div>
          <div className="text-4xl md:text-5xl font-display font-extrabold text-[#00F0FF]">
            24
          </div>
          <div className="text-xs text-neutral-400 font-mono">Hyper-GT • SUV • Sedan</div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            PRECISION COMPONENTS
          </div>
          <div className="text-4xl md:text-5xl font-display font-extrabold text-white">
            846
          </div>
          <div className="text-xs text-neutral-400 font-mono">16 Automotive Categories</div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
          <div className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
            ENGINEERING REVIEWS
          </div>
          <div className="text-4xl md:text-5xl font-display font-extrabold text-white">
            18
          </div>
          <div className="text-xs text-emerald-400 font-mono">100% NCAP Compliant</div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {projects.map((p) => {
          const compPct = p.completionPercentage || 0;
          return (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-[#00F0FF]/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between hover:shadow-2xl hover:shadow-[#00F0FF]/10"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#00F0FF]">
                    {p.projectCode}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {p.status}
                  </span>
                </div>

                <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-[#00F0FF] transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-6">
                  {p.description}
                </p>
              </div>

              {/* Bottom Project Stats */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-neutral-400">Milestone Progress (Stored Proc)</span>
                    <span className="font-bold text-white">{compPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00F0FF] to-[#0070F3] transition-all duration-500"
                      style={{ width: `${compPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono text-neutral-400 pt-1">
                  <span>R&D Budget: ${(p.budget / 1000000).toFixed(0)}M</span>
                  <span className="flex items-center gap-1 text-[#00F0FF] group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Engineering Review Sign-Off Feed */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Recent Engineering Audits & Reviews
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">BCSE307L Compliance Stream</span>
        </div>

        <div className="divide-y divide-white/5">
          {reviews.slice(0, 4).map((r) => (
            <div key={r.id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-2">
                  {r.title}
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-400">
                    {r.reviewType}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">{r.comments}</div>
              </div>

              <div className="text-right font-mono shrink-0 pl-4">
                <span className="text-xs font-bold text-emerald-400">{r.score || 95}/100</span>
                <div className="text-[10px] text-neutral-500">{new Date(r.reviewDate).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
