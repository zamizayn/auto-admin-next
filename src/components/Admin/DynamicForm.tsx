'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { X, Loader2, Save, PlusCircle, Database, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DynamicFormProps {
  projectId: string;
  tableName: string;
  fields: any[];
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

const LookupSelect: React.FC<{
  projectId: string;
  table: string;
  value: any;
  onChange: (val: any) => void;
  required?: boolean;
}> = ({ projectId, table, value, onChange, required }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/data/${projectId}/${table}/lookup?search=${query}`);
      setOptions(res.data);
    } catch (err) {
      console.error('Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [projectId, table]);

  return (
    <div className="relative">
      <select
        required={required}
        className="input-base pr-10 appearance-none bg-white"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select {table.replace(/_/g, ' ')}...</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>{opt.label} ({opt.id})</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-surface-400">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
      </div>
    </div>
  );
};

const DynamicForm: React.FC<DynamicFormProps> = ({ projectId, tableName, fields, initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      alert('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-surface-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl shadow-glass-lg w-full max-w-2xl border border-white/40 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-surface-100 flex items-center justify-between bg-surface-50/40 relative">
          <div className="absolute top-0 left-0 w-full h-1 gradient-primary opacity-20" />
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-surface-100 flex items-center justify-center text-primary-500">
              {initialData ? <Edit2 size={28} /> : <PlusCircle size={28} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-surface-900 capitalize tracking-tight leading-none mb-1.5">
                {initialData ? 'Update' : 'Create'} {tableName}
              </h2>
              <p className="text-surface-500 text-sm font-bold flex items-center gap-1.5">
                <Database size={14} />
                Resource Entry Details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-surface-400 hover:text-surface-900 hover:bg-white rounded-2xl transition-all duration-300 shadow-sm border border-transparent hover:border-surface-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {fields.filter(f => !f.primaryKey).map((field) => (
              <div
                key={field.name}
                className={field.type === 'string' && (field.name.includes('description') || field.name.includes('content')) ? 'col-span-2' : ''}
              >
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <label className="text-xs font-black text-surface-600 uppercase tracking-widest">
                    {field.name.replace(/_/g, ' ')}
                  </label>
                  {field.allowNull === false && (
                    <span className="text-[10px] font-black text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Required</span>
                  )}
                </div>

                <div className="relative group">
                  {field.relation ? (
                    <LookupSelect
                      projectId={projectId}
                      table={field.relation.referencedTable}
                      value={formData[field.name]}
                      required={!field.allowNull}
                      onChange={(val) => setFormData({ ...formData, [field.name]: val })}
                    />
                  ) : field.type === 'boolean' ? (
                    <label className="flex items-center gap-4 cursor-pointer py-2 group-hover:px-2 transition-all duration-300">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!!formData[field.name]}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                        />
                        <div className="w-12 h-6.5 bg-surface-200 rounded-full peer-checked:bg-primary-600 transition-all duration-500" />
                        <div className="absolute top-1 left-1 w-4.5 h-4.5 bg-white rounded-full shadow-sm peer-checked:translate-x-5.5 transition-all duration-500" />
                      </div>
                      <span className="text-sm text-surface-600 font-bold group-hover:text-primary-600 transition-colors">
                        {formData[field.name] ? 'Enabled / True' : 'Disabled / False'}
                      </span>
                    </label>
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      required={!field.allowNull}
                      className="input-base focus:scale-[1.01] hover:scale-[1.01]"
                      value={formData[field.name]?.split('T')[0] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      required={!field.allowNull}
                      className="input-base focus:scale-[1.01] hover:scale-[1.01]"
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: Number(e.target.value) })}
                    />
                  ) : (field.name.includes('description') || field.name.includes('content')) ? (
                    <textarea
                      required={!field.allowNull}
                      className="input-base min-h-[140px] resize-none py-4 focus:scale-[1.01] hover:scale-[1.01]"
                      placeholder={`Enter ${field.name.replace(/_/g, ' ')} here...`}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                  ) : (
                    <input
                      type="text"
                      required={!field.allowNull}
                      className="input-base focus:scale-[1.01] hover:scale-[1.01]"
                      placeholder={`Enter ${field.name.replace(/_/g, ' ')}`}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-surface-100 bg-surface-50/40 flex items-center gap-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary py-4"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] btn-primary py-4 shadow-glow-lg group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : initialData ? (
              <>
                <Save size={18} className="group-hover:rotate-12 transition-transform" />
                Update Record
              </>
            ) : (
              <>
                <PlusCircle size={18} className="group-hover:rotate-12 transition-transform" />
                Commit Record
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DynamicForm;
