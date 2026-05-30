import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Users, Package, Award } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { Header } from "../../components/layout/Header";
import { readStoredJson } from "../../lib/storage";
import type { Product, Customer, Purchase } from "../../types";

export default function Reports() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const savedProducts = readStoredJson<Product[]>("products", []);
    const savedCustomers = readStoredJson<Customer[]>("customers", []);
    const savedPurchases = readStoredJson<Purchase[]>("purchases", []);

    setProducts(savedProducts);
    setCustomers(savedCustomers);

    if (savedPurchases.length > 0) {
      setPurchases(savedPurchases);
    } else {
      // Vendas simuladas para relatório
      const examplePurchases: Purchase[] = [
        {
          id: "1",
          customerId: "123.456.789-00",
          storeId: "store1",
          date: "2026-03-05",
          items: [],
          subtotal: 250.00,
          discounts: 25.00,
          total: 225.00,
          pointsEarned: 225,
          cashbackEarned: 11.25,
        },
        {
          id: "2",
          customerId: "987.654.321-00",
          storeId: "store1",
          date: "2026-03-06",
          items: [],
          subtotal: 180.00,
          discounts: 18.00,
          total: 162.00,
          pointsEarned: 162,
          cashbackEarned: 8.10,
        },
      ];
      setPurchases(examplePurchases);
      localStorage.setItem("purchases", JSON.stringify(examplePurchases));
    }
  }, []);

  // Calcula os indicadores principais
  const totalRevenue = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalDiscounts = purchases.reduce((sum, p) => sum + p.discounts, 0);
  const averageTicket = purchases.length > 0 ? totalRevenue / purchases.length : 0;

  // Produtos mais vendidos (simulado por ratings)
  const topProducts = [...products]
    .sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))
    .slice(0, 5);

  // Distribuição por categorias
  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: product.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Vendas dos últimos 7 dias
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayPurchases = purchases.filter(p => p.date === dateStr);
    const total = dayPurchases.reduce((sum, p) => sum + p.total, 0);
    
    return {
      date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      vendas: total,
    };
  });

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px]">
      <Header 
        title="Relatórios e Analytics"
        leftNode={
          <Link to="/merchant">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#299449]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Cards de Resumo */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Faturamento Total</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                R$ {totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {purchases.length} vendas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Ticket Médio</CardTitle>
              <Package className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                R$ {averageTicket.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Por compra
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Clientes Ativos</CardTitle>
              <Users className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                {customers.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Descontos Dados</CardTitle>
              <Award className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">
                R$ {totalDiscounts.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Em promoções
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          {/* Vendas */}
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="vendas"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Vendas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimas Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchases.slice(0, 10).map(purchase => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">Venda #{purchase.id}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(purchase.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          R$ {purchase.total.toFixed(2)}
                        </p>
                        {purchase.discounts > 0 && (
                          <p className="text-sm text-gray-500">
                            Desconto: R$ {purchase.discounts.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Produtos */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Produtos Mais Vistos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {product.price.toFixed(2)}</p>
                        {product.totalRatings && (
                          <p className="text-sm text-gray-500">
                            ⭐ {product.averageRating?.toFixed(1)} ({product.totalRatings})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos com Desconto</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl mb-2">
                    {products.filter(p => p.discount).length}
                  </p>
                  <p className="text-sm text-gray-500">
                    de {products.length} produtos totais
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Produtos Indisponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl mb-2">
                    {products.filter(p => !p.available).length}
                  </p>
                  <p className="text-sm text-gray-500">
                    Atualize o estoque
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clientes Mais Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers.slice(0, 10).map(customer => {
                    const customerDocument = customer.cpf ?? customer.cnpj ?? "";
                    const customerPurchases = purchases.filter(
                      p => p.customerId === customerDocument
                    );
                    const totalSpent = customerPurchases.reduce(
                      (sum, p) => sum + p.total,
                      0
                    );

                    return (
                      <div
                        key={customerDocument}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium truncate max-w-[220px]">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customerDocument}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            R$ {totalSpent.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customerPurchases.length} compras
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pontos Distribuídos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl mb-2">
                    {customers.reduce((sum, c) => sum + c.points, 0).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total de pontos acumulados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cashback Distribuído</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl mb-2">
                    R$ {customers.reduce((sum, c) => sum + c.cashback, 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Disponível para clientes
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categorias */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Produtos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
