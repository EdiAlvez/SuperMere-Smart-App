import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, Tag } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { QRCode } from "react-qr-code";
import { toast } from "sonner";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { readStoredJson, writeStoredJson } from "../../lib/storage";
import { Input } from "../../components/ui/input";
import { Header } from "../../components/layout/Header";
import type { Customer, Coupon, Purchase } from "../../types";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem>;
  return (
    typeof item.productId === "string" &&
    typeof item.productName === "string" &&
    typeof item.quantity === "number" &&
    typeof item.price === "number"
  );
}

function isCoupon(value: unknown): value is Coupon {
  if (!value || typeof value !== "object") {
    return false;
  }

  const coupon = value as Partial<Coupon>;
  return (
    typeof coupon.id === "string" &&
    typeof coupon.code === "string" &&
    typeof coupon.description === "string" &&
    typeof coupon.validUntil === "string" &&
    typeof coupon.active === "boolean"
  );
}

function isCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== "object") {
    return false;
  }

  const customer = value as Partial<Customer>;
  return typeof customer.name === "string" && (typeof customer.cpf === "string" || typeof customer.cnpj === "string");
}

function isPurchase(value: unknown): value is Purchase {
  if (!value || typeof value !== "object") {
    return false;
  }

  const purchase = value as Partial<Purchase>;
  return typeof purchase.id === "string" && typeof purchase.customerId === "string" && typeof purchase.total === "number";
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [reservationData, setReservationData] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);

  useEffect(() => {
    const savedCart = readStoredJson<unknown[]>("cart", []);
    const savedCustomer = readStoredJson<unknown>("currentCustomer", null, sessionStorage);
    const validCart = Array.isArray(savedCart) ? savedCart.filter(isCartItem) : [];

    setCartItems(validCart);

    const customerFromSession = isCustomer(savedCustomer) ? savedCustomer : null;
    let resolvedCustomer: Customer | null = customerFromSession;

    if (customerFromSession) {
      const savedCustomersRaw = readStoredJson<unknown[]>("customers", []);
      const validCustomers = Array.isArray(savedCustomersRaw) ? savedCustomersRaw.filter(isCustomer) : [];
      const matchedCustomer = validCustomers.find(c =>
        (customerFromSession.cpf && c.cpf === customerFromSession.cpf) ||
        (customerFromSession.cnpj && c.cnpj === customerFromSession.cnpj)
      );

      if (matchedCustomer) {
        resolvedCustomer = matchedCustomer;
      }
    }

    setCurrentCustomer(resolvedCustomer);

    if (resolvedCustomer) {
      const savedCouponsRaw = readStoredJson<unknown[]>("coupons", []);
      const validCoupons = Array.isArray(savedCouponsRaw) ? savedCouponsRaw.filter(isCoupon) : [];
      const userCoupons = validCoupons.filter(c =>
        c.active &&
        new Date(c.validUntil) >= new Date() &&
        (!c.customerCPF || c.customerCPF === resolvedCustomer.cpf)
      );
      setAvailableCoupons(userCoupons);
    }
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
  };

  const handleRemoveItem = (productId: string) => {
    const updated = cartItems.filter(item => item.productId !== productId);
    saveCart(updated);
    toast.success("Item removido do carrinho");
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    const updated = cartItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(updated);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.1; // 10% de taxa de serviço
  const tax = subtotal * taxRate;

  // Efeito para remover cupom automaticamente caso a quantidade dos itens reduza
  // o subtotal para baixo do mínimo exigido pelo cupom
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minPurchase && subtotal < appliedCoupon.minPurchase) {
      setAppliedCoupon(null);
      toast.info(`Cupom removido: a compra mínima exigida é R$ ${appliedCoupon.minPurchase.toFixed(2)}`);
    }
  }, [subtotal, appliedCoupon]);

  const customerDiscountValue = currentCustomer ? subtotal * (currentCustomer.discount / 100) : 0;

  let couponDiscountValue = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      couponDiscountValue = subtotal * (appliedCoupon.discountValue / 100);
    } else {
      couponDiscountValue = appliedCoupon.discountValue;
    }
  }

  const total = Math.max(0, subtotal - customerDiscountValue - couponDiscountValue) + tax;

  const applyCouponCode = (code: string) => {
    if (!code.trim()) {
      toast.error("Digite o código do cupom");
      return;
    }

    const savedCouponsRaw = readStoredJson<unknown[]>("coupons", []);
    const validCoupons = Array.isArray(savedCouponsRaw) ? savedCouponsRaw.filter(isCoupon) : [];
    const coupon = validCoupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());

    if (!coupon) {
      toast.error("Cupom inválido ou não encontrado");
      return;
    }
    if (!coupon.active || new Date(coupon.validUntil) < new Date()) {
      toast.error("Cupom expirado ou inativo");
      return;
    }
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      toast.error(`Este cupom exige compra mínima de R$ ${coupon.minPurchase.toFixed(2)}`);
      return;
    }
    if (coupon.customerCPF && currentCustomer && coupon.customerCPF !== currentCustomer.cpf) {
      toast.error("Cupom não aplicável a este cliente");
      return;
    }

    setAppliedCoupon(coupon);
    setCouponInput("");
    toast.success("Cupom aplicado com sucesso!");
  };

  const handleApplyCoupon = () => applyCouponCode(couponInput);

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Cupom removido");
  };

  const hasFirstPurchaseDiscount = currentCustomer
    ? currentCustomer.discount > 0 && (!currentCustomer.purchaseHistory || currentCustomer.purchaseHistory.length === 0)
    : false;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Carrinho vazio!");
      return;
    }

    if (!currentCustomer) {
      toast.error("Por favor, faça login primeiro");
      navigate("/client");
      return;
    }

    const savedCustomersRaw = readStoredJson<unknown[]>("customers", []);
    const savedCustomers = Array.isArray(savedCustomersRaw) ? savedCustomersRaw.filter(isCustomer) : [];
    const reservation = {
      type: "RESERVATION",
      customerId: currentCustomer.cpf || currentCustomer.cnpj,
      customerName: currentCustomer.name,
      date: new Date().toISOString(),
      total,
      couponApplied: appliedCoupon ? appliedCoupon.code : undefined,
      items: cartItems
    };

    const updatedCustomers = savedCustomers.map(customer => {
      const isSameCustomer = (customer.cpf && currentCustomer.cpf && customer.cpf === currentCustomer.cpf)
        || (customer.cnpj && currentCustomer.cnpj && customer.cnpj === currentCustomer.cnpj);

      if (!isSameCustomer) {
        return customer;
      }

      const purchaseHistory = customer.purchaseHistory || [];
      const updatedCustomer: Customer = {
        ...customer,
        purchaseHistory: [...purchaseHistory, { 
          date: new Date().toISOString(), 
          total, 
          couponApplied: appliedCoupon?.code, 
          items: cartItems 
        } as any],
      };

      if (hasFirstPurchaseDiscount && purchaseHistory.length === 0) {
        updatedCustomer.discount = 0;
      }

      return updatedCustomer;
    });

    localStorage.setItem("customers", JSON.stringify(updatedCustomers));

    const updatedCurrentCustomer = updatedCustomers.find(customer =>
      (customer.cpf && currentCustomer.cpf && customer.cpf === currentCustomer.cpf)
      || (customer.cnpj && currentCustomer.cnpj && customer.cnpj === currentCustomer.cnpj)
    );

    if (updatedCurrentCustomer) {
      setCurrentCustomer(updatedCurrentCustomer);
      writeStoredJson("currentCustomer", updatedCurrentCustomer, sessionStorage);
    }

    const savedPurchasesRaw = readStoredJson<unknown[]>("purchases", []);
    const validPurchases = Array.isArray(savedPurchasesRaw) ? savedPurchasesRaw.filter(isPurchase) : [];
    const purchaseSubtotal = subtotal;
    const purchaseDiscounts = customerDiscountValue + couponDiscountValue;
    const newPurchase: Purchase = {
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}`,
      customerId: currentCustomer.cpf || currentCustomer.cnpj || "",
      storeId: "store1",
      date: new Date().toISOString(),
      items: cartItems,
      subtotal: purchaseSubtotal,
      discounts: purchaseDiscounts,
      total,
      pointsEarned: Math.round(total),
      cashbackEarned: Number((total * 0.05).toFixed(2)),
    };

    localStorage.setItem("purchases", JSON.stringify([...validPurchases, newPurchase]));

    // Desativa o cupom utilizado para que ele suma da carteira
    if (appliedCoupon) {
      const savedCouponsRaw = readStoredJson<unknown[]>("coupons", []);
      const savedCoupons = Array.isArray(savedCouponsRaw) ? savedCouponsRaw.filter(isCoupon) : [];
      const updatedCoupons = savedCoupons.map(c => 
        c.code === appliedCoupon.code ? { ...c, active: false } : c
      );
      localStorage.setItem("coupons", JSON.stringify(updatedCoupons));
    }

    // Simula uma finalização de compra rápida
    setFinalTotal(total);
    localStorage.setItem("cart", JSON.stringify([]));
    setCartItems([]);
    setReservationData(JSON.stringify(reservation));
    setShowQR(true);
    toast.success("Compra finalizada e QR Code gerado com sucesso!");
  };

  return (
    <div className="min-h-screen bg-[#FBFCF8] pt-[80px]">
      <Header 
        title="Carrinho"
        leftNode={
          <button
             onClick={() => navigate("/client")}
             className="text-white hover:bg-[#299449] rounded-md p-2 transition-colors"
           >
             <ArrowLeft className="w-5 h-5" />
           </button>
        }
      />

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
        {cartItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">Seu carrinho está vazio</p>
              <Button
                onClick={() => navigate("/client")}
                className="bg-[#54a648] hover:bg-[#299449] text-white"
              >
                Continuar Comprando
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de itens */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Itens do Carrinho ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map(item => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.productName}</h3>
                        <p className="text-sm text-gray-500">
                          R$ {item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mr-4">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right mr-4 min-w-[80px]">
                        <p className="font-semibold text-[#54a648]">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="p-2 rounded hover:bg-red-100 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button
                onClick={() => navigate("/client")}
                variant="outline"
                className="w-full mt-4 border-[#54a648] text-[#54a648] hover:bg-[#54a648] hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuar Comprando
              </Button>
            </div>

            {/* Resumo do pedido */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentCustomer && (
                    <div className="pb-4 border-b">
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-semibold text-gray-800">{currentCustomer.name}</p>
                      {hasFirstPurchaseDiscount && (
                        <Badge className="bg-green-600 mt-2">
                          Desconto de primeira compra: {currentCustomer.discount}%
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa de Serviço (10%):</span>
                      <span className="font-semibold">R$ {tax.toFixed(2)}</span>
                    </div>
                    {customerDiscountValue > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Desconto Cliente ({currentCustomer?.discount}%):</span>
                        <span className="font-semibold">- R$ {customerDiscountValue.toFixed(2)}</span>
                      </div>
                    )}
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Cupom ({appliedCoupon.code}):</span>
                        <span className="font-semibold">- R$ {couponDiscountValue.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold text-[#54a648]">R$ {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Área de Cupom */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-800">Cupom de Desconto</p>
                      {currentCustomer && availableCoupons.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[#54a648] h-auto py-1 px-2 hover:bg-green-50"
                          onClick={() => setIsCouponsModalOpen(true)}
                        >
                          <Tag className="w-4 h-4 mr-1" />
                          Ver Meus Cupons
                        </Button>
                      )}
                    </div>
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Digite seu cupom" 
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        />
                        <Button 
                          variant="outline" 
                          onClick={handleApplyCoupon}
                          className="border-[#54a648] text-[#54a648] hover:bg-[#54a648] hover:text-white shrink-0"
                        >
                          Aplicar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200">
                        <div className="flex flex-col">
                          <span className="text-sm text-green-700 font-bold">{appliedCoupon.code}</span>
                          <span className="text-xs text-green-600">{appliedCoupon.description}</span>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700 text-sm font-medium px-2">
                          Remover
                        </button>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-[#54a648] hover:bg-[#299449] text-white py-6 text-lg font-semibold"
                  >
                    Finalizar e Gerar QR Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Modal do QR Code de Reserva */}
      <Dialog open={showQR} onOpenChange={(open) => {
        setShowQR(open);
        if (!open) navigate("/client");
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Pedido Finalizado!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 p-4">
            <p className="text-center text-gray-600 mb-2">
              Apresente este QR Code no caixa do mercado para liberar seus produtos e finalizar a compra.
            </p>
            <div className="bg-white p-4 rounded-lg border-4 border-gray-200">
              {reservationData && (
                <QRCode value={reservationData} size={200} />
              )}
            </div>
            <p className="text-xl font-bold text-[#54a648] mt-4">
              Total a Pagar: R$ {finalTotal.toFixed(2)}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Cupons da Carteira */}
      <Dialog open={isCouponsModalOpen} onOpenChange={setIsCouponsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Cupons da sua Carteira</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto pr-2">
            {availableCoupons.length === 0 ? (
              <p className="text-center text-gray-500">Nenhum cupom disponível no momento.</p>
            ) : (
              availableCoupons.map(coupon => (
                <div key={coupon.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg hover:bg-green-50 transition-colors gap-3">
                  <div>
                    <p className="font-bold text-green-700">{coupon.code}</p>
                    <p className="text-sm text-gray-600">{coupon.description}</p>
                    {coupon.minPurchase && (
                      <p className="text-xs text-gray-500 mt-1">
                        Compra mínima: R$ {coupon.minPurchase.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline"
                    className="border-[#54a648] text-[#54a648] hover:bg-[#54a648] hover:text-white w-full sm:w-auto"
                    onClick={() => {
                      applyCouponCode(coupon.code);
                      setIsCouponsModalOpen(false);
                    }}
                  >
                    Usar
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
