import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, UserCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { toast } from "sonner";
import { isMerchantAuthenticated, loginMerchant, merchantCredentials } from "../../lib/merchantAuth";

export default function MerchantLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isMerchantAuthenticated()) {
      navigate("/merchant", { replace: true });
    }
  }, [navigate]);

  const locationState = location.state as { from?: { pathname?: string } } | null;
  const from = locationState?.from?.pathname || "/merchant";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (email.trim() === merchantCredentials.email && password === merchantCredentials.password) {
      loginMerchant();
      toast.success("Acesso ao Painel do Mercador liberado.");
      navigate(from, { replace: true });
      return;
    }

    toast.error("Credenciais inválidas. Verifique e tente novamente.");
  };

  return (
    <div className="min-h-screen bg-[#FBFCF8] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-[#54a648] font-semibold">
          <ArrowLeft className="w-4 h-4" /> Voltar para a Home
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="text-center pt-8">
            <div className="flex items-center justify-center mb-4">
              <LogoIcon size={60} />
            </div>
            <CardTitle>Login do Mercador</CardTitle>
            <CardDescription className="text-[#4b5563]">
              Acesse o painel do mercador com seu e-mail e senha de identificação.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={merchantCredentials.email}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#54a648] hover:bg-[#299449]">
                <UserCheck className="w-4 h-4 mr-2" /> Entrar
              </Button>
            </form>

            <div className="rounded-xl border border-dashed border-gray-300 p-4 bg-white">
              <p className="text-sm text-gray-600 mb-2">Use as credenciais de teste:</p>
              <p className="text-sm text-gray-700"><strong>Email:</strong> {merchantCredentials.email}</p>
              <p className="text-sm text-gray-700"><strong>Senha:</strong> {merchantCredentials.password}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Área restrita ao mercador autorizado.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
