import { create } from 'zustand';
import api from '../services/api';

interface Project {
  id: number;
  name: string;
  dbDialect: string;
}

interface Schema {
  id: number;
  tableName: string;
  fields: any[];
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  currentSchema: Schema[];
  fetchProjects: () => Promise<void>;
  setCurrentProject: (project: Project) => void;
  fetchProjectById: (projectId: number) => Promise<void>;
  fetchSchema: (projectId: number) => Promise<void>;
  createTable: (projectId: number, tableName: string, columns: any[]) => Promise<void>;
  dropTable: (projectId: number, tableName: string) => Promise<void>;
  alterTable: (projectId: number, tableName: string, action: 'add' | 'remove' | 'changeType', column: any) => Promise<void>;
  scanProject: (projectId: number) => Promise<void>;
  deleteProject: (projectId: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  currentSchema: [],
  fetchProjects: async () => {
    const res = await api.get('/projects');
    set({ projects: res.data });
  },
  setCurrentProject: (project) => set({ currentProject: project }),
  fetchProjectById: async (projectId) => {
    const res = await api.get(`/projects/${projectId}`);
    set({ currentProject: res.data });
  },
  fetchSchema: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/schema`);
    set({ currentSchema: res.data });
  },
  createTable: async (projectId, tableName, columns) => {
    const res = await api.post(`/projects/${projectId}/tables`, { tableName, columns });
    set({ currentSchema: res.data.schema });
  },
  dropTable: async (projectId, tableName) => {
    const res = await api.delete(`/projects/${projectId}/tables/${tableName}`);
    set({ currentSchema: res.data.schema });
  },
  alterTable: async (projectId, tableName, action, column) => {
    const res = await api.patch(`/projects/${projectId}/tables/${tableName}`, { action, column });
    set({ currentSchema: res.data.schema });
  },
  scanProject: async (projectId) => {
    await api.post(`/projects/${projectId}/scan`);
    const res = await api.get(`/projects/${projectId}/schema`);
    set({ currentSchema: res.data });
  },
  deleteProject: async (projectId) => {
    await api.delete(`/projects/${projectId}`);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId)
    }));
  },
}));
