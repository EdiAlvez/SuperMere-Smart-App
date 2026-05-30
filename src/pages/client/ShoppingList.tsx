import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Bell, BellOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { Header } from "../../components/layout/Header";
import type { ShoppingList, ShoppingListItem, Product } from "../../types";

export default function ShoppingListPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const savedLists = localStorage.getItem("shoppingLists");
    const savedProducts = localStorage.getItem("products");
    
    if (savedLists) {
      const parsedLists = JSON.parse(savedLists);
      setLists(parsedLists);
      if (parsedLists.length > 0) {
        setActiveListId(parsedLists[0].id);
      }
    }

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const saveLists = (updatedLists: ShoppingList[]) => {
    setLists(updatedLists);
    localStorage.setItem("shoppingLists", JSON.stringify(updatedLists));
  };

  const activeList = lists.find(list => list.id === activeListId);

  const handleCreateList = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newList: ShoppingList = {
      id: Date.now().toString(),
      customerId: "current-user",
      name: formData.get("name") as string,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...lists, newList];
    saveLists(updated);
    setActiveListId(newList.id);
    setIsNewListDialogOpen(false);
    toast.success("Lista criada com sucesso!");
    e.currentTarget.reset();
  };

  const handleAddItem = (product: Product) => {
    if (!activeList) return;

    const existingItem = activeList.items.find(item => item.productId === product.id);
    
    if (existingItem) {
      toast.info("Produto já está na lista");
      return;
    }

    const newItem: ShoppingListItem = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      checked: false,
      notifyOnPromo: true,
    };

    const updatedLists = lists.map(list =>
      list.id === activeListId
        ? { ...list, items: [...list.items, newItem], updatedAt: new Date().toISOString() }
        : list
    );

    saveLists(updatedLists);
    setIsAddItemDialogOpen(false);
    toast.success("Produto adicionado!");
  };

  const toggleItemCheck = (itemIndex: number) => {
    if (!activeList) return;

    const updatedLists = lists.map(list =>
      list.id === activeListId
        ? {
            ...list,
            items: list.items.map((item, idx) =>
              idx === itemIndex ? { ...item, checked: !item.checked } : item
            ),
            updatedAt: new Date().toISOString(),
          }
        : list
    );

    saveLists(updatedLists);
  };

  const toggleNotification = (itemIndex: number) => {
    if (!activeList) return;

    const updatedLists = lists.map(list =>
      list.id === activeListId
        ? {
            ...list,
            items: list.items.map((item, idx) =>
              idx === itemIndex ? { ...item, notifyOnPromo: !item.notifyOnPromo } : item
            ),
          }
        : list
    );

    saveLists(updatedLists);
    toast.success("Notificação atualizada!");
  };

  const updateQuantity = (itemIndex: number, quantity: number) => {
    if (!activeList || quantity < 1) return;

    const updatedLists = lists.map(list =>
      list.id === activeListId
        ? {
            ...list,
            items: list.items.map((item, idx) =>
              idx === itemIndex ? { ...item, quantity } : item
            ),
            updatedAt: new Date().toISOString(),
          }
        : list
    );

    saveLists(updatedLists);
  };

  const removeItem = (itemIndex: number) => {
    if (!activeList) return;

    const updatedLists = lists.map(list =>
      list.id === activeListId
        ? {
            ...list,
            items: list.items.filter((_, idx) => idx !== itemIndex),
            updatedAt: new Date().toISOString(),
          }
        : list
    );

    saveLists(updatedLists);
    toast.success("Produto removido!");
  };

  const deleteList = (listId: string) => {
    const updated = lists.filter(list => list.id !== listId);
    saveLists(updated);
    if (activeListId === listId) {
      setActiveListId(updated.length > 0 ? updated[0].id : null);
    }
    toast.success("Lista excluída!");
  };

  const calculateTotal = () => {
    if (!activeList) return 0;
    
    return activeList.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px]">
      <Header 
        title="Minhas Listas"
        leftNode={
          <Link to="/client">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#299449]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        }
        rightNode={
          <>
            <Dialog open={isNewListDialogOpen} onOpenChange={setIsNewListDialogOpen}>
              <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Lista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Lista</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateList} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Lista</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Compras da Semana"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Criar Lista
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar com listas */}
          <div className="lg:col-span-1">
            <h2 className="text-lg mb-4">Suas Listas</h2>
            <div className="space-y-2">
              {lists.map(list => (
                <Card
                  key={list.id}
                  className={`cursor-pointer transition-colors ${
                    activeListId === list.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setActiveListId(list.id)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{list.name}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {list.items.length} itens
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteList(list.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              {lists.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma lista criada
                </p>
              )}
            </div>
          </div>

          {/* Lista ativa */}
          <div className="lg:col-span-2">
            {activeList ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl">{activeList.name}</h2>
                    <p className="text-gray-500">
                      {activeList.items.filter(i => i.checked).length} de {activeList.items.length} itens marcados
                    </p>
                  </div>
                  <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Adicionar Produto</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Buscar produto..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="grid gap-2">
                          {filteredProducts.map(product => (
                            <Card
                              key={product.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleAddItem(product)}
                            >
                              <CardContent className="p-4 flex items-center gap-4">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-gray-500">{product.category}</p>
                                  <p className="text-lg text-green-600">
                                    R$ {product.price.toFixed(2)}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">Total Estimado:</span>
                      <span className="text-2xl text-green-600">
                        R$ {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  {activeList.items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const itemTotal = product ? product.price * item.quantity : 0;

                    return (
                      <Card key={index} className={item.checked ? 'opacity-60' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={() => toggleItemCheck(index)}
                            />
                            {product && (
                              <img
                                src={product.image}
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className={`font-medium ${item.checked ? 'line-through' : ''}`}>
                                {item.productName}
                              </p>
                              {product && (
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-gray-600">
                                    R$ {product.price.toFixed(2)} × {item.quantity} = R$ {itemTotal.toFixed(2)}
                                  </p>
                                  {product.discount && (
                                    <Badge variant="secondary">
                                      {product.discount}% OFF
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleNotification(index)}
                              title={item.notifyOnPromo ? "Notificar em promoção" : "Não notificar"}
                            >
                              {item.notifyOnPromo ? (
                                <Bell className="w-4 h-4 text-primary" />
                              ) : (
                                <BellOff className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {activeList.items.length === 0 && (
                    <p className="text-gray-500 text-center py-12">
                      Lista vazia. Adicione produtos para começar!
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Selecione ou crie uma lista</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
