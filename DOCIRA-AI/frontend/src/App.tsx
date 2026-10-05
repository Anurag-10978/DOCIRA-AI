// import React, { useEffect } from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { useAuthStore } from './store/authStore';
// import { ExtractPage } from './pages/features/ExtractPage';
// import { LoginPage }           from './pages/auth/LoginPage';
// import { RegisterPage }        from './pages/auth/RegisterPage';
// import { DashboardPage }       from './pages/dashboard/DashboardPage';
// import { KnowledgeBasesPage }  from './pages/knowledge-bases/KnowledgeBasesPage';
// import { KnowledgeBaseDetail } from './pages/knowledge-bases/KnowledgeBaseDetail';
// import { ChatPage }            from './pages/chat/ChatPage';
// import { SearchPage }          from './pages/search/SearchPage';
// import { AnalyticsPage }       from './pages/analytics/AnalyticsPage';
// import { SystemHealthPage }    from './pages/system/SystemHealthPage';
// import { AISettingsPage }      from './pages/settings/AISettingsPage';
// import { SummarizePage }       from './pages/features/SummarizePage';
// import { ComparePage }         from './pages/features/ComparePage';
// import { ToastContainer }      from './components/ui/Toast';

// const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

// function Protected({ children }: { children: React.ReactNode }) {
//   const { isAuthenticated } = useAuthStore();
//   return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
// }
// function Public({ children }: { children: React.ReactNode }) {
//   const { isAuthenticated } = useAuthStore();
//   return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
// }

// export default function App() {
//   const { initFromStorage } = useAuthStore();
//   useEffect(() => { initFromStorage(); }, [initFromStorage]);

//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login"               element={<Public><LoginPage /></Public>} />
//           <Route path="/extract" element={<Protected><ExtractPage /></Protected>} />
//           <Route path="/register"            element={<Public><RegisterPage /></Public>} />
//           <Route path="/dashboard"           element={<Protected><DashboardPage /></Protected>} />
//           <Route path="/knowledge-bases"     element={<Protected><KnowledgeBasesPage /></Protected>} />
//           <Route path="/knowledge-bases/:id" element={<Protected><KnowledgeBaseDetail /></Protected>} />
//           <Route path="/chat"                element={<Protected><ChatPage /></Protected>} />
//           <Route path="/search"              element={<Protected><SearchPage /></Protected>} />
//           <Route path="/analytics"           element={<Protected><AnalyticsPage /></Protected>} />
//           <Route path="/system"              element={<Protected><SystemHealthPage /></Protected>} />
//           <Route path="/settings/ai"         element={<Protected><AISettingsPage /></Protected>} />
//           <Route path="/summarize"           element={<Protected><SummarizePage /></Protected>} />
//           <Route path="/compare"             element={<Protected><ComparePage /></Protected>} />
//           <Route path="/"                    element={<Navigate to="/dashboard" replace />} />
//           <Route path="*"                    element={<Navigate to="/dashboard" replace />} />
//         </Routes>
//         <ToastContainer />
//       </BrowserRouter>
//     </QueryClientProvider>
//   );
// }

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuthStore } from './store/authStore';

import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';

// Authentication
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard
import { DashboardPage } from './pages/dashboard/DashboardPage';

// Knowledge Bases
import { KnowledgeBasesPage } from './pages/knowledge-bases/KnowledgeBasesPage';
import { KnowledgeBaseDetail } from './pages/knowledge-bases/KnowledgeBaseDetail';

// Chat & Search
import { ChatPage } from './pages/chat/ChatPage';
import { SearchPage } from './pages/search/SearchPage';

// Analytics & System
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SystemHealthPage } from './pages/system/SystemHealthPage';

// Settings
import { AISettingsPage } from './pages/settings/AISettingsPage';

// AI Features
import { SummarizePage } from './pages/features/SummarizePage';
import { ComparePage } from './pages/features/ComparePage';
import { ExtractPage } from './pages/features/ExtractPage';

// 404
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
    mutations: {
      retry: 0,
    },
  },
});

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function Public({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
  const { initFromStorage } = useAuthStore();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>

            {/* Public */}
            <Route
              path="/login"
              element={
                <Public>
                  <LoginPage />
                </Public>
              }
            />

            <Route
              path="/register"
              element={
                <Public>
                  <RegisterPage />
                </Public>
              }
            />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <DashboardPage />
                </Protected>
              }
            />

            <Route
              path="/knowledge-bases"
              element={
                <Protected>
                  <KnowledgeBasesPage />
                </Protected>
              }
            />

            <Route
              path="/knowledge-bases/:id"
              element={
                <Protected>
                  <KnowledgeBaseDetail />
                </Protected>
              }
            />

            <Route
              path="/chat"
              element={
                <Protected>
                  <ChatPage />
                </Protected>
              }
            />

            <Route
              path="/search"
              element={
                <Protected>
                  <SearchPage />
                </Protected>
              }
            />

            <Route
              path="/analytics"
              element={
                <Protected>
                  <AnalyticsPage />
                </Protected>
              }
            />

            <Route
              path="/system"
              element={
                <Protected>
                  <SystemHealthPage />
                </Protected>
              }
            />

            <Route
              path="/settings/ai"
              element={
                <Protected>
                  <AISettingsPage />
                </Protected>
              }
            />

            {/* AI Features */}
            <Route
              path="/summarize"
              element={
                <Protected>
                  <SummarizePage />
                </Protected>
              }
            />

            <Route
              path="/compare"
              element={
                <Protected>
                  <ComparePage />
                </Protected>
              }
            />

            <Route
              path="/extract"
              element={
                <Protected>
                  <ExtractPage />
                </Protected>
              }
            />

            {/* Default */}
            <Route
              path="/"
              element={<Navigate to="/dashboard" replace />}
            />

            {/* 404 */}
            <Route
              path="*"
              element={<NotFoundPage />}
            />

          </Routes>

          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}