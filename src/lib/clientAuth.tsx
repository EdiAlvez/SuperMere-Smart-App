import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { readStoredJson, removeStoredItem, writeStoredJson } from "./storage";
import type { Customer } from "../types";

type ClientAuthContextType = {
  currentCustomer: Customer | null;
  loginCustomer: (customer: Customer) => void;
  logoutCustomer: () => void;
};

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

function isCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== "object") {
    return false;
  }

  const customer = value as Partial<Customer>;
  return (
    typeof customer.name === "string" &&
    (typeof customer.cpf === "string" || typeof customer.cnpj === "string")
  );
}

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const savedCustomer = readStoredJson<unknown>("currentCustomer", null, sessionStorage);
    setCurrentCustomer(isCustomer(savedCustomer) ? savedCustomer : null);
  }, []);

  const loginCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    writeStoredJson("currentCustomer", customer, sessionStorage);
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    removeStoredItem("currentCustomer", sessionStorage);
  };

  return (
    <ClientAuthContext.Provider value={{ currentCustomer, loginCustomer, logoutCustomer }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (!context) {
    throw new Error("useClientAuth must be used within a ClientAuthProvider");
  }
  return context;
}
