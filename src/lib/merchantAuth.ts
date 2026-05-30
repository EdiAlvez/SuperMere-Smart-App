import { readStoredJson } from "./storage";

export interface MerchantUser {
  name: string;
  email: string;
}

const MERCHANT_AUTH_KEY = "merchantAuthenticated";
const MERCHANT_USER_KEY = "merchantUser";

export const merchantCredentials = {
  email: "merchant@supermere.com",
  password: "mercador123",
  name: "SuperMere Smart",
};

export const isMerchantAuthenticated = (): boolean =>
  sessionStorage.getItem(MERCHANT_AUTH_KEY) === "true";

export const loginMerchant = () => {
  sessionStorage.setItem(MERCHANT_AUTH_KEY, "true");
  sessionStorage.setItem(
    MERCHANT_USER_KEY,
    JSON.stringify({ name: merchantCredentials.name, email: merchantCredentials.email })
  );
};

export const logoutMerchant = () => {
  sessionStorage.removeItem(MERCHANT_AUTH_KEY);
  sessionStorage.removeItem(MERCHANT_USER_KEY);
};

export const getMerchantUser = (): MerchantUser | null => {
  if (!isMerchantAuthenticated()) {
    return null;
  }

  return readStoredJson<MerchantUser>(MERCHANT_USER_KEY, {
    name: merchantCredentials.name,
    email: merchantCredentials.email,
  }, sessionStorage);
};
