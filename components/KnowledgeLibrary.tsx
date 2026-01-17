import React, { useState, useEffect, useMemo } from 'react';
import { KnowledgeItem, LibraryStorage } from '../types';
import * as libUtils from '../utils/libraryUtils';

interface KnowledgeLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'TAG_GROUPS' | 'TAG_DETAIL';

const KnowledgeLibrary: React.FC<KnowledgeLibraryProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<LibraryStorage>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('TAG_GROUPS');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [memoBuffer, setMemoBuffer] = useState('');

  // Load data on open
  useEffect(() => {
    if (isOpen) {
      setItems(libUtils.loadLibrary());
      setViewMode('TAG_GROUPS');
      setSearchQuery('');
    }
  }, [isOpen]);

  // Derived State: Search Results
  const searchResults = useMemo(() => {
    return libUtils.searchLibrary(searchQuery, items);
  }, [searchQuery, items]);

  // Derived State: Tag Grouping (Only when not searching)
  const tagGroups = useMemo(() => {
    const groups: Record<string, number> = {};
    items.forEach(item => {
      item.tags.forEach(tag => {
        groups[tag] = (groups[tag] || 0) + 1;
      });
    });
    return groups;
  }, [items]);

  // Derived State: Items for current view
  const displayItems = useMemo(() => {
    if (searchQuery) return searchResults;
    if (viewMode === 'TAG_DETAIL' && selectedTag) {
      return items
        .filter(i => i.tags.includes(selectedTag))
        .sort((a, b) => b.timestamp - a.timestamp); // Sort by time desc
    }
    return [];
  }, [items, searchQuery, viewMode, selectedTag, searchResults]);

  // Handlers
  const handleDeleteTag = (tag: string) => {
    if (window.confirm(`确认删除标签 "${tag}" 及其下所有知识点吗？此操作不可恢复。`)) {
      const newLibrary = libUtils.deleteTagAndItems(tag);
      setItems(newLibrary);
      if (selectedTag === tag) {
        setViewMode('TAG_GROUPS');
        setSelectedTag(null);
      }
    }
  };

  const handleExport = () => {
    if (searchQuery) {
      libUtils.exportToMarkdown(searchResults, `CoreMint_Search_${new Date().toISOString().slice(0,10)}`);
    } else if (viewMode === 'TAG_DETAIL' && selectedTag) {
      libUtils.exportToMarkdown(displayItems, `${selectedTag}_${new Date().toISOString().slice(0,10)}`);
    } else {
      libUtils.exportToMarkdown(items, `CoreMint总库_${new Date().toISOString().slice(0,10)}`);
    }
  };

  const handleSaveMemo = (id: string) => {
    const newLib = libUtils.updateItemMemo(id, memoBuffer);
    setItems(newLib);
    setEditingMemoId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-[#fafafa] flex flex-col animate-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-200 bg-white/50 backdrop-blur-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-lg text-slate-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">知识总库 / LIBRARY</h2>
        </div>
        
        <div className="flex items-center gap-3 flex-1 max-w-lg mx-auto md:mx-6 justify-end">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="搜索观点、标签或关键词..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-1 focus:ring-slate-300 focus:border-slate-400 outline-none transition-all shadow-sm"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button 
            onClick={handleExport}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold tracking-wider rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {searchQuery ? '导出结果' : (viewMode === 'TAG_DETAIL' ? '导出标签' : '导出全库')}
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-grid-pattern">
        
        {/* VIEW: Search Results or Tag Detail */}
        {(searchQuery || viewMode === 'TAG_DETAIL') ? (
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Breadcrumb / Action Bar for Tag Detail */}
            {!searchQuery && viewMode === 'TAG_DETAIL' && (
              <div className="flex items-center justify-between mb-6 animate-in fade-in">
                <button 
                  onClick={() => { setViewMode('TAG_GROUPS'); setSelectedTag(null); }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  <span className="text-lg">←</span> BACK TO FOLDERS
                </button>
                <div className="flex items-center gap-4">
                   <h3 className="text-xl font-bold text-slate-900">#{selectedTag}</h3>
                   <button 
                    onClick={() => selectedTag && handleDeleteTag(selectedTag)}
                    className="text-xs text-red-400 hover:text-red-600 underline decoration-red-200 underline-offset-2"
                   >
                     删除标签
                   </button>
                </div>
              </div>
            )}

            {/* List of Items */}
            {displayItems.length === 0 ? (
               <div className="text-center py-20 text-slate-400">无相关知识晶体</div>
            ) : (
              displayItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  {/* Item Header (Always Visible) */}
                  <div 
                    onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                    className="p-5 cursor-pointer flex items-start gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-zinc-100 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">
                            {t}
                          </span>
                        ))}
                        <span className="text-[10px] text-zinc-400 font-mono">{item.formattedDate}</span>
                      </div>
                      <h4 className="text-slate-800 font-medium leading-relaxed group-hover:text-mint transition-colors">
                        {item.coreInsight}
                      </h4>
                    </div>
                    <button className={`mt-1 text-slate-300 transition-transform duration-300 ${expandedItemId === item.id ? 'rotate-180' : ''}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedItemId === item.id && (
                    <div className="px-5 pb-6 pt-0 border-t border-zinc-50 bg-zinc-50/30 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* Logic */}
                        <div>
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">底层逻辑</h5>
                          <ul className="space-y-1">
                            {item.underlyingLogic.map((l, i) => (
                              <li key={i} className="text-xs text-slate-600 leading-relaxed">• {l}</li>
                            ))}
                          </ul>
                        </div>
                        {/* Action */}
                        <div>
                           <h5 className="text-[10px] font-bold text-mint uppercase tracking-widest mb-2">实操步骤</h5>
                           <ul className="space-y-1">
                            {item.actionableSteps.map((s, i) => (
                              <li key={i} className="text-xs text-slate-600 leading-relaxed"><span className="text-mint mr-1">{i+1}.</span>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Editable Memo */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                           <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Personal Memo</h5>
                           {editingMemoId === item.id ? (
                             <div className="flex gap-2">
                               <button onClick={() => setEditingMemoId(null)} className="text-[10px] text-slate-400 hover:text-slate-600">Cancel</button>
                               <button onClick={() => handleSaveMemo(item.id)} className="text-[10px] text-mint font-bold hover:text-emerald-500">Save</button>
                             </div>
                           ) : (
                             <button 
                               onClick={() => { setEditingMemoId(item.id); setMemoBuffer(item.personalMemo); }}
                               className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                             >
                               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                               Edit
                             </button>
                           )}
                        </div>
                        
                        {editingMemoId === item.id ? (
                          <textarea 
                            value={memoBuffer}
                            onChange={(e) => setMemoBuffer(e.target.value)}
                            className="w-full h-24 p-3 text-xs bg-white border border-mint/50 rounded-lg focus:ring-1 focus:ring-mint outline-none resize-none"
                            autoFocus
                          />
                        ) : (
                          <div className="p-3 bg-white rounded-lg border border-zinc-200 text-xs text-slate-600 min-h-[60px] whitespace-pre-wrap">
                            {item.personalMemo || <span className="text-zinc-300 italic">No memo added...</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* VIEW: Tag Groups Grid */
          <div className="max-w-6xl mx-auto">
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Object.entries(tagGroups).map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => { setSelectedTag(tag); setViewMode('TAG_DETAIL'); }}
                    className="flex flex-col items-center justify-center p-6 bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md hover:border-mint/50 hover:-translate-y-1 transition-all duration-300 group aspect-square md:aspect-auto md:h-36"
                  >
                     <div className="w-10 h-10 mb-3 bg-zinc-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-mint/10 group-hover:text-mint transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                     </div>
                     <span className="font-bold text-sm text-slate-800 truncate w-full text-center px-2">{tag}</span>
                     <span className="text-[10px] text-slate-400 mt-1 font-mono">{count} Items</span>
                  </button>
                ))}
             </div>
             
             {Object.keys(tagGroups).length === 0 && (
               <div className="flex flex-col items-center justify-center h-64 text-slate-300 border-2 border-dashed border-zinc-200 rounded-2xl">
                 <p className="text-sm font-medium">库中暂无晶体</p>
                 <p className="text-xs mt-1">开始熔炼以构建您的第二大脑</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeLibrary;