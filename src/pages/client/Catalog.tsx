import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Tag, User, List, Wallet, ScanBarcode, ShoppingCart, QrCode } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { Header } from "../../components/layout/Header";
import { toast } from "sonner";
import { readStoredJson, writeStoredJson } from "../../lib/storage";
import { useClientAuth } from "../../lib/clientAuth";
import { QRCode } from "react-qr-code";
import type { Product, Customer } from "../../types";

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") {
    return false;
  }

  const product = value as Partial<Product>;
  return (
    typeof product.id === "string" &&
    typeof product.name === "string" &&
    typeof product.category === "string" &&
    typeof product.price === "number"
  );
}

function isCustomer(value: unknown): value is Customer {
  if (!value || typeof value !== "object") {
    return false;
  }

  const customer = value as Partial<Customer>;
  return typeof customer.name === "string" && (typeof customer.cpf === "string" || typeof customer.cnpj === "string");
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

export default function ClientCatalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [documentInput, setDocumentInput] = useState("");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileQrOpen, setIsProfileQrOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const selectedDocType = searchParams.get("docType") === "cnpj" ? "cnpj" : "cpf";
  const [sortBy] = useState<"default" | "price-asc" | "price-desc" | "discount">("default");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const { currentCustomer, loginCustomer, logoutCustomer } = useClientAuth();

  const lastPurchase = currentCustomer && Array.isArray(currentCustomer.purchaseHistory) && currentCustomer.purchaseHistory.length > 0
    ? (currentCustomer.purchaseHistory.slice().reverse()[0] as any)
    : null;

  useEffect(() => {
    const savedProducts = readStoredJson<unknown[]>("products", []);
    const savedCustomers = readStoredJson<unknown[]>("customers", []);
    const savedCart = readStoredJson<unknown[]>("cart", []);
    const validProducts = Array.isArray(savedProducts) ? savedProducts.filter(isProduct) : [];
    const validCustomers = Array.isArray(savedCustomers) ? savedCustomers.filter(isCustomer) : [];
    const validCart = Array.isArray(savedCart) ? savedCart.filter(isCartItem) : [];

    setProducts(validProducts);
    setCustomers(validCustomers);
    setCartItems(validCart);
    setCartCount(validCart.reduce((sum, item) => sum + item.quantity, 0));
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    if (!product.available) return false;
    
    const productName = product.name.toLowerCase();
    const productDescription = (product.description || "").toLowerCase();
    const normalizedSearch = searchTerm.toLowerCase();
    const matchesSearch = productName.includes(normalizedSearch) ||
                          productDescription.includes(normalizedSearch);
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "discount":
        return (b.discount || 0) - (a.discount || 0);
      default:
        return 0;
    }
  });

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, "");
    let formatted = value;

    if (selectedDocType === "cnpj") {
      formatted = numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    } else {
      formatted = numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    }
    
    setDocumentInput(formatted);
  };

  const handleCpfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = selectedDocType === "cnpj"
      ? customers.find(c => c.cnpj === documentInput)
      : customers.find(c => c.cpf === documentInput);

    if (customer) {
      loginCustomer(customer);
      setIsLoginDialogOpen(false);
    } else {
      alert(`${selectedDocType.toUpperCase()} não encontrado no sistema`);
    }
  };

  const hasFirstPurchaseDiscount = currentCustomer
    ? currentCustomer.discount > 0 && (!currentCustomer.purchaseHistory || currentCustomer.purchaseHistory.length === 0)
    : false;

  const calculateFinalPrice = (product: Product): number => {
    if (!currentCustomer || !hasFirstPurchaseDiscount) {
      return product.price;
    }
    
    return product.price * (1 - currentCustomer.discount / 100);
  };

  const handleAddToCart = (product: Product) => {
    const finalPrice = calculateFinalPrice(product);
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    let updatedCart;
    if (existingItem) {
      updatedCart = cartItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cartItems, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: finalPrice,
      }];
    }
    
    setCartItems(updatedCart);
    setCartCount(updatedCart.reduce((sum, item) => sum + item.quantity, 0));
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="min-h-screen bg-[#FBFCF8] pt-[80px]">
      <Header 
        title="Catálogo"
        leftNode={
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#299449]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        }
        rightNode={
          <div className="flex items-center gap-2">
            {currentCustomer && (
              <span className="text-white text-sm hidden sm:inline font-medium">
                Olá, {currentCustomer.name.split(' ')[0]}!
              </span>
            )}
            <Button
              variant="secondary"
              className="bg-white hover:bg-gray-100 text-[#54a648] font-semibold"
              onClick={() => {
                if (currentCustomer) {
                  setIsProfileOpen((prev) => !prev);
                } else {
                  setIsLoginDialogOpen(true);
                }
              }}
            >
              <User className="w-4 h-4 mr-2" />
              {currentCustomer ? "Seu Perfil" : selectedDocType === "cnpj" ? "Entrar com o CNPJ" : "Entrar com CPF"}
            </Button>
            {currentCustomer && (
              <Button
                variant="outline"
                size="sm"
                className="border-white/50 text-black hover:bg-white/10"
                onClick={() => {
                  logoutCustomer();
                  setDocumentInput("");
                  setIsProfileOpen(false);
                  toast.success("Logout realizado com sucesso.");
                }}
              >
                Sair
              </Button>
            )}
          </div>
        }
      />

      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="bg-[#FBFCF8]">
          <DialogHeader>
            <DialogTitle>Identificar {selectedDocType === "cnpj" ? "CNPJ" : "CPF"}</DialogTitle>
            <DialogDescription>
              Digite seu {selectedDocType.toUpperCase()} para acessar seus descontos personalizados
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCpfSubmit} className="space-y-4">
            <div>
              <Label htmlFor="document">Digite seu {selectedDocType.toUpperCase()}</Label>
              <Input
                id="document"
                value={documentInput}
                onChange={handleDocumentChange}
                placeholder={selectedDocType === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00"}
                required
                maxLength={selectedDocType === "cnpj" ? 18 : 14}
              />
            </div>
            <Button type="submit" className="w-full bg-[#54a648] hover:bg-[#299449]">
              Confirmar
            </Button>
            <div className="border-t pt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Ainda não tem cadastro?
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#54a648] text-[#54a648] hover:bg-[#54a648] hover:text-white"
                onClick={() => navigate("/register")}
              >
                Criar Cadastro
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Informações do cliente */}
      {currentCustomer && isProfileOpen && (
        <div className="bg-[#299449] text-white px-6 py-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 lg:flex-row items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-green-100 mb-2">Seu Perfil</p>
              <h2 className="text-2xl font-semibold">{currentCustomer.name}</h2>
              <p className="text-sm text-green-100 mt-1">Acesse informações da última compra e o QR Code para retirada.</p>
            </div>
            <div className="w-full lg:w-auto bg-white/10 rounded-2xl p-4">
              {lastPurchase ? (
                <>
                  <p className="text-sm text-green-100">Última compra em</p>
                  <p className="text-lg font-semibold">{new Date(lastPurchase.date).toLocaleDateString("pt-BR")} às {new Date(lastPurchase.date).toLocaleTimeString("pt-BR")}</p>
                  <p className="text-sm text-green-100 mt-2">Total: R$ {Number(lastPurchase.total).toFixed(2)}</p>
                  <p className="text-sm text-green-100 mt-1">Itens: {Array.isArray(lastPurchase.items) ? lastPurchase.items.length : 0}</p>
                  <Dialog open={isProfileQrOpen} onOpenChange={setIsProfileQrOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-4 w-full border-black/70 text-black hover:bg-[#299449]">
                        <QrCode className="w-4 h-4 mr-2" />
                        Ver QR Code da Última Compra
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-[#FBFCF8]">
                      <DialogHeader>
                        <DialogTitle className="text-center text-2xl">QR Code da Compra</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col items-center justify-center space-y-4 p-4">
                        <p className="text-center text-gray-600 mb-2">
                          Mostre este QR Code no caixa para liberar a retirada dos seus produtos.
                        </p>
                        <div className="bg-white p-4 rounded-lg border-4 border-gray-200">
                          <QRCode value={JSON.stringify({
                            type: "RESERVATION",
                            customerId: currentCustomer.cpf || currentCustomer.cnpj,
                            customerName: currentCustomer.name,
                            date: lastPurchase.date,
                            total: Number(lastPurchase.total),
                            items: lastPurchase.items
                          })} size={200} />
                        </div>
                        <p className="text-xl font-bold text-[#54a648] mt-4">
                          Total: R$ {Number(lastPurchase.total).toFixed(2)}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <p className="text-sm text-green-100">Nenhuma compra registrada ainda.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Barra de busca e ações */}
      <div className="bg-white border-b shadow-sm sticky top-[80px] z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#FBFCF8]"
              />
            </div>
            <Link to="/client/scanner">
              <Button variant="outline" size="icon" title="Scanner" className="border-[#54a648] text-[#54a648] hover:bg-[#54a648] hover:text-white">
                <ScanBarcode className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/client/shopping-list">
              <Button variant="outline" size="icon" title="Lista de Compras" className="border-[#54a648] text-[#54a648] hover:bg-[#54a648] hover:text-white">
                <List className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/client/wallet">
              <Button variant="outline" size="icon" title="Carteira" className="border-[#54a648] text-[#54a648] hover:bg-[#54a648] hover:text-white">
                <Wallet className="w-5 h-5" />
              </Button>
            </Link>
            <button
              onClick={() => navigate("/client/checkout")}
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#54a648] text-[#54a648] hover:bg-[#54a648] hover:text-white transition-colors"
              title="Carrinho"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Filtros de categoria */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-[#54a648] hover:bg-[#299449]" : "border-[#54a648] text-[#54a648]"}
            >
              Todos
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-[#54a648] hover:bg-[#299449]" : "border-[#54a648] text-[#54a648]"}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <p className="text-gray-600">
            {filteredProducts.length} produto(s) disponível(is)
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const finalPrice = calculateFinalPrice(product);
            const hasPersonalDiscount = currentCustomer && currentCustomer.discount > 0;

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-44 sm:h-48 object-cover"
                  />
                  {product.discount && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-xs px-2 py-1">
                      {product.discount}% OFF
                    </Badge>
                  )}
                </div>
                <CardHeader className="px-4 pt-4">
                  <CardTitle className="text-lg font-semibold truncate">{product.name}</CardTitle>
                  <p className="text-sm text-gray-500 h-12 overflow-hidden">{product.description}</p>
                  <Badge variant="outline" className="w-fit text-xs mt-2">{product.category}</Badge>
                </CardHeader>
                <CardContent className="mt-auto p-4">
                  <div className="space-y-2">
                    {product.originalPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        De: R$ {product.originalPrice.toFixed(2)}
                      </p>
                    )}
                    {hasPersonalDiscount ? (
                      <>
                        <p className="text-sm text-gray-500 line-through">
                          R$ {product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-green-600">
                            R$ {finalPrice.toFixed(2)}
                          </p>
                          <Badge variant="default" className="bg-green-600 text-xs px-2 py-1">
                            Seu desconto
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {product.price.toFixed(2)}
                      </p>
                    )}
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-4 bg-[#54a648] hover:bg-[#299449] text-white"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adicionar ao Carrinho
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          </div>
        )}
      </main>
    </div>
  );
}
