'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { Play, Table as TableIcon, AlertCircle, Loader2, Clock, Hash } from 'lucide-react';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function SqlConsolePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ time: number; count: number } | null>(null);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await api.post(`/data/${projectId}/query`, { sql: query });
      const data = res.data.results;
      if (Array.isArray(data) && data.length > 0) {
        setResults(data);
        setColumns(Object.keys(data[0]));
        setStats({
          time: Math.round(performance.now() - start),
          count: data.length
        });
      } else {
        setResults([]);
        setColumns([]);
        setStats({
          time: Math.round(performance.now() - start),
          count: 0
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setResults([]);
      setColumns([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] space-y-6">
      {/* Editor Section */}
      <div className="bg-white rounded-3xl shadow-glass border border-surface-100 flex flex-col overflow-hidden h-1/2 group/editor">
        <div className="px-8 py-5 border-b border-surface-100 flex items-center justify-between bg-surface-50/40 backdrop-blur-sm relative">
           <div className="absolute top-0 left-0 w-full h-0.5 gradient-primary opacity-20" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-900 text-white flex items-center justify-center font-black text-xs shadow-glow">SQL</div>
            <div>
              <h1 className="text-xl font-black text-surface-900 tracking-tight">Query Engine</h1>
              <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.2em] mt-0.5">Console Environment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExecute}
              disabled={loading}
              className="btn-primary py-3 px-8 shadow-glow hover:shadow-glow-lg group/btn"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Play size={20} className="group-hover:translate-x-0.5 transition-transform" />
              )}
              Run Command
            </button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 bg-white">
          <Editor
            height="100%"
            defaultLanguage="sql"
            theme="light"
            value={query}
            onChange={(val) => setQuery(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: 'on',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 20, bottom: 20 },
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true
            }}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-3xl shadow-glass border border-surface-100 flex flex-col flex-1 overflow-hidden group/results">
        <div className="px-8 py-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/40 text-sm">
          <div className="flex items-center gap-8 text-surface-500 font-bold uppercase tracking-widest text-[10px]">
            <div className="flex items-center gap-2.5 text-surface-900">
              <TableIcon size={16} className="text-primary-500" />
              <span>Result Pipeline</span>
            </div>
            {stats && (
              <>
                <div className="flex items-center gap-2.5 px-3 py-1 bg-surface-100 rounded-lg">
                  <Clock size={14} className="text-surface-400" />
                  <span>Execution: {stats.time}ms</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100">
                  <Hash size={14} />
                  <span>{stats.count} Rows</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-surface-400 gap-6"
              >
                <div className="w-16 h-16 rounded-full border-4 border-surface-100 border-t-primary-500 animate-spin shadow-glow" />
                <p className="font-black uppercase tracking-[0.2em] text-xs">Processing Query...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-16 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mb-6 shadow-sm border border-red-100">
                  <AlertCircle size={36} />
                </div>
                <h3 className="text-xl font-black text-surface-900 mb-3 tracking-tight">Query Failed</h3>
                <div className="text-red-600 max-w-2xl font-bold text-sm bg-red-50/50 p-6 rounded-2xl border border-red-100 font-mono text-left relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                   {error}
                </div>
              </motion.div>
            ) : results.length > 0 ? (
              <motion.table
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full border-collapse"
              >
                <thead className="sticky top-0 bg-surface-50 border-b border-surface-100 z-10">
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="px-6 py-3 text-left text-xs font-bold text-surface-500 uppercase tracking-wider bg-surface-50">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 bg-white">
                  {results.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-50/50 transition-colors">
                      {columns.map(col => (
                        <td key={col} className="px-6 py-3 text-sm text-surface-600 font-medium">
                          {row[col] === null ? <span className="text-surface-300 italic">null</span> : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </motion.table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-surface-400 gap-3 grayscale opacity-40">
                <TableIcon size={48} strokeWidth={1} />
                <p className="font-semibold italic">No results returned or query not yet run</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
