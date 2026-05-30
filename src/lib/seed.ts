import type { Product, Customer, Coupon, Purchase } from "../types";

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Arroz Branco 5kg",
    category: "Grãos",
    price: 25.9,
    originalPrice: 29.9,
    available: true,
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400",
    description: "Arroz tipo 1, grãos longos",
    discount: 13,
    barcode: "7891234567890",
    brand: "Marca Premium",
    stock: 150,
  },
  {
    id: "2",
    name: "Feijão Preto 1kg",
    category: "Grãos",
    price: 8.5,
    available: true,
    image: "https://images.unsplash.com/photo-1647545401750-6dd5539879ac?w=400",
    description: "Feijão preto selecionado",
    barcode: "7891234567891",
    brand: "Grãos Nobres",
    stock: 200,
  },
  {
    id: "3",
    name: "Leite Integral 1L",
    category: "Laticínios",
    price: 4.99,
    available: true,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400",
    description: "Leite integral UHT",
    barcode: "7891234567892",
    brand: "Leiteira",
    stock: 300,
  },
  {
    id: "4",
    name: "Café Torrado 500g",
    category: "Bebidas",
    price: 18.9,
    originalPrice: 22.0,
    available: true,
    image: "https://images.tcdn.com.br/img/img_prod/1323340/cafe_torrado_em_graos_felice_cafes_especiais_pcte_500g_29_2_920a80dc6ca655f9fed539235458de84.png",
    description: "Café torrado e moído",
    discount: 14,
    barcode: "7891234567893",
    brand: "Café Bom",
    stock: 80,
  },
  {
    id: "5",
    name: "Macarrão Espaguete 500g",
    category: "Massas",
    price: 3.99,
    available: true,
    image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400",
    description: "Massa de sêmola de trigo duro",
    barcode: "7891234567894",
    brand: "Massa Boa",
    stock: 250,
  },
  {
    id: "6",
    name: "Óleo de Soja 900ml",
    category: "Óleos",
    price: 6.5,
    available: true,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
    description: "Óleo de soja refinado",
    barcode: "7891234567895",
    brand: "Óleos Bons",
    stock: 120,
  },
  {
    id: "7",
    name: "Lava Roupas Líquido 1.5L",
    category: "Limpeza",
    price: 12.9,
    originalPrice: 15.0,
    available: true,
    image: "https://images.unsplash.com/photo-1624372635282-b324bcdd4907?w=400",
    description: "Lava roupas líquido 1.5 litros",
    discount: 14,
    barcode: "7891234567896",
    brand: "Limpa Bem",
    stock: 90,
  },
  {
    id: "8",
    name: "Iogurte Natural 170g",
    category: "Laticínios",
    price: 2.5,
    available: true,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    description: "Iogurte natural cremoso",
    barcode: "7891234567897",
    brand: "Leiteira",
    stock: 200,
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    cpf: "123.456.789-00",
    name: "João Silva",
    email: "joao@example.com",
    phone: "(62) 99999-0000",
    discount: 10,
    points: 1250,
    cashback: 45.8,
    verified: true,
    purchaseHistory: [],
    favoriteProducts: [],
  },
  {
    cpf: "987.654.321-00",
    name: "Maria Santos",
    email: "maria@example.com",
    phone: "(62) 98888-1111",
    discount: 5,
    points: 300,
    cashback: 12.0,
    verified: false,
    purchaseHistory: [],
    favoriteProducts: [],
  },
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: "1",
    code: "BEMVINDO10",
    description: "10% de desconto na primeira compra",
    discountType: "percentage",
    discountValue: 10,
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    usedCount: 0,
    active: true,
  },
  {
    id: "2",
    code: "FRETE20",
    description: "R$ 20 de desconto em compras acima de R$ 100",
    discountType: "fixed",
    discountValue: 20,
    minPurchase: 100,
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    usedCount: 5,
    active: true,
  },
  {
    id: "3",
    code: "VIP15",
    description: "15% exclusivo para clientes VIP",
    discountType: "percentage",
    discountValue: 15,
    customerCPF: "123.456.789-00",
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    usedCount: 2,
    active: true,
  },
];

const INITIAL_PURCHASES: Purchase[] = [
  {
    id: "1",
    customerId: "123.456.789-00",
    storeId: "store1",
    date: "2026-05-20",
    items: [],
    subtotal: 250.0,
    discounts: 25.0,
    total: 225.0,
    pointsEarned: 225,
    cashbackEarned: 11.25,
  },
  {
    id: "2",
    customerId: "987.654.321-00",
    storeId: "store1",
    date: "2026-05-21",
    items: [],
    subtotal: 180.0,
    discounts: 18.0,
    total: 162.0,
    pointsEarned: 162,
    cashbackEarned: 8.1,
  },
  {
    id: "3",
    customerId: "123.456.789-00",
    storeId: "store1",
    date: "2026-05-22",
    items: [],
    subtotal: 320.0,
    discounts: 32.0,
    total: 288.0,
    pointsEarned: 288,
    cashbackEarned: 14.4,
  },
  {
    id: "4",
    customerId: "987.654.321-00",
    storeId: "store1",
    date: "2026-05-23",
    items: [],
    subtotal: 95.0,
    discounts: 5.0,
    total: 90.0,
    pointsEarned: 90,
    cashbackEarned: 4.5,
  },
  {
    id: "5",
    customerId: "123.456.789-00",
    storeId: "store1",
    date: "2026-05-24",
    items: [],
    subtotal: 150.0,
    discounts: 15.0,
    total: 135.0,
    pointsEarned: 135,
    cashbackEarned: 6.75,
  },
  {
    id: "6",
    customerId: "987.654.321-00",
    storeId: "store1",
    date: "2026-05-25",
    items: [],
    subtotal: 200.0,
    discounts: 20.0,
    total: 180.0,
    pointsEarned: 180,
    cashbackEarned: 9.0,
  },
  {
    id: "7",
    customerId: "123.456.789-00",
    storeId: "store1",
    date: "2026-05-26",
    items: [],
    subtotal: 85.0,
    discounts: 8.5,
    total: 76.5,
    pointsEarned: 76,
    cashbackEarned: 3.83,
  },
];
/** Dados de exemplo para o aplicativo */

function hasValidArrayItem(key: string, isValidItem: (value: unknown) => boolean) {
  const value = localStorage.getItem(key);

  if (!value) {
    return false;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) && parsed.some(isValidItem);
  } catch {
    localStorage.removeItem(key);
    return false;
  }
}

function isStoredProduct(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const product = value as Partial<Product>;
  return typeof product.id === "string" && typeof product.name === "string" && typeof product.price === "number";
}

function isStoredCustomer(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const customer = value as Partial<Customer>;
  return typeof customer.name === "string" && (typeof customer.cpf === "string" || typeof customer.cnpj === "string");
}

function isStoredCoupon(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const coupon = value as Partial<Coupon>;
  return typeof coupon.id === "string" && typeof coupon.code === "string";
}

function isStoredPurchase(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const purchase = value as Partial<Purchase>;
  return typeof purchase.id === "string" && typeof purchase.total === "number";
}

export function seedData() {
  if (!hasValidArrayItem("products", isStoredProduct)) {
    localStorage.setItem("products", JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!hasValidArrayItem("customers", isStoredCustomer)) {
    localStorage.setItem("customers", JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!hasValidArrayItem("coupons", isStoredCoupon)) {
    localStorage.setItem("coupons", JSON.stringify(INITIAL_COUPONS));
  }
  if (!hasValidArrayItem("purchases", isStoredPurchase)) {
    localStorage.setItem("purchases", JSON.stringify(INITIAL_PURCHASES));
  }
}
