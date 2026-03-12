'use client';

import React from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { 
  Database, Table, Activity, Plus, RefreshCw, Layers, 
  ShieldCheck, Server, ArrowRight, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { currentProject, currentSchema, scanProject } = useProjectStore();

  if (!currentProject) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-950 p-8 lg:p-12 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary-500/10 blur-[120px] rounded-full" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-xs font-bold tracking-widest uppercase">
              <Activity size={12} />
              Project Live
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Welcome to <span className="text-primary-400">{currentProject.name}</span>
            </h1>
            <p className="text-surface-400 text-lg leading-relaxed">
              Your intelligent admin interface is ready. Manage schemas, browse records, and monitor your database health from one central hub.
            </p>
          </div>
          <div className="flex-shrink-0 grid grid-cols-2 gap-4">
             <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mb-1 text-center">Dialect</p>
                <div className="flex flex-col items-center gap-2">
                  <Server size={24} className="text-primary-400" />
                  <span className="text-lg font-bold text-white uppercase tracking-tighter">{currentProject.dbDialect}</span>
                </div>
             </div>
             <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <p className="text-surface-500 text-xs font-bold uppercase tracking-widest mb-1 text-center">Entities</p>
                <div className="flex flex-col items-center gap-2">
                  <Table size={24} className="text-primary-400" />
                  <span className="text-xl font-bold text-white">{currentSchema.length}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Stats and Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Connection Status Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 bg-white border border-surface-200 rounded-2xl shadow-sm hover:shadow-md transition-all h-full flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-6">
            <ShieldCheck className="text-green-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">Secure Connection</h3>
          <p className="text-surface-500 text-sm mb-6 leading-relaxed flex-1">
            Directly connected to your {currentProject.dbDialect} instance. Data is streamed securely with optimized query plans.
          </p>
          <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Connected
          </div>
        </motion.div>

        {/* Schema Status Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-6 bg-white border border-surface-200 rounded-2xl shadow-sm hover:shadow-md transition-all h-full flex flex-col"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
            <Layers className="text-primary-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-surface-900 mb-2">Schema Analysis</h3>
          <p className="text-surface-500 text-sm mb-6 leading-relaxed flex-1">
            AutoAdmin has indexed {currentSchema.length} tables and identified relationships for optimized navigation.
          </p>
          <button 
            onClick={() => scanProject(currentProject.id)}
            className="flex items-center gap-2 text-primary-600 font-bold text-xs uppercase tracking-widest hover:text-primary-700 transition-colors w-fit"
          >
            <RefreshCw size={14} />
            Rescan Schema
          </button>
        </motion.div>

        {/* Action Card */}
        <div className="p-8 bg-primary-600 rounded-3xl shadow-lg shadow-primary-500/20 text-white flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-700">
            <Plus size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Automate Everything</h3>
            <p className="text-primary-100/80 text-sm leading-relaxed mb-8">
              Need more data points? Design your schema directly from the UI without writing a single line of SQL.
            </p>
          </div>
          <button className="relative z-10 flex items-center justify-center gap-2 w-full py-3 bg-white text-primary-600 rounded-xl font-bold text-sm hover:bg-primary-50 transition-all border border-transparent active:scale-95">
            <Plus size={18} />
            Design New Table
          </button>
        </div>
      </div>

      {/* Tables Preview */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 leading-tight">Project Entities</h2>
            <p className="text-surface-500 text-sm">Explore your database structure and data models.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentSchema.length > 0 ? (
            currentSchema.slice(0, 8).map((table) => (
              <Link
                key={table.id}
                href={`/project/${projectId}/table/${table.tableName}`}
              >
                <motion.div 
                   whileHover={{ scale: 1.02, y: -2 }}
                   whileTap={{ scale: 0.98 }}
                   className="p-5 bg-white border border-surface-200 rounded-2xl hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center text-surface-500 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition-all">
                      <Database size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-surface-950 truncate group-hover:text-primary-600 transition-colors">{table.tableName}</p>
                      <p className="text-[10px] text-surface-400 font-bold uppercase tracking-widest">Entity</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-surface-50">
                    <span className="text-[10px] font-bold text-surface-500 bg-surface-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {table.fields.length} Columns
                    </span>
                    <ExternalLink size={14} className="text-surface-300 group-hover:text-primary-400 transition-colors" />
                  </div>
                </motion.div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white border-2 border-dashed border-surface-200 rounded-3xl text-surface-400">
               <Database size={48} className="mb-4 opacity-20" />
               <p className="font-medium text-lg text-surface-500 text-center">No entities found.<br/><span className="text-sm font-normal">Connect a database or design your first table.</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
