'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/services/api';
import { useProjectStore } from '@/store/useProjectStore';
import DynamicForm from '@/components/Admin/DynamicForm';
import {
  Plus, Search, Filter, Edit2, Trash2, ChevronLeft, ChevronRight,
  AlertCircle, Inbox, Loader2, MoreHorizontal, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DynamicTablePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const tableName = params.tableName as string;
  
  const { currentSchema } = useProjectStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [pendingFilters, setPendingFilters] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const tableMetadata = currentSchema.find(t => t.tableName === tableName);

  const fetchData = async () => {
    if (!projectId || !tableName) return;
    setLoading(true);
    try {
      let url = `/data/${projectId}/${tableName}?page=${page}&limit=${limit}`;
      if (activeFilters.length > 0) {
        const filterObj = activeFilters.reduce((acc, f) => {
          acc[f.column] = { operator: f.operator, value: f.value };
          return acc;
        }, {} as any);
        url += `&filters=${encodeURIComponent(JSON.stringify(filterObj))}`;
      }
      const res = await api.get(url);
      setData(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, tableName, activeFilters, page]);

  const handleCreate = async (formData: any) => {
    await api.post(`/data/${projectId}/${tableName}`, formData);
    fetchData();
  };

  const handleUpdate = async (formData: any) => {
    const pk = tableMetadata?.fields.find((f: any) => f.primaryKey);
    if (pk) {
      await api.put(`/data/${projectId}/${tableName}/${formData[pk.name]}`, formData);
      fetchData();
    }
  };

  const handleDelete = async (row: any) => {
    const pk = tableMetadata?.fields.find((f: any) => f.primaryKey);
    if (pk && confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/data/${projectId}/${tableName}/${row[pk.name]}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete record');
      }
    }
  };

  if (!tableMetadata) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  const filteredData = data.filter(row =>
    tableMetadata.fields.some((field: any) =>
      String(row[field.name] || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="badge bg-primary-50 text-primary-700 border-primary-200">System Table</span>
          </div>
          <h1 className="text-4xl font-black text-surface-900 capitalize tracking-tight">{tableName}</h1>
          <p className="text-surface-500 mt-1.5 font-bold flex items-center gap-2">
            {loading ? (
              <Loader2 size={16} className="animate-spin text-primary-400" />
            ) : (
              <>
                <Database size={16} className="text-surface-400" />
                {total} Records found
              </>
            )}
          </p>
        </div>
        <button
          id="add-new-record"
          onClick={() => { setEditingRow(null); setShowForm(true); }}
          className="btn-primary"
        >
          <Plus size={20} />
          New Record
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-card border border-surface-100 overflow-hidden group/container">
        <div className="px-6 py-5 border-b border-surface-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-50/30 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors" size={18} />
              <input
                id="table-search"
                type="text"
                placeholder={`Search in ${tableName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-with-icon h-12"
              />
            </div>
            <button
              onClick={() => {
                if (!showFilters) setPendingFilters([...activeFilters]);
                setShowFilters(!showFilters);
              }}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-sm font-black tracking-wide transition-all duration-300 ${showFilters || activeFilters.length > 0
                  ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-glow'
                  : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                }`}
            >
              <Filter size={18} />
              Filters
              {activeFilters.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center animate-pulse">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-2 w-32 bg-surface-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((filteredData.length / (total || 1)) * 100, 100)}%` }}
                  transition={{ duration: 1 }}
                />
             </div>
             <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
               {filteredData.length} of {total}
             </span>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 py-4 border-b border-surface-100 bg-surface-50/30 overflow-hidden"
            >
              <div className="space-y-3">
                {pendingFilters.map((filter, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={filter.column}
                      onChange={(e) => {
                        const newFilters = [...pendingFilters];
                        newFilters[idx].column = e.target.value;
                        setPendingFilters(newFilters);
                      }}
                      className="px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-sm"
                    >
                      {tableMetadata.fields.map((f: any) => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                    <select
                      value={filter.operator}
                      onChange={(e) => {
                        const newFilters = [...pendingFilters];
                        newFilters[idx].operator = e.target.value;
                        setPendingFilters(newFilters);
                      }}
                      className="px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-sm"
                    >
                      <option value="contains">Contains</option>
                      <option value="equals">Equals</option>
                      <option value="gt">Greater Than</option>
                      <option value="lt">Less Than</option>
                    </select>
                    <input
                      type="text"
                      value={filter.value}
                      placeholder="Value..."
                      onChange={(e) => {
                        const newFilters = [...pendingFilters];
                        newFilters[idx].value = e.target.value;
                        setPendingFilters(newFilters);
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-surface-200 rounded-lg text-sm outline-none focus:border-primary-400"
                    />
                    <button
                      onClick={() => setPendingFilters(pendingFilters.filter((_, i) => i !== idx))}
                      className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setPendingFilters([...pendingFilters, { column: tableMetadata.fields[0].name, operator: 'contains', value: '' }])}
                      className="flex items-center gap-1.5 text-primary-600 font-bold text-xs uppercase tracking-widest hover:text-primary-700"
                    >
                      <Plus size={14} />
                      Add Condition
                    </button>
                    {pendingFilters.length > 0 && (
                      <button
                        onClick={() => {
                          setActiveFilters(pendingFilters);
                          setShowFilters(false);
                        }}
                        className="btn-primary py-1.5 px-4 text-xs"
                      >
                        Apply Filters
                      </button>
                    )}
                  </div>
                  {(pendingFilters.length > 0 || activeFilters.length > 0) && (
                    <button
                      onClick={() => {
                        setPendingFilters([]);
                        setActiveFilters([]);
                        setPage(1);
                      }}
                      className="text-surface-400 font-bold text-xs uppercase tracking-widest hover:text-surface-600"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto text-surface-400">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-50/80">
                {tableMetadata.fields.map((field: any) => (
                  <th
                    key={field.name}
                    className="px-5 py-3.5 text-xs font-bold text-surface-500 uppercase tracking-wider border-b border-surface-100 whitespace-nowrap"
                  >
                    {field.name}
                  </th>
                ))}
                <th className="px-5 py-3.5 text-xs font-bold text-surface-500 uppercase tracking-wider border-b border-surface-100 text-right w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {tableMetadata.fields.map((f: any) => (
                      <td key={f.name} className="px-5 py-4" shadow-sm="true">
                        <div className="h-4 bg-surface-100 rounded-lg w-full animate-pulse" />
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="h-4 bg-surface-100 rounded-lg w-10 ml-auto animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={tableMetadata.fields.length + 1} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
                        <Inbox className="text-surface-300" size={28} />
                      </div>
                      <p className="font-semibold text-surface-700">No records found</p>
                      <p className="text-surface-400 text-sm mt-1">
                        {searchQuery ? 'Try a different search term' : 'Add a new record to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-primary-50/30 transition-colors group"
                  >
                    {tableMetadata.fields.map((field: any) => (
                      <td key={field.name} className="px-5 py-3.5 text-sm text-surface-700 whitespace-nowrap max-w-[200px] truncate">
                        {row[field.name] === null || row[field.name] === undefined ? (
                          <span className="text-surface-300 italic text-xs">null</span>
                        ) : field.relation ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-bold border border-primary-100 hover:bg-primary-100 transition-colors cursor-pointer" title={`Ref: ${field.relation.referencedTable}(${field.relation.referencedColumn})`}>
                            {String(row[field.name])}
                          </span>
                        ) : typeof row[field.name] === 'boolean' ? (
                          <span className={`badge ${row[field.name] ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-surface-100 text-surface-500 border border-surface-200'}`}>
                            {row[field.name] ? 'True' : 'False'}
                          </span>
                        ) : (
                          String(row[field.name])
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingRow(row); setShowForm(true); }}
                          className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                          className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-surface-50/50 border-t border-surface-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500 font-medium order-2 sm:order-1">
            Showing <span className="text-surface-900">{(page - 1) * limit + 1}</span> to <span className="text-surface-900">{Math.min(page * limit, total)}</span> of <span className="text-surface-900">{total}</span> records
          </p>
          
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-2 border border-surface-200 rounded-lg bg-white text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-surface-200 rounded-lg shadow-sm">
              <span className="text-xs font-bold text-primary-600">{page}</span>
              <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">of {Math.ceil(total / limit) || 1}</span>
            </div>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / limit) || loading}
              className="p-2 border border-surface-200 rounded-lg bg-white text-surface-600 hover:bg-surface-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <DynamicForm
            projectId={projectId || ''}
            tableName={tableName || ''}
            fields={tableMetadata.fields}
            initialData={editingRow}
            onSubmit={editingRow ? handleUpdate : handleCreate}
            onClose={() => { setShowForm(false); setEditingRow(null); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
