import { Component, lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner"; // Biblioteca de alertas
import { ClientAuthProvider } from "./lib/clientAuth";


const Home = lazy(() => import("./pages/Home"));
const ClientRegister = lazy(() => import("./pages/client/Register"));
const ClientCatalog = lazy(() => import("./pages/client/Catalog"));
const Checkout = lazy(() => import("./pages/client/Checkout"));
const Scanner = lazy(() => import("./pages/client/Scanner"));
const ShoppingListPage = lazy(() => import("./pages/client/ShoppingList"));
const WalletPage = lazy(() => import("./pages/client/Wallet"));
const MerchantDashboard = lazy(() => import("./pages/merchant/Dashboard"));
const MerchantLogin = lazy(() => import("./pages/merchant/Login"));
const MerchantRoute = lazy(() => import("./pages/merchant/MerchantRoute"));
const Coupons = lazy(() => import("./pages/merchant/Coupons"));
const Reports = lazy(() => import("./pages/merchant/Reports"));
const MerchantScanner = lazy(() => import("./pages/merchant/Scanner"));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Carregando...</p>
    </div>
  );
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Erro ao carregar a aplicacao:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Nao foi possivel carregar a pagina</h1>
            <p className="text-gray-600">Recarregue o navegador ou verifique o console para mais detalhes.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ClientAuthProvider>
        <BrowserRouter>
          {/* Exibe notificações de sucesso/erro no canto superior direito */}
          <Toaster position="top-right" richColors />
          
          <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<ClientRegister />} />
          
          {/* Rotas do Cliente */}
          <Route path="/client" element={<ClientCatalog />} />
          <Route path="/client/checkout" element={<Checkout />} />
          <Route path="/client/scanner" element={<Scanner />} />
          <Route path="/client/shopping-list" element={<ShoppingListPage />} />
          <Route path="/client/wallet" element={<WalletPage />} />
          
          {/* Rotas de acesso ao painel do mercador */}
          <Route path="/merchant/login" element={<MerchantLogin />} />
          <Route path="/merchant" element={<MerchantRoute><MerchantDashboard /></MerchantRoute>} />
          <Route path="/merchant/coupons" element={<MerchantRoute><Coupons /></MerchantRoute>} />
          <Route path="/merchant/reports" element={<MerchantRoute><Reports /></MerchantRoute>} />
          <Route path="/merchant/scanner" element={<MerchantRoute><MerchantScanner /></MerchantRoute>} />
          
          {/* Rota 404 - Redireciona para a Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </ClientAuthProvider>
    </AppErrorBoundary>
  );
}
