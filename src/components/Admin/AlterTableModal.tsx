'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Info, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlterTableModalProps {
  tableName: string;
  columns: any[];
  onClose: () => void;
  onAlter: (action: 'add' | 'remove' | 'changeType', column: any) => Promise<void>;
}

const AlterTableModal: React.FC<AlterTableModalProps> = ({ tableName, columns, onClose, onAlter }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'string', allowNull: true });
  const [error, setError] = useState<string | null>(null);

  const handleAddColumn = async () => {
    if (!newColumn.name.trim()) {
      setError('Column name is required');
      return;
    }
    
    if (columns.some(c => c.name === newColumn.name)) {
      setError('Column already exists');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onAlter('add', newColumn);
      setNewColumn({ name: '', type: 'string', allowNull: true });
    } catch (err: any) {
      setError(err.message || 'Failed to add column');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveColumn = async (colName: string) => {
    if (!confirm(`Are you sure you want to remove column "${colName}"? Data will be permanently lost.`)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onAlter('remove', { name: colName });
    } catch (err: any) {
      setError(err.message || 'Failed to remove column');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-surface-950/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50">
          <div>
            <h2 className="text-xl font-bold text-surface-900">Alter Table: {tableName}</h2>
            <p className="text-sm text-surface-500">Add or remove columns from the table</p>
          </div>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-surface-600 hover:bg-surface-100 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <Info size={16} />
              {error}
            </div>
          )}

          {/* Existing Columns */}
          <section>
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4">Existing Columns</h3>
            <div className="grid grid-cols-1 gap-2">
              {columns.map((col: any) => (
                <div key={col.name} className="flex items-center justify-between p-3 bg-surface-50 border border-surface-100 rounded-xl group">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-surface-900 w-32 truncate">{col.name}</span>
                    <select
                      value={col.type}
                      onChange={(e) => onAlter('changeType', { name: col.name, type: e.target.value })}
                      disabled={isSubmitting || col.primaryKey}
                      className="px-2 py-1 bg-white border border-surface-200 rounded text-[10px] font-bold uppercase text-surface-500 outline-none focus:border-primary-500/50 transition-all"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="text">Text</option>
                      <option value="date">Date</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleRemoveColumn(col.name)}
                    disabled={isSubmitting || col.primaryKey}
                    className={`p-2 text-surface-400 hover:text-red-500 rounded-lg transition-all ${col.primaryKey ? 'opacity-0 cursor-default' : 'opacity-0 group-hover:opacity-100'}`}
                    title={col.primaryKey ? "Cannot remove primary key" : "Remove column"}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Add New Column */}
          <section className="bg-primary-50/30 border border-primary-100/50 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus size={16} />
              Add New Column
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase mb-1.5 ml-1">Name</label>
                <input
                  type="text"
                  value={newColumn.name}
                  onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                  placeholder="column_name"
                  className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-surface-700 uppercase mb-1.5 ml-1">Type</label>
                <select
                  value={newColumn.type}
                  onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                >
                  <option value="string">String</option>
                  <option value="number">Number (Integer)</option>
                  <option value="text">Text (Long)</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
              <button
                onClick={handleAddColumn}
                disabled={isSubmitting || !newColumn.name}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <RotateCw className="animate-spin" size={16} /> : <Save size={16} />}
                Add Column
              </button>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-surface-100 flex justify-end bg-surface-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-surface-600 hover:text-surface-900 font-bold text-sm transition-colors"
          >
            Finished
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AlterTableModal;
