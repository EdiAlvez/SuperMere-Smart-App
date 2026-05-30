import { Link, useNavigate } from "react-router-dom";
import { Store, UserPlus } from "lucide-react";
import { Button } from "../components/ui/button";
import { LogoIcon } from "../components/brand/LogoIcon";
import { LogoComplete } from "../components/brand/LogoComplete";
import { Header } from "../components/layout/Header";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden pt-[80px]">
      {/* Capa de fundo com efeito semitransparente */}
      <div className="absolute inset-0 z-0">
        <img 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
          src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1080"
        />
        <div className="absolute inset-0 bg-[rgba(244,255,252,0.4)]" />
      </div>

      {/* Header Global */}
      <Header showMerchantButton />

      {/* Estrutura principal da página */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-between px-8 md:px-16 lg:px-24 py-20 lg:py-0 gap-12">
        {/* Esquerda: logo principal e banner de boas-vindas */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 max-w-2xl">
          <div className="flex flex-col items-center lg:items-start gap-4 bg-[#FBFCF8]/95 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl border border-white/50">
            <LogoComplete className="w-auto h-auto max-w-[720px]" width={320} height={96} />
            
            <div className="mt-4 space-y-4 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#299449] tracking-tight leading-tight">
                Boas-vindas ao futuro das suas compras! 🚀
              </h1>
                            
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
                <span className="bg-[#54a648] text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md">✓ Sem Filas</span>
                <span className="bg-[#54a648] text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md">✓ Ofertas Exclusivas</span>
                <span className="bg-[#54a648] text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md">✓ Retirada Expressa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Direita: painel de acesso */}
        <div className="w-full max-w-md">
          <div className="bg-[#FBFCF8] rounded-3xl shadow-2xl p-8 relative">
            {/* Ícone no painel */}
            <div className="flex justify-center mb-6">
              <LogoIcon size={80} />
            </div>

            {/* Texto de boas-vindas */}
            <div className="text-center mb-8">
              <h2 className="text-3xl text-[#299449] font-black italic mb-2">Bem-Vindo</h2>
              <p className="text-base text-gray-800 font-semibold tracking-wide">
                Selecione uma opção para continuar
              </p>
            </div>

            {/* Opções para cliente */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-center font-semibold mb-3 italic">Sou Cliente</p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm mb-2 italic">Pessoa Física:</p>
                    <Link to="/client?docType=cpf">
                      <Button 
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                        size="lg"
                      >
                        Clique Aqui
                      </Button>
                    </Link>
                  </div>

                  <div>
                    <p className="text-sm mb-2 italic">Pessoa Jurídica:</p>
                    <Link to="/client?docType=cnpj">
                      <Button 
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                        size="lg"
                      >
                        Clique Aqui
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Link de cadastro */}
            <div className="border-t pt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Ainda não tem cadastro?
              </p>
              <Link to="/register">
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-[#54a648] text-[#54a648] hover:bg-[#54a648] hover:text-white"
                  size="lg"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Cadastro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}