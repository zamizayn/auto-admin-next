'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useProjectStore } from '@/store/useProjectStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Plus, Database, ArrowRight, Search,
  Sparkles, LogOut, Zap, Trash2, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const dialects: Record<string, { color: string; bg: string }> = {
  mysql:    { color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200'  },
  postgres: { color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  sqlite:   { color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200'  },
  mssql:    { color: 'text-red-700',   bg: 'bg-red-50 border-red-200'   },
};

export default function DashboardPage() {
  const { projects, fetchProjects, setCurrentProject, deleteProject } = useProjectStore();
  const { user, token, logout } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [useUrl, setUseUrl] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '', dbHost: 'localhost', dbPort: 5432, dbUser: 'postgres', dbPass: '', dbName: '', dbDialect: 'postgres', dbUrl: ''
  });
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProjects();
  }, [token, fetchProjects, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/projects', newProject);
      await api.post(`/projects/${res.data.id}/scan`);
      fetchProjects();
      setShowModal(false);
      setNewProject({ name: '', dbHost: 'localhost', dbPort: 5432, dbUser: 'postgres', dbPass: '', dbName: '', dbDialect: 'postgres', dbUrl: '' });
      setUseUrl(false);
    } catch (err) {
      alert('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-surface-50 gradient-mesh">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-surface-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-surface-900">AutoAdmin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-surface-500 hidden sm:block">{user?.email}</span>
            <button onClick={logout} className="btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-extrabold text-surface-900 tracking-tight">Projects</h1>
              <p className="text-surface-500 mt-1 text-lg">Manage your database connections</p>
            </div>
            <button
              id="create-project-btn"
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus size={18} />
              New Project
            </button>
          </div>

          {/* Search */}
          {projects.length > 0 && (
            <div className="relative w-full sm:w-80 mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
              <input
                id="search-projects"
                type="text"
                placeholder="Search projects..."
                className="input-with-icon"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredProjects.map((project, index) => {
                const dialect = dialects[project.dbDialect] || { color: 'text-surface-600', bg: 'bg-surface-100 border-surface-200' };
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 32, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.08,
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                    onClick={() => {
                      setCurrentProject(project);
                      router.push(`/project/${project.id}`);
                    }}
                    className="group relative bg-white rounded-3xl p-8 border border-surface-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all duration-500 cursor-pointer overflow-hidden"
                  >
                    {/* Animated background glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 group-hover:scale-150 transition-all duration-700" />
                    
                    <div className="absolute top-6 right-6 z-20 opacity-0 lg:group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={(e) => handleDelete(e, project.id)}
                        className="p-2.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Project"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-surface-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-50 transition-all duration-500 group-hover:rotate-3">
                          <Database className="text-surface-400 group-hover:text-primary-600 transition-colors duration-500" size={28} />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className={`badge ${dialect.bg} ${dialect.color}`}>
                            {project.dbDialect}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-surface-900 group-hover:text-primary-700 transition-colors leading-tight mb-2">
                        {project.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-8">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-surface-500 uppercase tracking-widest">Active Connection</span>
                      </div>

                      <div className="pt-6 border-t border-surface-100 flex items-center justify-between">
                        <div className="flex items-center text-primary-600 font-bold gap-2 text-sm group-hover:gap-3 transition-all duration-300">
                          Configure Panel <ArrowRight size={16} />
                        </div>
                        <div className="w-10 h-10 rounded-full border border-surface-100 flex items-center justify-center text-surface-400 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all duration-500">
                           <Zap size={18} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty State */}
            {projects.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="col-span-full py-24 bg-white rounded-2xl border-2 border-dashed border-surface-200 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="text-primary-400" size={36} />
                </div>
                <h3 className="text-xl font-bold text-surface-900">No projects yet</h3>
                <p className="text-surface-500 mt-2 max-w-sm">
                  Connect your first database to start generating admin panels automatically.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary mt-6"
                >
                  <Plus size={18} />
                  Create First Project
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-glass-lg w-full max-w-lg border border-surface-100"
            >
              <div className="px-8 py-6 border-b border-surface-100">
                <h2 className="text-xl font-bold text-surface-900">New Database Connection</h2>
                <p className="text-surface-500 text-sm mt-1">Connect to an existing database to generate an admin panel</p>
              </div>

              <form onSubmit={handleCreate} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Project Name</label>
                  <input className="input-base" required placeholder="My Project"
                    onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">Database Engine</label>
                  <select
                    className="input-base"
                    value={newProject.dbDialect}
                    onChange={e => setNewProject({ ...newProject, dbDialect: e.target.value })}
                  >
                    <option value="mysql">MySQL</option>
                    <option value="postgres">PostgreSQL</option>
                    <option value="sqlite">SQLite</option>
                    <option value="mssql">MS SQL Server</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl border border-surface-100">
                  <button
                    type="button"
                    onClick={() => setUseUrl(false)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!useUrl ? 'bg-white shadow-sm text-primary-600' : 'text-surface-500 hover:text-surface-700'}`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseUrl(true)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${useUrl ? 'bg-white shadow-sm text-primary-600' : 'text-surface-500 hover:text-surface-700'}`}
                  >
                    Connection URL
                  </button>
                </div>

                {useUrl ? (
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">Connection URL</label>
                    <input 
                      className="input-base font-mono text-xs" 
                      required 
                      placeholder="postgresql://user:password@localhost:5432/dbname"
                      onChange={e => setNewProject({ ...newProject, dbUrl: e.target.value })} 
                    />
                    <p className="text-[10px] text-surface-400 mt-1.5 px-1">
                      Include protocol, credentials, host, and database name.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-1.5">Host</label>
                        <input className="input-base" placeholder="localhost"
                          onChange={e => setNewProject({ ...newProject, dbHost: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-1.5">Port</label>
                        <input type="number" className="input-base" placeholder="5432"
                          onChange={e => setNewProject({ ...newProject, dbPort: Number(e.target.value) })} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-surface-700 mb-1.5">Database Name</label>
                      <input className="input-base" required={!useUrl} placeholder="my_database"
                        onChange={e => setNewProject({ ...newProject, dbName: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-1.5">User</label>
                        <input className="input-base" required={!useUrl} placeholder="root"
                          onChange={e => setNewProject({ ...newProject, dbUser: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-1.5">Password</label>
                        <input type="password" className="input-base" placeholder="••••••••"
                          onChange={e => setNewProject({ ...newProject, dbPass: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={creating} className="flex-1 btn-primary">
                    {creating ? <Loader2 className="animate-spin" size={18} /> : 'Connect Database'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
