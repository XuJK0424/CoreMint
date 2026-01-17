import React from 'react';

interface SmeltButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const SmeltButton: React.FC<SmeltButtonProps> = ({ onClick, isLoading }) => {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .btn-silver {
          background: linear-gradient(
            110deg, 
            #e4e4e7 10%, 
            #ffffff 20%, 
            #f4f4f5 30%, 
            #d4d4d8 50%, 
            #e4e4e7 80%, 
            #ffffff 90%, 
            #e4e4e7 100%
          );
          background-size: 200% 100%;
          border: 1px solid #d4d4d8;
          box-shadow: 
            0 2px 5px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .btn-silver:hover {
          animation: shimmer 3s linear infinite;
          box-shadow: 
            0 4px 12px rgba(0,0,0,0.1),
            inset 0 1px 0 rgba(255,255,255,0.9);
          border-color: #a1a1aa;
        }

        .gear-spin {
          animation: spin 3s linear infinite;
          transform-origin: center;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`
          group relative overflow-hidden rounded-xl px-8 py-3 
          text-sm font-bold tracking-widest transition-all duration-300
          ${isLoading ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:-translate-y-0.5'}
          btn-silver text-slate-800
        `}
      >
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <>
              {/* Metallic Gear Icon */}
              <svg className="h-5 w-5 gear-spin text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>正在熔炼...</span>
            </>
          ) : (
            <>
              <span className="text-slate-900">⚡</span>
              <span>立即熔炼 / SMELT</span>
            </>
          )}
        </span>
      </button>
    </>
  );
};

export default SmeltButton;