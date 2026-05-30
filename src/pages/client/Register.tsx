import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, UserPlus, CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { Header } from "../../components/layout/Header";
import { toast } from "sonner";
import type { Customer } from "../../types";

export default function ClientRegister() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjError, setCnpjError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    documentType: "cpf" as "cpf" | "cnpj",
    documentNumber: "",
    name: "",
    email: "",
    phone: "",
    inscricaoEstadual: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{3})\d+?$/, "$1");
  };

  const handleDocumentTypeChange = (documentType: "cpf" | "cnpj") => {
    setFormData(prev => ({
      ...prev,
      documentType,
      documentNumber: "",
      name: "",
      email: "",
      phone: "",
      inscricaoEstadual: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    }));
    setCnpjError(null);
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const searchCnpj = async (cnpj: string) => {
    setCnpjLoading(true);
    setCnpjError(null);

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!response.ok) {
        throw new Error("CNPJ não encontrado");
      }

      const data = await response.json();
      if (!data || data.erro) {
        throw new Error("CNPJ não encontrado");
      }

      const addressParts = [data.logradouro, data.numero, data.complemento, data.bairro]
        .filter(Boolean)
        .join(", ");
      const formattedCep = data.cep ? data.cep.replace(/(\d{5})(\d{3})/, "$1-$2") : "";

      setFormData(prev => ({
        ...prev,
        name: data.razao_social || prev.name,
        inscricaoEstadual: data.inscricao_estadual || "",
        address: addressParts || prev.address,
        city: data.municipio || prev.city,
        state: data.uf || prev.state,
        zipCode: formattedCep || prev.zipCode,
      }));
      toast.success("Dados do CNPJ preenchidos automaticamente.");
    } catch {
      setCnpjError("Não foi possível consultar o CNPJ.");
      toast.error("Erro ao buscar CNPJ. Preencha os dados manualmente.");
    } finally {
      setCnpjLoading(false);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formData.documentType === "cnpj"
      ? formatCNPJ(e.target.value)
      : formatCPF(e.target.value);

    setFormData(prev => ({ ...prev, documentNumber: formatted }));

    if (formData.documentType === "cnpj") {
      const digits = formatted.replace(/\D/g, "");
      if (digits.length === 14) {
        searchCnpj(digits);
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value);
    const zipNumbers = formatted.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, zipCode: formatted }));
    setZipError(null);

    if (zipNumbers.length === 8) {
      setZipLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipNumbers}/json/`);
        if (!response.ok) {
          throw new Error("Erro na consulta do CEP");
        }

        const data = await response.json();
        if (data.erro) {
          setZipError("CEP não encontrado");
          setFormData(prev => ({ ...prev, address: "", city: "", state: "" }));
          toast.error("CEP não encontrado. Preencha o endereço manualmente.");
        } else {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }));
          toast.success("Endereço preenchido automaticamente.");
        }
      } catch {
        setZipError("Não foi possível consultar o CEP neste momento.");
        toast.error("Erro ao buscar o CEP. Tente novamente em instantes.");
      } finally {
        setZipLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const existingCustomers = JSON.parse(localStorage.getItem("customers") || "[]");
    const documentExists = formData.documentType === "cnpj"
      ? existingCustomers.find((c: Customer) => c.cnpj === formData.documentNumber)
      : existingCustomers.find((c: Customer) => c.cpf === formData.documentNumber);

    if (documentExists) {
      alert(`Este ${formData.documentType.toUpperCase()} já está cadastrado no sistema!`);
      return;
    }

    const newCustomer: Customer = {
      ...(formData.documentType === "cpf" ? { cpf: formData.documentNumber } : { cnpj: formData.documentNumber }),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      inscricaoEstadual: formData.documentType === "cnpj" ? formData.inscricaoEstadual : undefined,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      discount: 5, // Desconto de primeira compra
      points: 0,
      cashback: 0,
      verified: false,
      purchaseHistory: [],
      favoriteProducts: [],
    };

    // Salva o novo cliente no localStorage
    const updatedCustomers = [...existingCustomers, newCustomer];
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));

    // Exibe a tela de confirmação
    setIsSuccess(true);

    // Redireciona para o catálogo após alguns segundos
    setTimeout(() => {
      navigate("/client");
    }, 3000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#FBFCF8]">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-4">
              <LogoIcon size={80} />
            </div>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl mb-3">Cadastro Realizado!</h2>
            <p className="text-gray-600 mb-4">
              Bem-vindo(a), <strong>{formData.name}</strong>!
            </p>
            <p className="text-gray-600 mb-6">
              Você ganhou <strong>5% de desconto</strong> na primeira compra! 🎉
            </p>
            <p className="text-sm text-gray-500">
              Redirecionando para o catálogo...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFCF8] pt-[80px]">
      <Header 
        title="Cadastro"
        leftNode={
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#299449]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        }
      />

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto">
        <Card className="bg-[#FBFCF8]">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Criar Cadastro</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta e começar a aproveitar ofertas exclusivas!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Dados Pessoais</h3>
                
                <div className="grid gap-4">
                  <div>
                    <div className="flex gap-4 mb-3">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="documentType"
                          value="cpf"
                          checked={formData.documentType === "cpf"}
                          onChange={() => handleDocumentTypeChange("cpf")}
                          className="accent-[#54a648]"
                        />
                        Pessoa Física (CPF)
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="documentType"
                          value="cnpj"
                          checked={formData.documentType === "cnpj"}
                          onChange={() => handleDocumentTypeChange("cnpj")}
                          className="accent-[#54a648]"
                        />
                        Pessoa Jurídica (CNPJ)
                      </label>
                    </div>
                    <Label htmlFor="documentNumber">
                      {formData.documentType === "cnpj" ? "CNPJ" : "CPF"} *
                    </Label>
                    <Input
                      id="documentNumber"
                      name="documentNumber"
                      value={formData.documentNumber}
                      onChange={handleDocumentChange}
                      placeholder={formData.documentType === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00"}
                      required
                      maxLength={formData.documentType === "cnpj" ? 18 : 14}
                    />
                    {cnpjLoading && (
                      <p className="text-xs text-blue-600 mt-2">Buscando dados do CNPJ...</p>
                    )}
                    {cnpjError && (
                      <p className="text-xs text-red-600 mt-2">{cnpjError}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="name">
                      {formData.documentType === "cnpj" ? "Razão Social" : "Nome Completo"} *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={formData.documentType === "cnpj" ? "Digite a razão social" : "Digite seu nome completo"}
                      required
                    />
                  </div>

                  {formData.documentType === "cnpj" && (
                    <div>
                      <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                      <Input
                        id="inscricaoEstadual"
                        name="inscricaoEstadual"
                        value={formData.inscricaoEstadual}
                        onChange={handleChange}
                        placeholder="Inscrição Estadual"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000"
                      required
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Endereço</h3>
                
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="zipCode">CEP *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleZipCodeChange}
                      placeholder="00000-000"
                      required
                      maxLength={9}
                    />
                    {zipLoading && (
                      <p className="text-xs text-blue-600 mt-2">Buscando endereço...</p>
                    )}
                    {zipError && (
                      <p className="text-xs text-red-600 mt-2">{zipError}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Rua, número, complemento"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Sua cidade"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="UF"
                        required
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefícios */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">🎁 Benefícios do Cadastro</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ 5% de desconto na primeira compra!</li>
                  <li>✓ Acesso a ofertas exclusivas</li>
                  <li>✓ Acúmulo de pontos e cashback</li>
                  <li>✓ Notificações de promoções personalizadas</li>
                </ul>
              </div>

              {/* Botões */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/")}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Criar Cadastro
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Ao criar sua conta, você concorda com nossos termos de uso e política de privacidade.
              </p>
            </form>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
