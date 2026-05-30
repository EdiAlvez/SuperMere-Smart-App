import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isMerchantAuthenticated } from "../../lib/merchantAuth";

type MerchantRouteProps = {
  children: ReactNode;
};

export default function MerchantRoute({ children }: MerchantRouteProps) {
  const location = useLocation();
  if (!isMerchantAuthenticated()) {
    return <Navigate to="/merchant/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
