import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AutomotiveProject } from '../types';
import AutomotiveCanvas from '../components/3d/AutomotiveCanvas';
import { VehicleCustomization } from '../components/3d/VehicleModel3D';
import { ArrowLeft, Check, Clock, Shield, Users, FileText, CheckCircle2, Cpu, Zap, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ projectId, onBack, onNavigateToTab }) => {
  const [project, setProject] = useState<AutomotiveProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingMilestoneId, setUpdatingMilestoneId] = useState<string | null>(null);

  const fetchProject = async () => {
    try {
      const res = await api.projects.getById(projectId);
      if (res.success) setProject(res.data);
    } catch (e) {
      console.error('Failed to load project details:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleToggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    setUpdatingMilestoneId(milestoneId);
    try {
      const res = await api.projects.updateMilestone(milestoneId, !currentStatus);
      if (res.success) {
        if (!currentStatus) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#00F0FF', '#FFFFFF'],
          });
        }
        await fetchProject();
      }
    } catch (e: any) {
      alert(`Milestone update failed: ${e.message}`);
    } finally {
      setUpdatingMilestoneId(null);
    }
  };

  const customization: VehicleCustomization = {
    paintColor: '#00F0FF',
    caliperColor: '#00F0FF',
    wheelStyle: 'aero',
    powertrain: 'dual',
    interiorTrim: 'carbon',
    isXRay: false,
    explodedProgress: 0,
  };

  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-sm text-[#00F0FF]">
        LOADING AUTOMOTIVE PROGRAM TELEMETRY...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-16 px-4 md:px-8 max-w-[1700px] mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-xs font-mono text-neutral-400 hover:text-[#00F0FF] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO VEHICLE PROGRAMS</span>
      </button>

      {/* Program Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#00F0FF]">
              {project.projectCode}
            </span>
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {project.status}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight">
            {project.name}
          </h1>
          <p className="text-xs md:text-sm text-neutral-400 max-w-3xl mt-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Progress & Stored Proc Indicator */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 min-w-[240px]">
          <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1">
            <span>STORED PROC COMPLETION</span>
            <span className="text-white font-bold">{project.completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00F0FF] to-[#0070F3] transition-all duration-500"
              style={{ width: `${project.completionPercentage}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-neutral-500 block mt-1">
            calculate_project_completion({project.projectCode})
          </span>
        </div>
      </div>

      {/* Grid: 3D Twin & Vehicle Variants (Top), Milestones & Team (Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Left: 3D Model embedded container (7 Cols) */}
        <div className="lg:col-span-7 bg-[#080808] border border-white/10 rounded-3xl h-[480px] relative overflow-hidden shadow-2xl">
          <AutomotiveCanvas
            customization={customization}
            enableControls={true}
            autoRotate={true}
            cameraPosition={[3.8, 1.8, 4.8]}
          />
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
            <span className="text-[10px] font-mono text-[#00F0FF] tracking-wider uppercase bg-black/60 px-3 py-1 rounded-full border border-white/10">
              LIVE DIGITAL TWIN HARDWARE LINK
            </span>
          </div>
        </div>

        {/* Right: Vehicle Models & Variants (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00F0FF]" />
              Vehicle Models & Homologated Variants
            </h3>

            <div className="space-y-3">
              {project.vehicleModels?.map((vm) => (
                <div key={vm.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-white">{vm.name}</div>
                      <div className="text-[10px] font-mono text-neutral-400">{vm.segment} • Model Year {vm.year}</div>
                    </div>
                    <span className="font-mono text-xs text-[#00F0FF]">{vm.modelCode}</span>
                  </div>

                  {vm.variants?.map((v) => (
                    <div key={v.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">{v.name}</div>
                        <div className="text-[10px] font-mono text-neutral-500">{v.drivetrain}</div>
                      </div>
                      <span className="font-mono text-white font-semibold">${v.basePrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Interactive Milestones & Team Members */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Milestones Checklist (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
              Engineering Milestones (Trigger & Stored Proc Connected)
            </h3>
            <span className="text-[10px] font-mono text-neutral-400">Click to sign-off</span>
          </div>

          <div className="space-y-2">
            {project.milestones?.map((m) => (
              <div
                key={m.id}
                onClick={() => handleToggleMilestone(m.id, m.isCompleted)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  m.isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                    : 'bg-white/[0.02] border-white/5 text-neutral-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      m.isCompleted ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-neutral-600'
                    }`}
                  >
                    {m.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${m.isCompleted ? 'text-white line-through opacity-80' : 'text-neutral-200'}`}>
                      {m.title}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-500">{m.phase} • {m.description}</div>
                  </div>
                </div>

                <div className="text-right font-mono text-[10px] shrink-0 pl-3">
                  <span className="text-neutral-400">{new Date(m.targetDate).toLocaleDateString()}</span>
                  <div className="text-[#00F0FF]">Weight: {m.weight}x</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Team Members (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#00F0FF]" />
            Program Engineering Team (RBAC)
          </h3>

          <div className="space-y-3">
            {project.projectMembers?.map((pm) => (
              <div key={pm.user.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center space-x-3">
                <img
                  src={pm.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={pm.user.firstName}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div>
                  <div className="text-xs font-semibold text-white">
                    {pm.user.firstName} {pm.user.lastName}
                  </div>
                  <div className="text-[10px] font-mono text-[#00F0FF]">{pm.assignedRole}</div>
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">{pm.user.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
