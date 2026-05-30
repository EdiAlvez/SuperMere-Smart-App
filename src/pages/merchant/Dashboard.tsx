import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowLeft, Users, BarChart3, Tag as TagIcon, ScanBarcode } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { Header } from "../../components/layout/Header";
import type { Product, Customer } from "../../types";
import { logoutMerchant, getMerchantUser } from "../../lib/merchantAuth";

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const merchantUser = getMerchantUser();
  const displayMerchantName = merchantUser
    ? (merchantUser.name && merchantUser.name.includes("Mercador") ? "SuperMere Smart" : merchantUser.name)
    : "SuperMere Smart";
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "customers">("products");

  const getCustomerDocument = (customer: Customer) => customer.cpf ?? customer.cnpj ?? "";

  // Carrega produtos e clientes do localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    const savedCustomers = localStorage.getItem("customers");
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Produtos iniciais para começar
      const initialProducts: Product[] = [
        {
          id: "1",
          name: "Arroz Branco 5kg",
          category: "Grãos",
          price: 25.90,
          originalPrice: 29.90,
          available: true,
          image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
          description: "Arroz tipo 1, grãos longos",
          discount: 13,
          barcode: "7891234567890",
          brand: "Marca Premium",
          stock: 150
        },
        {
          id: "2",
          name: "Feijão Preto 1kg",
          category: "Grãos",
          price: 8.50,
          available: true,
          image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400",
          description: "Feijão preto selecionado",
          barcode: "7891234567891",
          brand: "Grãos Nobres",
          stock: 200
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
          stock: 300
        }
      ];
      setProducts(initialProducts);
      localStorage.setItem("products", JSON.stringify(initialProducts));
    }

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    }
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
  };

  const saveCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers);
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
  };

  const handleProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const product: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      price: parseFloat(formData.get("price") as string),
      originalPrice: formData.get("originalPrice") ? parseFloat(formData.get("originalPrice") as string) : undefined,
      available: editingProduct?.available ?? true,
      image: formData.get("image") as string,
      description: formData.get("description") as string,
      barcode: formData.get("barcode") as string,
      brand: formData.get("brand") as string,
      stock: parseInt(formData.get("stock") as string)
    };

    if (product.originalPrice && product.originalPrice > product.price) {
      product.discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }

    if (editingProduct) {
      const updated = products.map(p => p.id === editingProduct.id ? product : p);
      saveProducts(updated);
      toast.success("Produto atualizado com sucesso!");
    } else {
      saveProducts([...products, product]);
      toast.success("Produto adicionado com sucesso!");
    }

    setIsProductDialogOpen(false);
    setEditingProduct(null);
    e.currentTarget.reset();
  };

  const handleCustomerSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const enteredName = (formData.get("name") as string).trim();
    const customer: Customer = {
      cpf: formData.get("cpf") as string,
      name: enteredName || editingCustomer?.name || "",
      discount: parseFloat(formData.get("discount") as string),
      points: editingCustomer?.points ?? 0,
      cashback: editingCustomer?.cashback ?? 0,
      verified: true,
    };

    const customerDocument = getCustomerDocument(customer);
    const originalDocument = editingCustomer ? getCustomerDocument(editingCustomer) : "";
    const duplicate = customers.find(
      c => getCustomerDocument(c) === customerDocument && getCustomerDocument(c) !== originalDocument
    );

    if (duplicate) {
      toast.error("Já existe outro cliente com este CPF/CNPJ.");
      return;
    }

    if (editingCustomer) {
      const updated = customers.map(c =>
        getCustomerDocument(c) === originalDocument ? customer : c
      );
      saveCustomers(updated);
      toast.success("Cliente atualizado com sucesso!");
    } else {
      saveCustomers([...customers, customer]);
      toast.success("Cliente cadastrado com sucesso!");
    }

    setIsCustomerDialogOpen(false);
    e.currentTarget.reset();
  };

  const toggleAvailability = (productId: string) => {
    const updated = products.map(p =>
      p.id === productId ? { ...p, available: !p.available } : p
    );
    saveProducts(updated);
    toast.success("Disponibilidade atualizada!");
  };

  const deleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    saveProducts(updated);
    toast.success("Produto removido!");
  };

  const deleteCustomer = (docNumber: string) => {
    const updated = customers.filter(
      c => c.cpf !== docNumber && c.cnpj !== docNumber
    );
    saveCustomers(updated);
    toast.success("Cliente removido!");
  };

  const handleMerchantLogout = () => {
    logoutMerchant();
    toast.success("Desconectado do Painel do Mercador.");
    navigate("/merchant/login");
  };

  const renderCustomerCard = (customer: Customer) => {
    const customerDocument = customer.cpf ?? customer.cnpj ?? "";
    return (
      <Card key={customerDocument}>
        <CardHeader>
          <CardTitle className="text-lg">{customer.name}</CardTitle>
          <p className="text-sm text-gray-500">{customerDocument}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm">Desconto:</span>
            <Badge variant="default" className="text-lg">
              {customer.discount}%
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setEditingCustomer(customer);
                setIsCustomerDialogOpen(true);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => deleteCustomer(customerDocument)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px]">
      <Header 
        leftNode={
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#299449]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        }
        rightNode={
          <>
            <span className="text-white text-lg font-semibold whitespace-nowrap mr-2">
              Painel do Mercador
            </span>
            <Link to="/merchant/scanner">
              <Button variant="outline">
                <ScanBarcode className="w-4 h-4 mr-2" />
                Caixa
              </Button>
            </Link>
            <Link to="/merchant/reports">
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </Link>
            <Link to="/merchant/coupons">
              <Button variant="outline">
                <TagIcon className="w-4 h-4 mr-2" />
                Cupons
              </Button>
            </Link>
            {merchantUser && (
              <>
                <span className="text-white hidden sm:inline">{displayMerchantName}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMerchantLogout}
                  className="text-black border-white/30 hover:bg-white/10"
                >
                  Sair
                </Button>
              </>
            )}
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
          >
            Produtos
          </Button>
          <Button
            variant={activeTab === "customers" ? "default" : "outline"}
            onClick={() => setActiveTab("customers")}
          >
            <Users className="w-4 h-4 mr-2" />
            Clientes
          </Button>
        </div>

        {activeTab === "products" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600">{products.length} produtos cadastrados</p>
              </div>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingProduct(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct ? "Faça as alterações necessárias no produto." : "Preencha os campos para adicionar um novo produto."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Produto</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingProduct?.name}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        name="category"
                        defaultValue={editingProduct?.category}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Preço (R$)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={editingProduct?.price}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">Preço Original (opcional)</Label>
                        <Input
                          id="originalPrice"
                          name="originalPrice"
                          type="number"
                          step="0.01"
                          defaultValue={editingProduct?.originalPrice}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        name="description"
                        defaultValue={editingProduct?.description}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">URL da Imagem</Label>
                      <Input
                        id="image"
                        name="image"
                        type="url"
                        defaultValue={editingProduct?.image}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="barcode">Código de Barras</Label>
                      <Input
                        id="barcode"
                        name="barcode"
                        defaultValue={editingProduct?.barcode}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Marca</Label>
                      <Input
                        id="brand"
                        name="brand"
                        defaultValue={editingProduct?.brand}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Estoque</Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        step="1"
                        defaultValue={editingProduct?.stock}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {editingProduct ? "Salvar Alterações" : "Adicionar Produto"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-44 sm:h-48 object-cover rounded-md"
                      />
                      {product.discount && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-xs px-2 py-1">
                          {product.discount}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="px-4 pt-4">
                      <CardTitle className="text-lg font-semibold truncate">{product.name}</CardTitle>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      {product.description && (
                        <p className="text-sm text-gray-500 h-12 overflow-hidden mt-2">{product.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="mt-auto p-4">
                      <div className="mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">R$ {product.price.toFixed(2)}</span>
                          {product.originalPrice && (
                            <>
                              <span className="text-sm text-gray-400 line-through">
                                R$ {product.originalPrice.toFixed(2)}
                              </span>
                              <Badge variant="secondary" className="text-xs px-2 py-1">{product.discount}% OFF</Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <Label htmlFor={`available-${product.id}`}>Disponível</Label>
                        <Switch
                          id={`available-${product.id}`}
                          checked={product.available}
                          onCheckedChange={() => toggleAvailability(product.id)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsProductDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </>
        )}

        {activeTab === "customers" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600">{customers.length} clientes cadastrados</p>
              </div>
              <Dialog
                open={isCustomerDialogOpen}
                onOpenChange={(open) => {
                  setIsCustomerDialogOpen(open);
                  if (!open) setEditingCustomer(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingCustomer(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCustomer ? "Editar Cliente" : "Cadastrar Cliente"}</DialogTitle>
                    <DialogDescription>
                      {editingCustomer
                        ? "Atualize os dados do cliente existente."
                        : "Preencha os campos para cadastrar um novo cliente."}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="cpf">CPF/CNPJ</Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        placeholder="000.000.000-00"
                        defaultValue={editingCustomer ? getCustomerDocument(editingCustomer) : ""}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue=""
                        placeholder={editingCustomer?.name || "Nome do cliente"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount">Desconto Personalizado (%)</Label>
                      <Input
                        id="discount"
                        name="discount"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        defaultValue={editingCustomer ? editingCustomer.discount.toString() : "0"}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      {editingCustomer ? "Salvar Alterações" : "Cadastrar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map(renderCustomerCard)}
            </div>
          </>
        )}
      </main>
    </div>
  );
}