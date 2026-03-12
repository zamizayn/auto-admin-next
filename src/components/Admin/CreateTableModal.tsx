'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Database, Table, Type, Key, Hash, Calendar, CheckSquare, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Column {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'text';
  primaryKey: boolean;
  allowNull: boolean;
}

interface CreateTableModalProps {
  onClose: () => void;
  onCreate: (tableName: string, columns: Column[]) => Promise<void>;
}

const CreateTableModal: React.FC<CreateTableModalProps> = ({ onClose, onCreate }) => {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<Column[]>([
    { name: 'id', type: 'number', primaryKey: true, allowNull: false }
  ]);
  const [loading, setLoading] = useState(false);

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'string', primaryKey: false, allowNull: true }]);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, updates: Partial<Column>) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    setColumns(newColumns);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return alert('Table name is required');
    if (columns.length === 0) return alert('At least one column is required');
    if (columns.some(c => !c.name.trim())) return alert('All columns must have names');

    setLoading(true);
    try {
      await onCreate(tableName, columns);
      onClose();
    } catch (err) {
      alert('Failed to create table');
    } finally {
      setLoading(false);
    }
  };

  const columnTypes = [
    { value: 'string', label: 'String', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'boolean', label: 'Boolean', icon: CheckSquare },
    { value: 'text', label: 'Text Block', icon: AlignLeft },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-surface-950/40 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
              <Database size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-900 leading-tight">Create New Table</h2>
              <p className="text-sm text-surface-500 mt-0.5">Design your schema</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-surface-700 uppercase tracking-wider flex items-center gap-2">
              <Table size={14} className="text-primary-500" />
              Table Name
            </label>
            <input
              type="text"
              placeholder="e.g. products, orders, customers"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full h-12 px-4 bg-surface-50 border border-surface-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium"
              autoFocus
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-surface-700 uppercase tracking-wider">Columns</label>
              <button
                type="button"
                onClick={addColumn}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 bg-primary-50 px-2 py-1.5 rounded-lg transition-all"
              >
                <Plus size={14} /> Add Column
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {columns.map((col, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-surface-50 rounded-xl border border-surface-100 hover:border-surface-200 transition-all"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Column name"
                        value={col.name}
                        onChange={(e) => updateColumn(idx, { name: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-surface-200 rounded-lg text-sm focus:border-primary-500 outline-none transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={col.type}
                        onChange={(e) => updateColumn(idx, { type: e.target.value as any })}
                        className="flex-1 sm:flex-none h-10 px-3 pr-8 bg-white border border-surface-200 rounded-lg text-sm focus:border-primary-500 outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.75%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px] bg-[right_8px_center] bg-no-repeat min-w-[120px]"
                      >
                        {columnTypes.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => updateColumn(idx, { primaryKey: !col.primaryKey, allowNull: col.primaryKey ? col.allowNull : false })}
                        className={`p-2 rounded-lg border transition-all ${col.primaryKey ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-surface-200 text-surface-400'}`}
                        title="Primary Key"
                      >
                        <Key size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeColumn(idx)}
                        disabled={columns.length === 1}
                        className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-surface-100 flex items-center justify-end gap-3 bg-surface-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-surface-600 hover:text-surface-800 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary min-w-[120px]"
          >
            {loading ? 'Creating...' : 'Create Table'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateTableModal;
