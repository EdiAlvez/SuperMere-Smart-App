import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Gift, DollarSign, Tag, QrCode as QrCodeIcon, ShoppingBag } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { QRCode } from "react-qr-code";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { Header } from "../../components/layout/Header";
import { readStoredJson } from "../../lib/storage";
import type { Customer, Coupon } from "../../types";

function isCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== "object") {
    return false;
  }

  const customer = value as Partial<Customer>;
  return typeof customer.name === "string" && (typeof customer.cpf === "string" || typeof customer.cnpj === "string");
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

export default function WalletPage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tenta carregar o cliente logado da sessão atual
    const savedCustomer = readStoredJson<unknown>("currentCustomer", null, sessionStorage);
    let activeCustomer: Customer | null = null;
    if (isCustomer(savedCustomer)) {
      activeCustomer = savedCustomer;
      setCustomer(activeCustomer);
    }

    // Carrega cupons do localStorage
    const savedCoupons = readStoredJson<unknown[] | null>("coupons", null);
    if (Array.isArray(savedCoupons)) {
      const allCoupons = savedCoupons.filter(isCoupon);
      const validCoupons = allCoupons.filter(
        c =>
          c.active &&
          new Date(c.validUntil) >= new Date() &&
          (!c.customerCPF || (activeCustomer && c.customerCPF === activeCustomer.cpf))
      );
      setCoupons(validCoupons);
    } else {
      // Cupons de exemplo para preencher a carteira
      const exampleCoupons: Coupon[] = [
        {
          id: "1",
          code: "BEMVINDO10",
          description: "10% de desconto na primeira compra",
          discountType: "percentage",
          discountValue: 10,
          validFrom: "2026-03-01",
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
          validFrom: "2026-03-01",
          validUntil: "2026-03-31",
          usedCount: 0,
          active: true,
        },
      ];
      const validExampleCoupons = exampleCoupons.filter(
        c =>
          c.active &&
          new Date(c.validUntil) >= new Date() &&
          (!c.customerCPF || (activeCustomer && c.customerCPF === activeCustomer.cpf))
      );
      setCoupons(validExampleCoupons);
      localStorage.setItem("coupons", JSON.stringify(exampleCoupons));
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <Wallet className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Carteira Indisponível</h2>
        <p className="text-gray-600 mb-6">Você precisa fazer login para acessar sua carteira digital.</p>
        <Button onClick={() => navigate("/client")}>
          Ir para o Catálogo e Fazer Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px]">
      <Header 
        title="Minha Carteira"
        leftNode={
          <Link to="/client">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#299449]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="card" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1 gap-1">
            <TabsTrigger value="card">Cartão</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="points">Pontos</TabsTrigger>
            <TabsTrigger value="cashback">Cashback</TabsTrigger>
          </TabsList>

          {/* Cartão digital */}
          <TabsContent value="card" className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">SuperApp Mercado</p>
                    <h2 className="text-2xl">{customer.name}</h2>
                  </div>
                  <Wallet className="w-8 h-8" />
                </div>

                <div className="space-y-2 mb-8">
                  <p className="text-blue-100 text-sm">
                    {customer.cpf ? "CPF" : "CNPJ"}
                  </p>
                  <p className="text-xl font-mono">{customer.cpf || customer.cnpj}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Desconto Exclusivo</p>
                    <p className="text-2xl">{customer.discount}%</p>
                  </div>
                  {customer.verified && (
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      Verificado
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code para o Caixa</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg border-4 border-gray-200">
                  <QRCode
                    value={JSON.stringify({
                    documentId: customer.cpf || customer.cnpj || "",
                      name: customer.name,
                    discount: customer.discount || 0,
                    })}
                    size={200}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Mostre este QR Code no caixa para aplicar seus descontos automaticamente
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Como usar:</strong> Na hora do pagamento, mostre este QR Code para
                  o caixa escanear e aplicar automaticamente seu desconto de {customer.discount}%
                  e utilizar cupons disponíveis.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lista de cupons */}
          <TabsContent value="coupons" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">{coupons.length} cupons disponíveis</p>
            </div>

            {coupons.map(coupon => (
              <Card key={coupon.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 flex items-center justify-center min-w-[120px]">
                      <div className="text-center">
                        <Tag className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-2xl">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `R$ ${coupon.discountValue}`}
                        </p>
                        <p className="text-xs">OFF</p>
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block mb-2">
                            {coupon.code}
                          </p>
                          <p className="font-medium">{coupon.description}</p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <QrCodeIcon className="w-4 h-4 mr-2" />
                              Ver QR Code
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Cupom: {coupon.code}</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center gap-4">
                              <QRCode value={coupon.code} size={200} />
                              <p className="text-sm text-gray-600 text-center">
                                {coupon.description}
                              </p>
                              {coupon.minPurchase && (
                                <Badge variant="outline">
                                  Válido para compras acima de R$ {coupon.minPurchase.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Válido até {new Date(coupon.validUntil).toLocaleDateString("pt-BR")}
                        </span>
                        {coupon.minPurchase && (
                          <span>Mínimo: R$ {coupon.minPurchase.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {coupons.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Nenhum cupom disponível no momento</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Histórico de Compras e QR Code */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">Suas reservas e compras recentes</p>
            </div>
            
            {(!customer.purchaseHistory || customer.purchaseHistory.length === 0) ? (
              <Card>
                <CardContent className="p-12 text-center flex flex-col items-center">
                  <ShoppingBag className="w-12 h-12 mb-4 text-gray-400" />
                  <p className="text-gray-500">Nenhuma compra ou reserva encontrada no momento.</p>
                </CardContent>
              </Card>
            ) : (
              customer.purchaseHistory.slice().reverse().map((purchase: any, index: number) => {
                const reservation = {
                  type: "RESERVATION",
                  customerId: customer.cpf || customer.cnpj,
                  customerName: customer.name,
                  date: purchase.date,
                  total: purchase.total,
                  items: purchase.items
                };
                
                return (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b pb-4 pt-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <CardTitle className="text-base sm:text-lg">
                          {new Date(purchase.date).toLocaleDateString("pt-BR")} às {new Date(purchase.date).toLocaleTimeString("pt-BR")}
                        </CardTitle>
                        <span className="font-bold text-[#54a648] text-lg">R$ {purchase.total.toFixed(2)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 w-full">
                        <p className="text-sm font-semibold text-gray-600 mb-2">Itens:</p>
                        <ul className="text-sm space-y-1 text-gray-600 max-h-32 overflow-y-auto pr-2">
                          {purchase.items && purchase.items.map((item: any, i: number) => (
                            <li key={i} className="flex justify-between border-b pb-1">
                              <span>{item.quantity}x {item.productName}</span>
                              <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto border-[#54a648] text-[#54a648] hover:bg-[#54a648] hover:text-white shrink-0">
                            <QrCodeIcon className="w-4 h-4 mr-2" />
                            Ver QR Code
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-center text-2xl">QR Code da Compra</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center justify-center space-y-4 p-4">
                            <p className="text-center text-gray-600 mb-2">
                              Apresente este QR Code no caixa para liberar seus produtos.
                            </p>
                            <div className="bg-white p-4 rounded-lg border-4 border-gray-200">
                              <QRCode value={JSON.stringify(reservation)} size={200} />
                            </div>
                            <p className="text-xl font-bold text-[#54a648] mt-4">
                              Total a Pagar: R$ {purchase.total.toFixed(2)}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Informações de pontos */}
          <TabsContent value="points" className="space-y-6">
            <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm mb-2">Pontos Acumulados</p>
                    <p className="text-5xl mb-1">{(customer.points || 0).toLocaleString("pt-BR")}</p>
                    <p className="text-sm text-yellow-100">
                      = R$ {((customer.points || 0) / 100).toFixed(2)} em descontos
                    </p>
                  </div>
                  <Gift className="w-16 h-16 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Como Funcionam os Pontos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <span className="text-xl">🛒</span>
                  </div>
                  <div>
                    <p className="font-medium">Ganhe Pontos</p>
                    <p className="text-sm text-gray-600">
                      Cada R$ 1,00 em compras = 1 ponto
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <p className="font-medium">Troque por Descontos</p>
                    <p className="text-sm text-gray-600">
                      100 pontos = R$ 1,00 de desconto na próxima compra
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-2">
                    <span className="text-xl">⭐</span>
                  </div>
                  <div>
                    <p className="font-medium">Promoções Especiais</p>
                    <p className="text-sm text-gray-600">
                      Em datas especiais, ganhe pontos em dobro
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cashback */}
          <TabsContent value="cashback" className="space-y-6">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-2">Cashback Disponível</p>
                    <p className="text-5xl mb-1">
                      R$ {(customer.cashback || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-green-100">
                      Pronto para usar na próxima compra
                    </p>
                  </div>
                  <DollarSign className="w-16 h-16 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Como Funciona o Cashback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <span className="text-xl">🛍️</span>
                  </div>
                  <div>
                    <p className="font-medium">Compre e Ganhe</p>
                    <p className="text-sm text-gray-600">
                      Receba até 5% de cashback em produtos selecionados
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <span className="text-xl">💸</span>
                  </div>
                  <div>
                    <p className="font-medium">Use Como Quiser</p>
                    <p className="text-sm text-gray-600">
                      Cashback é dinheiro de verdade para suas próximas compras
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-2">
                    <span className="text-xl">⏰</span>
                  </div>
                  <div>
                    <p className="font-medium">Sem Prazo de Validade</p>
                    <p className="text-sm text-gray-600">
                      Seu cashback não expira, use quando quiser
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg">
              Usar Cashback na Próxima Compra
            </Button>
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
  );
}
