export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  available: boolean;
  image: string;
  description: string;
  discount?: number;
  barcode?: string;
  brand?: string;
  stock?: number;
  averageRating?: number;
  totalRatings?: number;
}

export interface Customer {
  cpf?: string;
  cnpj?: string;
  name: string;
  email?: string;
  phone?: string;
  discount: number;
  points: number;
  cashback: number;
  verified?: boolean;
  purchaseHistory?: string[];
  favoriteProducts?: string[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  customerCPF?: string;
}

export interface ShoppingListItem {
  productId: string;
  productName: string;
  quantity: number;
  checked: boolean;
  notifyOnPromo?: boolean;
}

export interface ShoppingList {
  id: string;
  customerId: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Purchase {
  id: string;
  customerId: string;
  storeId: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  discounts: number;
  total: number;
  pointsEarned: number;
  cashbackEarned: number;
}
