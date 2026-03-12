'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useProjectStore } from '@/store/useProjectStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Database, Table, Settings, LogOut, ChevronRight, ChevronLeft,
  Sparkles, Search, Home, Menu, X, Bell, RotateCw, Plus, Trash2, Edit2,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateTableModal from '@/components/Admin/CreateTableModal';
import AlterTableModal from '@/components/Admin/AlterTableModal';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params.projectId as string;
  const { currentProject, currentSchema, fetchSchema, scanProject, fetchProjectById } = useProjectStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [showCreateTableModal, setShowCreateTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<{ name: string; columns: any[] } | null>(null);

  useEffect(() => {
    if (projectId) {
      const pId = Number(projectId);
      fetchProjectById(pId);
      fetchSchema(pId);
    }
  }, [projectId, fetchProjectById, fetchSchema]);

  const filteredTables = currentSchema.filter(t =>
    t.tableName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleScan = async () => {
    if (!projectId) return;
    setScanning(true);
    try {
      await scanProject(Number(projectId));
    } catch (err) {
      alert('Failed to scan database');
    } finally {
      setScanning(false);
    }
  };

  const handleCreateTable = async (tableName: string, columns: any[]) => {
    if (!projectId) return;
    await useProjectStore.getState().createTable(Number(projectId), tableName, columns);
  };

  const handleDeleteTable = async (e: React.MouseEvent, tableName: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete table "${tableName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await useProjectStore.getState().dropTable(Number(projectId), tableName);
      if (pathname.includes(`/table/${tableName}`)) {
        router.push(`/project/${projectId}`);
      }
    } catch (err) {
      alert('Failed to delete table');
    }
  };

  const handleAlterTable = async (action: 'add' | 'remove' | 'changeType', column: any) => {
    if (!projectId || !editingTable) return;
    try {
      await useProjectStore.getState().alterTable(Number(projectId), editingTable.name, action, column);
      const updatedTable = useProjectStore.getState().currentSchema.find(t => t.tableName === editingTable.name);
      if (updatedTable) {
        setEditingTable({
          name: updatedTable.tableName,
          columns: updatedTable.fields
        });
      }
    } catch (err) {
      alert('Failed to alter table');
    }
  };

  const sidebarContent = (
    <>
      <div className={`px-6 h-18 flex items-center border-b border-white/10 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center flex-shrink-0 animate-pulse-slow">
            <Sparkles className="text-primary-400" size={20} />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-black text-xl tracking-tight text-white truncate"
            >
              AutoAdmin
            </motion.span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-2 text-surface-500 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {collapsed && (
           <button
           onClick={() => setCollapsed(!collapsed)}
           className="hidden lg:flex p-2 text-surface-500 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 mb-2"
         >
           <ChevronRight size={18} />
         </button>
        )}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-2 text-surface-500 hover:text-white hover:bg-white/10 rounded-xl"
        >
          <X size={20} />
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 pt-4">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-surface-500 hover:text-white text-sm font-medium rounded-lg hover:bg-white/5 transition-all">
            <Home size={16} />
            Back to Projects
          </Link>
        </div>
      )}

      {!collapsed && currentProject && (
        <div className="px-4 pt-4 pb-2">
          <div className="px-3 py-2 bg-white/5 rounded-xl">
            <p className="text-xs text-surface-500 font-medium uppercase tracking-wider">Current Project</p>
            <p className="text-white font-semibold truncate mt-0.5">{currentProject.name}</p>
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" size={14} />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-white placeholder-surface-500 focus:bg-white/10 focus:border-primary-500/30 outline-none transition-all"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
        <Link
          href={`/project/${projectId}/console`}
          className={`sidebar-link group mb-6 ${pathname === `/project/${projectId}/console` ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${collapsed ? 'mx-auto' : ''} ${pathname === `/project/${projectId}/console` ? 'bg-primary-500 text-white' : 'bg-white/5 text-surface-400 group-hover:bg-primary-500/20 group-hover:text-primary-300'}`}>
              <Terminal size={18} />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate">SQL Console</span>
                <span className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mt-0.5">Query Engine</span>
              </div>
            )}
          </div>
          {!collapsed && <ChevronRight size={14} className={`transition-transform duration-300 ${pathname === `/project/${projectId}/console` ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />}
        </Link>

        {!collapsed && (
          <div className="px-3 pt-2 pb-3">
             <div className="h-px bg-white/5 w-full mb-4" />
            <p className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em]">
              Data Schema
            </p>
          </div>
        )}

        <div className="space-y-1">
          {filteredTables.map((table) => {
            const tablePath = `/project/${projectId}/table/${table.tableName}`;
            const isActive = pathname === tablePath;
            return (
              <Link
                key={table.id}
                href={tablePath}
                onClick={() => setMobileOpen(false)}
                className={`${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <Table size={16} className={`flex-shrink-0 ${isActive ? 'text-primary-300' : 'text-surface-500 group-hover:text-primary-400'}`} />
                  {!collapsed && (
                    <span className="text-sm font-bold truncate">{table.tableName}</span>
                  )}
                </div>
                {!collapsed && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingTable({ name: table.tableName, columns: table.fields });
                      }}
                      className="p-1.5 text-surface-500 hover:text-primary-400 hover:bg-white/5 rounded-lg transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTable(e, table.tableName)}
                      className="p-1.5 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {!collapsed && filteredTables.length === 0 && (
          <p className="px-3 py-8 text-center text-xs text-surface-600 font-medium">
            No tables found
          </p>
        )}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        {!collapsed && (
          <>
            <button className="sidebar-link-inactive w-full text-left">
              <div className="flex items-center gap-3.5">
                <Settings size={18} className="text-surface-500" />
                <span className="text-sm font-bold">Settings</span>
              </div>
            </button>
            <button
              onClick={logout}
              className="sidebar-link group w-full text-left text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <div className="flex items-center gap-3.5">
                <LogOut size={18} />
                <span className="text-sm font-bold">Logout</span>
              </div>
            </button>
          </>
        )}
        {collapsed && (
          <div className="flex flex-col gap-2">
            <button className="flex items-center justify-center w-full p-3 text-surface-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all duration-300">
              <Settings size={20} />
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center w-full p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all duration-300"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-surface-50 gradient-mesh">
      <aside
        className={`hidden lg:flex flex-col bg-surface-950 transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'
          }`}
      >
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-surface-950 z-50 lg:hidden flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-18 bg-white/80 backdrop-blur-2xl border-b border-surface-200/50 flex items-center justify-between px-8 z-20 flex-shrink-0 sticky top-0 shadow-sm">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 text-surface-500 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all duration-300"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <Link href="/" className="text-surface-500 hover:text-primary-600 font-bold transition-colors">Projects</Link>
              <ChevronRight size={14} className="text-surface-300" />
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg">
                <Database size={16} className="text-primary-500" />
                <span className="font-black text-surface-900">{currentProject?.name || 'Loading...'}</span>
              </div>
              
              <button
                onClick={handleScan}
                disabled={scanning}
                className="ml-4 p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-500 group flex items-center gap-2"
                title="Scan database for changes"
              >
                <div className={`p-1 rounded-lg transition-colors ${scanning ? 'bg-primary-100' : 'group-hover:bg-primary-100'}`}>
                  <RotateCw size={14} className={scanning ? 'animate-spin text-primary-600' : 'group-hover:rotate-180 transition-transform duration-700'} />
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest">
                  {scanning ? 'Syncing...' : 'Sync'}
                </span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button className="p-2.5 text-surface-400 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all duration-300 relative group">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary-500 border-2 border-white rounded-full animate-pulse" />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-surface-200">
               <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">Admin</span>
                <span className="text-xs font-bold text-surface-900 truncate max-w-[120px]">{user?.email?.split('@')[0]}</span>
              </div>
              <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-white font-black text-sm shadow-glow hover:scale-110 transition-transform cursor-pointer">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <AnimatePresence>
        {showCreateTableModal && (
          <CreateTableModal
            onClose={() => setShowCreateTableModal(false)}
            onCreate={handleCreateTable}
          />
        )}
        {editingTable && (
          <AlterTableModal
            tableName={editingTable.name}
            columns={editingTable.columns}
            onClose={() => setEditingTable(null)}
            onAlter={handleAlterTable}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
