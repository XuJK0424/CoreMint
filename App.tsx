import React, { useState, useCallback } from 'react';
import { AppMode, AnalysisResult } from './types';
import { MODES, INITIAL_INPUT, INITIAL_RESULT } from './constants';
import { analyzeText } from './services/geminiService';
import SmeltButton from './components/SmeltButton';
import ModeSelector from './components/ModeSelector';
import KnowledgeLibrary from './components/KnowledgeLibrary';
import { addToLibrary } from './utils/libraryUtils';

// --- Mind Map Component (Internal for simplicity) ---
const MindMapNode = ({ 
  label, 
  children, 
  isRoot = false, 
  defaultExpanded = true 
}: { 
  label: string, 
  children?: React.ReactNode, 
  isRoot?: boolean,
  defaultExpanded?: boolean 
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div className="flex flex-col items-center">
      <div 
        onClick={() => hasChildren && setExpanded(!expanded)}
        className={`
          relative z-10 cursor-pointer transition-all duration-300
          ${isRoot 
            ? 'bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 border-4 border-zinc-100' 
            : 'bg-white text-slate-700 px-4 py-2 rounded-lg border border-zinc-200 shadow-sm hover:border-mint hover:shadow-md'
          }
          ${!expanded && hasChildren ? 'ring-2 ring-zinc-200' : ''}
        `}
      >
        <div className="flex items-center gap-2">
           <span className={`${isRoot ? 'font-bold text-sm tracking-widest' : 'font-medium text-xs'}`}>
             {label}
           </span>
           {hasChildren && !isRoot && (
             <span className="text-[10px] text-slate-400">{expanded ? '−' : '+'}</span>
           )}
        </div>
      </div>
      
      {hasChildren && expanded && (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Vertical Line */}
          <div className="h-6 w-px bg-zinc-300"></div>
          
          {/* Children Container */}
          <div className="flex gap-4 relative">
             {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Tree Structure for MVP
const MindMapTree = ({ data }: { data: AnalysisResult }) => {
  return (
    <div className="w-full h-full overflow-auto flex items-start justify-center p-8 min-w-[600px]">
       <div className="flex flex-col gap-8 items-center mt-10">
          {/* Root */}
          <MindMapNode label={data.keywords || "Core"} isRoot>
             <div className="flex gap-12 mt-4">
                {/* Branch 1: Logic */}
                <MindMapNode label="底层逻辑 (Logic)">
                   <div className="flex gap-4 pt-4">
                      {data.underlyingLogic?.map((item, idx) => (
                        <div key={idx} className="w-40 p-3 bg-white/90 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 leading-relaxed shadow-sm">
                           {item}
                        </div>
                      ))}
                   </div>
                </MindMapNode>

                {/* Branch 2: Steps */}
                <MindMapNode label="实操步骤 (Action)">
                   <div className="flex gap-4 pt-4">
                      {data.actionableSteps?.map((item, idx) => (
                        <div key={idx} className="w-40 p-3 bg-white/90 border border-dashed border-mint/50 rounded-lg text-xs text-slate-600 leading-relaxed shadow-sm">
                           <span className="font-bold text-mint mr-1">{idx+1}.</span>{item}
                        </div>
                      ))}
                   </div>
                </MindMapNode>
             </div>
          </MindMapNode>
       </div>
    </div>
  );
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TOXIC);
  const [input, setInput] = useState<string>(INITIAL_INPUT);
  const [result, setResult] = useState<AnalysisResult | null>(INITIAL_RESULT);
  const [memo, setMemo] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Library State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleSmelt = useCallback(async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [apiResult] = await Promise.all([
        analyzeText(input, mode),
        new Promise(resolve => setTimeout(resolve, 2500)) 
      ]);
      setResult(apiResult);
      
      // Auto-save to Library
      addToLibrary(apiResult, memo); // Pass current memo if user typed one before smelting
      
    } catch (err) {
      setError("熔炼失败。核心不稳定。请重试。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [input, mode, memo]);

  return (
    <div className="min-h-screen flex flex-col text-slate-900 bg-[#fafafa] font-sans selection:bg-slate-200">
      {/* Header & Controls */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md shadow-slate-200">
                 CM
               </div>
               <h1 className="text-lg font-bold tracking-tight text-slate-900">
                 CoreMint <span className="text-slate-300 font-light mx-1">/</span> <span className="text-slate-500 font-medium">智核</span>
               </h1>
            </div>
            
            <div className="hidden md:flex text-xs font-mono text-slate-400 gap-4">
               <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE</span>
               <span>v2.1.0</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <div className="flex-1 w-full relative group">
              <label className="absolute -top-2.5 left-3 px-1.5 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest group-focus-within:text-slate-900 transition-colors z-10">
                原始素材 / RAW MATERIAL
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此粘贴原素材..."
                className="w-full h-24 bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 focus:border-slate-400 focus:ring-0 rounded-xl p-4 text-sm text-slate-700 leading-relaxed resize-none transition-all duration-300 shadow-inner"
              />
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto justify-between md:justify-end">
              <ModeSelector currentMode={mode} onChange={setMode} />
              <SmeltButton onClick={handleSmelt} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace - Layout Refactored to Flex Column (Top-Bottom) */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-10 relative pb-20">
        
        {/* Loading Overlay (Full Screen) */}
        {isLoading && (
          <div className="fixed inset-0 z-[60] bg-white/60 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500">
             <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                   <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-slate-800 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-slate-900 font-mono text-xs tracking-[0.2em] animate-pulse">正在熔炼 / SMELTING</p>
             </div>
          </div>
        )}

        {/* TOP PANEL: Knowledge Crystal Analysis */}
        {/* Changed: Removed max-height/overflow-y to allow page scrolling */}
        <section className={`flex flex-col gap-6 w-full transition-all duration-500 ${isLoading ? 'blur-sm scale-[0.99]' : 'scale-100'}`}>
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
             <div className="h-1.5 w-1.5 rounded-full bg-slate-900"></div>
             <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">知识锚点 / KNOWLEDGE ANCHOR</h2>
          </div>

          {error ? (
             // Updated Error Style: Soft Red Background
             <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
             </div>
          ) : result ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* 1. Core Insight (Full Width) */}
              <div className="md:col-span-2 bg-white rounded-xl p-8 shadow-sm border border-zinc-100 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
                 <h3 className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-lg">⚓</span> 核心观点 / Insight
                 </h3>
                 <p className="text-xl md:text-2xl text-slate-800 font-bold leading-relaxed tracking-tight">
                   {result.coreInsight}
                 </p>
              </div>

              {/* 2. Underlying Logic */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100 h-full">
                 <h3 className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-lg">🧠</span> 底层逻辑 / Principle
                 </h3>
                 <ul className="space-y-4">
                   {result.underlyingLogic?.map((item, idx) => (
                     <li key={idx} className="flex gap-3 text-sm text-slate-600 group">
                       <span className="w-6 h-6 flex-shrink-0 rounded bg-slate-100 text-slate-500 flex items-center justify-center text-[11px] font-mono group-hover:bg-slate-200 transition-colors">{idx + 1}</span>
                       <span className="leading-relaxed pt-0.5">{item}</span>
                     </li>
                   ))}
                 </ul>
              </div>

              {/* 3. Actionable Steps */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-100 h-full">
                 <h3 className="text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-lg text-mint">⚡</span> 实操步骤 / Action
                 </h3>
                 <ul className="space-y-4">
                   {result.actionableSteps?.map((item, idx) => (
                     <li key={idx} className="flex gap-3 text-sm text-slate-600 group">
                       <span className="w-6 h-6 flex-shrink-0 rounded bg-mint/10 text-mint flex items-center justify-center text-[11px] font-mono border border-mint/20">{idx + 1}</span>
                       <span className="leading-relaxed font-medium text-slate-700 pt-0.5">{item}</span>
                     </li>
                   ))}
                 </ul>
              </div>

              {/* 4. Case Studies */}
              <div className="md:col-span-2 bg-zinc-50 rounded-xl p-6 border border-dashed border-zinc-200">
                 <h3 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-lg">📖</span> 真实案例 / Case
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.caseStudies?.map((item, idx) => (
                       <p key={idx} className="text-xs text-slate-500 italic border-l-2 border-zinc-300 pl-3 leading-relaxed py-1">
                         "{item}"
                       </p>
                    ))}
                 </div>
              </div>

              {/* 5. Personal Memo (Full Width) */}
              <div className="md:col-span-2 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden group focus-within:ring-1 focus-within:ring-slate-200 transition-all">
                 <div className="bg-zinc-50/50 px-4 py-2 border-b border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">个人备注 / PERSONAL MEMO</span>
                    <span className="text-[10px] text-slate-300">Markdown Supported</span>
                 </div>
                 <textarea 
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="在此记录你的个人思考、标签或延伸想法..."
                    className="w-full h-24 p-4 text-sm text-slate-700 bg-white border-0 focus:ring-0 resize-none font-mono leading-relaxed"
                 />
              </div>

            </div>
          ) : (
            <div className="w-full flex items-center justify-center text-slate-300 text-sm border-2 border-dashed border-zinc-200 rounded-2xl h-40">
              等待原素材输入...
            </div>
          )}
        </section>

        {/* BOTTOM PANEL: Mind Map & Library */}
        {/* Changed: w-full and min-height to allow vertical stacking without squishing content */}
        <section className={`relative w-full min-h-[600px] h-[80vh] bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden bg-grid-pattern transition-all duration-500 ${isLoading ? 'blur-sm scale-[0.99]' : 'scale-100'}`}>
           <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
           
           <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
             <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
             <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">知识网络 / MIND MAP</h2>
           </div>

           {/* Library Toggle Button */}
           <button 
             onClick={() => setIsLibraryOpen(true)}
             className="absolute top-6 right-6 z-30 flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md hover:border-mint/50 transition-all group"
           >
             <svg className="w-4 h-4 text-slate-400 group-hover:text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
             </svg>
             <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">知识总库</span>
           </button>

           {result ? (
               <MindMapTree data={result} />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-center opacity-40">
                    <div className="w-16 h-16 border border-slate-300 rounded-full mx-auto flex items-center justify-center mb-4">
                       <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">等待数据流接入 / WAITING FOR STREAM</span>
                 </div>
             </div>
           )}

           {/* Library Overlay - Now takes full width of the bottom section */}
           {isLibraryOpen && (
             <KnowledgeLibrary isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />
           )}
        </section>
      </main>
    </div>
  );
};

export default App;