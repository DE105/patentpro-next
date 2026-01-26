
import React, { useState } from 'react';
import { AppView } from '@/shared';
import Sidebar from '@/app/layout/Sidebar';
import { Dashboard, Drafting, OAAgent, Understander, DiffExpert } from '@/features';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard onNavigate={setCurrentView} />;
      case AppView.DRAFTING: return <Drafting />;
      case AppView.OA_ASSISTANT: return <OAAgent />;
      case AppView.UNDERSTANDER: return <Understander />;
      case AppView.DIFF_EXPERT: return <DiffExpert />;
      default: return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f9fafb] text-zinc-900 selection:bg-blue-500/10">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent)] pointer-events-none" />
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
