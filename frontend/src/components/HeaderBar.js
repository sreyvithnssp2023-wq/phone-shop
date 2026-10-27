import React from 'react';

export default function HeaderBar() {
  return (
    <header className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Angkor-Electronic Logo"
          className="w-10 h-10 rounded-xl object-cover border border-indigo-500/30 shadow-md"
        />
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">
            Angkor-Electronic
          </h1>
          <p className="text-[11px] text-indigo-400 font-medium">
            POS & Inventory System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
          A
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-200">
            Chork Chansovanpanha
          </p>
          <span className="text-[10px] text-indigo-400 font-medium">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}