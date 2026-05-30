import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { Button } from "../ui/button";
import { LogoIcon } from "../brand/LogoIcon";

interface HeaderProps {
  title?: string;
  leftNode?: ReactNode;
  rightNode?: ReactNode;
  showMerchantButton?: boolean;
}

export function Header({ title, leftNode, rightNode, showMerchantButton = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-[80px] bg-[#54a648] z-50 shadow-md">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between relative">
        
        {/* Lado esquerdo: Ações (Voltar) + Logo Responsiva */}
        <div className="flex items-center gap-2 sm:gap-4 relative z-10 flex-shrink-0">
          {leftNode}
          <Link
            to="/"
            className="flex items-center flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-md"
            aria-label="Ir para página inicial"
          >
            <span className="bg-[#f9fafb] p-1 rounded shadow-sm flex items-center justify-center">
              <LogoIcon size={40} />
            </span>
          </Link>
        </div>

        {/* Centro: Título da Página */}
        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg md:text-2xl text-white font-semibold whitespace-nowrap pointer-events-none">
            {title}
          </h1>
        )}

        {/* Lado direito: Ações Dinâmicas */}
        <nav className="flex items-center gap-2 relative z-10 flex-shrink-0">
          {rightNode}
          
          {showMerchantButton && (
            <Button
              type="button"
              variant="secondary"
              className="inline-flex items-center justify-center gap-2 rounded-md px-3 sm:px-4 py-2 text-sm font-semibold text-[#54a648] bg-white hover:bg-gray-100 shadow-md transition-colors duration-150 whitespace-nowrap"
              onClick={() => navigate("/merchant/login")}
              aria-label="Acessar Área do Mercador"
            >
              <Store className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Área do Mercador</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}