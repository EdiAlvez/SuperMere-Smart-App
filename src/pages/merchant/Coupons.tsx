import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Tag } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { Header } from "../../components/layout/Header";
import type { Coupon } from "../../types";

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customerDocument, setCustomerDocument] = useState("");

  useEffect(() => {
    const savedCoupons = localStorage.getItem("coupons");
    if (savedCoupons) {
      setCoupons(JSON.parse(savedCoupons));
    }
  }, []);

  const saveCoupons = (updatedCoupons: Coupon[]) => {
    setCoupons(updatedCoupons);
    localStorage.setItem("coupons", JSON.stringify(updatedCoupons));
  };

  const handleCustomerDocumentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, "");
    let formatted = numbers;

    if (numbers.length > 11) {
      formatted = numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 18);
    } else {
      formatted = numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .slice(0, 14);
    }

    setCustomerDocument(formatted);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: (formData.get("code") as string).toUpperCase(),
      description: formData.get("description") as string,
      discountType: formData.get("discountType") as "percentage" | "fixed",
      discountValue: parseFloat(formData.get("discountValue") as string),
      minPurchase: formData.get("minPurchase") ? parseFloat(formData.get("minPurchase") as string) : undefined,
      validFrom: formData.get("validFrom") as string,
      validUntil: formData.get("validUntil") as string,
      usageLimit: formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : undefined,
      usedCount: 0,
      active: true,
      customerCPF: customerDocument.trim() ? customerDocument.trim() : undefined,
    };

    saveCoupons([...coupons, newCoupon]);
    setCustomerDocument("");
    setIsDialogOpen(false);
    toast.success("Cupom criado com sucesso!");
    e.currentTarget.reset();
  };

  const toggleActive = (couponId: string) => {
    const updated = coupons.map(c =>
      c.id === couponId ? { ...c, active: !c.active } : c
    );
    saveCoupons(updated);
    toast.success("Status atualizado!");
  };

  const deleteCoupon = (couponId: string) => {
    const updated = coupons.filter(c => c.id !== couponId);
    saveCoupons(updated);
    toast.success("Cupom removido!");
  };

  const activeCoupons = coupons.filter(c => c.active);
  const inactiveCoupons = coupons.filter(c => !c.active);

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px]">
      <Header 
        title="Gestão de Cupons"
        leftNode={
          <Link to="/merchant">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#299449]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        }
        rightNode={
          <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Cupom
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Cupom</DialogTitle>
                <DialogDescription>Insira os detalhes do cupom para criar um novo.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="code">Código do Cupom</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="Ex: DESCONTO10"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Ex: 10% de desconto na primeira compra"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountType">Tipo de Desconto</Label>
                    <Select name="discountType" defaultValue="percentage" required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discountValue">Valor do Desconto</Label>
                    <Input
                      id="discountValue"
                      name="discountValue"
                      type="number"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="minPurchase">Compra Mínima (opcional)</Label>
                  <Input
                    id="minPurchase"
                    name="minPurchase"
                    type="number"
                    step="0.01"
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validFrom">Válido De</Label>
                    <Input
                      id="validFrom"
                      name="validFrom"
                      type="date"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="validUntil">Válido Até</Label>
                    <Input
                      id="validUntil"
                      name="validUntil"
                      type="date"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="usageLimit">Limite de Uso (opcional)</Label>
                  <Input
                    id="usageLimit"
                    name="usageLimit"
                    type="number"
                    placeholder="Ilimitado"
                  />
                </div>
                <div>
                  <Label htmlFor="customerCPF">CPF/CNPJ específico (opcional)</Label>
                  <Input
                    id="customerCPF"
                    name="customerCPF"
                    value={customerDocument}
                    onChange={handleCustomerDocumentChange}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe em branco para cupom geral
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  Criar Cupom
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl mb-4">Cupons Ativos ({activeCoupons.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCoupons.map(coupon => (
              <Card key={coupon.id} className="h-full overflow-hidden">
                <CardContent className="h-full p-0">
                  <div className="flex h-full min-h-[238px]">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 flex w-[120px] shrink-0 items-center justify-center">
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
                    <div className="flex min-w-0 flex-1 flex-col p-4">
                      <div className="mb-2">
                        <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block mb-2 max-w-full truncate">
                          {coupon.code}
                        </p>
                        <p className="font-medium min-h-12 overflow-hidden">{coupon.description}</p>
                      </div>
                      <div className="mb-3 flex-1 space-y-1 text-sm text-gray-600">
                        <p>
                          Válido: {new Date(coupon.validFrom).toLocaleDateString("pt-BR")} -{" "}
                          {new Date(coupon.validUntil).toLocaleDateString("pt-BR")}
                        </p>
                        {coupon.minPurchase && (
                          <p>Mínimo: R$ {coupon.minPurchase.toFixed(2)}</p>
                        )}
                        {coupon.usageLimit && (
                          <p>
                            Usos: {coupon.usedCount} / {coupon.usageLimit}
                          </p>
                        )}
                        {coupon.customerCPF && (
                          <Badge variant="outline" className="text-xs">
                            CPF/CNPJ: {coupon.customerCPF}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${coupon.id}`} className="text-xs">
                            Ativo
                          </Label>
                          <Switch
                            id={`active-${coupon.id}`}
                            checked={coupon.active}
                            onCheckedChange={() => toggleActive(coupon.id)}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {activeCoupons.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Nenhum cupom ativo</p>
              </CardContent>
            </Card>
          )}
        </div>

        {inactiveCoupons.length > 0 && (
          <div>
            <h2 className="text-xl mb-4">Cupons Inativos ({inactiveCoupons.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveCoupons.map(coupon => (
                <Card key={coupon.id} className="flex h-full flex-col opacity-60">
                  <CardHeader className="flex-1">
                    <CardTitle className="truncate text-sm font-mono">{coupon.code}</CardTitle>
                    <p className="text-sm text-gray-600 min-h-12 overflow-hidden">{coupon.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Switch
                        checked={coupon.active}
                        onCheckedChange={() => toggleActive(coupon.id)}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
