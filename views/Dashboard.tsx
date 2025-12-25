
import React from 'react';
import { AppView } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const stats = [
    { label: '本月撰写', value: '12', trend: '+20%', icon: '📝', color: 'text-blue-600' },
    { label: 'OA 响应率', value: '98%', trend: '+5%', icon: '⚡', color: 'text-amber-600' },
    { label: 'AI 节省时长', value: '142h', trend: '+12%', icon: '⏰', color: 'text-purple-600' },
    { label: '处理中案件', value: '8', trend: '稳定', icon: '📂', color: 'text-zinc-600' },
  ];

  const quickActions = [
    { id: AppView.DRAFTING, title: '智能撰写说明书', desc: '根据权利要求自动生成图文并茂的说明书草案', color: 'from-blue-50 to-indigo-50', border: 'border-blue-100' },
    { id: AppView.OA_ASSISTANT, title: '三步法 OA 分析', desc: '解析通知书与对比文件，深度构建创造性抗辩逻辑', color: 'from-purple-50 to-pink-50', border: 'border-purple-100' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="space-y-1">
        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Workspace</p>
        <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900">下午好, 代理师</h2>
        <p className="text-zinc-500 max-w-2xl text-lg">
          PatentPro Next 已经为您准备好最新的法律指南与判例数据。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className={`text-3xl ${stat.color}`}>{stat.icon}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-zinc-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onNavigate(action.id)}
            className={`group text-left p-10 rounded-[2.5rem] border ${action.border} bg-gradient-to-br ${action.color} hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 relative overflow-hidden`}
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 text-zinc-900 group-hover:translate-x-1 transition-transform">{action.title}</h3>
              <p className="text-zinc-600 text-base leading-relaxed max-w-sm mb-8">{action.desc}</p>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-bold">
                立即开始
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 text-9xl opacity-[0.03] group-hover:scale-125 transition-transform duration-1000 rotate-12 select-none">
              {action.id === AppView.DRAFTING ? '✍️' : '⚖️'}
            </div>
          </button>
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold text-zinc-900">活跃案件记录</h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">查看全部 →</button>
        </div>
        <div className="bg-white rounded-[2rem] overflow-hidden border border-zinc-200 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-50 text-zinc-500 border-b border-zinc-100">
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">案件编号</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">技术标题</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">任务类型</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {[
                { id: 'CN202410293.0', title: '一种基于多模态大模型的代码漏洞自动修复方法', type: '说明书撰写', status: '进行中' },
                { id: 'US18/923,412', title: 'Adaptive Heat Exchange System for EV Battery Packs', type: 'OA 答复', status: '已完成' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50/50 transition-colors cursor-pointer group">
                  <td className="px-8 py-6 font-mono text-zinc-400 font-medium group-hover:text-zinc-900 transition-colors">{row.id}</td>
                  <td className="px-8 py-6 font-bold text-zinc-800">{row.title}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase tracking-wider">{row.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`flex items-center gap-2 font-bold ${row.status === '进行中' ? 'text-blue-600' : 'text-emerald-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${row.status === '进行中' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
