import { store } from "./store"
import { AdPulseDashboard } from "./pages/AdPulseDashboard";
import { Provider } from "react-redux";
import { ThemeProvider } from "@emotion/react";
import { Toaster } from "react-hot-toast";
import { darkTheme, lightTheme } from "./Theme";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAppSelector } from "./store/store-hooks";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";

const CampaignDetail = lazy(() => import("./components/CampaignDetail").then(module => ({ default: module.CampaignDetail })));

function AppContent() {
  const mode = useAppSelector((state) => state.theme.mode);
  const theme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/campaigns" replace />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/campaigns" element={<AdPulseDashboard />}>
                <Route path=":id" element={
                  <Suspense fallback={null}>
                    <CampaignDetail />
                  </Suspense>
                } />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: theme.card,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
            fontFamily: theme.fontBody,
          },
        }}
      />
    </ThemeProvider>
  );
}

function App(){
 return (
  <Provider store={store} >
    <AppContent />
  </Provider>
 )
}

export default App;