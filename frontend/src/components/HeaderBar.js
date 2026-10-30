import React from 'react';

export default function HeaderBar({ currentRole }) {
  return (
    <header className="bg-[#0d1424] text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shadow-sm select-none">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Angkor-Electronic Logo"
          className="w-10 h-10 rounded-xl object-cover border border-slate-700/60 shadow-md flex-shrink-0"
        />
        <div>
          <h1 className="text-base font-bold text-white tracking-wide leading-tight">
            Angkor-Electronic
          </h1>
          <p className="text-[11px] text-indigo-400 font-medium">
            POS & Inventory System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-[#17223b] px-3.5 py-1.5 rounded-xl border border-indigo-900/40 shadow-sm">
        <img
          src="/logo.png"
          alt="User Avatar"
          className="w-8 h-8 rounded-full object-cover border border-indigo-500/40 shadow-sm flex-shrink-0"
        />
        <div className="text-right">
          <p className="text-xs font-bold text-slate-100 leading-tight">
            Chork Chansovanpanha
          </p>
          <span className="text-[10px] text-indigo-300 font-bold block mt-0.5">
            {currentRole || 'Admin (Chork)'}
          </span>
        </div>
      </div>
    </header>
  );
}