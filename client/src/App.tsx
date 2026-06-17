import { store } from "./store"
import { AdPulseDashboard } from "./pages/AdPulseDashboard";
import { Provider } from "react-redux";
import { ThemeProvider } from "@emotion/react";
import { Toaster } from "react-hot-toast";
import { darkTheme, lightTheme } from "./Theme";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useAppSelector } from "./store/store-hooks";

function AppContent() {
  const mode = useAppSelector((state) => state.theme.mode);
  const theme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <AdPulseDashboard />
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