import { AlertsView } from './components/alerts/AlertsView';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { NetworkView } from './components/network/NetworkView';
import { OverviewView } from './components/overview/OverviewView';
import { ReportsView } from './components/reports/ReportsView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { ToastContainer } from './components/ui/ToastContainer';
import { FinGuardProvider, useFinGuard } from './context/FinGuardContext';
import { useLiveSimulation } from './hooks/useLiveSimulation';

function AppShell() {
  const { state } = useFinGuard();
  useLiveSimulation();

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
          {state.activeView === 'overview' && <OverviewView />}
          {state.activeView === 'transactions' && <TransactionsView />}
          {state.activeView === 'alerts' && <AlertsView />}
          {state.activeView === 'network' && <NetworkView />}
          {state.activeView === 'reports' && <ReportsView />}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <FinGuardProvider>
      <AppShell />
    </FinGuardProvider>
  );
}
