
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, icon: '🏠', label: '工作台' },
    { id: AppView.DRAFTING, icon: '✍️', label: '说明书撰写' },
    { id: AppView.OA_ASSISTANT, icon: '⚖️', label: '审查意见答复' },
    { id: AppView.UNDERSTANDER, icon: '🧠', label: '技术深度理解' },
    { id: AppView.DIFF_EXPERT, icon: '↔️', label: '差异对比分析' },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white/80 backdrop-blur-xl flex flex-col z-20 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="font-bold text-white tracking-tighter italic">P</span>
          </div>
          <h1 className="font-bold text-lg tracking-tight text-zinc-900">
            PatentPro <span className="text-blue-600">Next</span>
          </h1>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className={`text-lg transition-transform duration-200 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
              {currentView === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-100">
        <div className="glass rounded-2xl p-3 flex items-center gap-3 bg-zinc-50/50">
          <img src="https://picsum.photos/32/32?grayscale" className="w-8 h-8 rounded-full border border-zinc-200" alt="Avatar" />
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-zinc-900 truncate">高级专利代理师</p>
            <p className="text-[10px] text-zinc-500 truncate">Gemini 3 Pro Active</p>
          </div>
          <button className="ml-auto text-zinc-400 hover:text-zinc-900 transition-colors">⚙️</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
