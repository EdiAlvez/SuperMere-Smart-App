# SuperMere Smart 🛒

Catálogo digital de supermercado com área do cliente e painel do mercador.

## Estrutura do Projeto

```
src/
├── App.tsx                    ← Rotas principais
├── main.tsx                   ← Entry point
├── index.css                  ← Tailwind + variáveis shadcn/ui
├── types/
│   └── index.ts               ← Interfaces TypeScript (Product, Customer, Coupon…)
├── lib/
│   ├── utils.ts               ← Utilitário cn()
│   └── seed.ts                ← Dados iniciais (localStorage)
├── components/
│   ├── brand/
│   │   ├── LogoIcon.tsx
│   │   └── LogoComplete.tsx
│   └── ui/                    ← Componentes shadcn/ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       ├── select.tsx
│       ├── switch.tsx
│       ├── checkbox.tsx
│       └── tabs.tsx
└── pages/
    ├── Home.tsx               ← Tela de entrada
    ├── client/
    │   ├── Catalog.tsx        ← Catálogo de produtos
    │   ├── Register.tsx       ← Cadastro de cliente
    │   ├── Scanner.tsx        ← Scanner de código de barras
    │   ├── ShoppingList.tsx   ← Listas de compras
    │   └── Wallet.tsx         ← Carteira digital
    └── merchant/
        ├── Dashboard.tsx      ← Painel do mercador
        ├── Reports.tsx        ← Relatórios e gráficos
        └── Coupons.tsx        ← Gestão de cupons
```

## Rotas

| Rota                      | Página                |
|---------------------------|-----------------------|
| `/`                       | Home (seleção)        |
| `/register`               | Cadastro de cliente   |
| `/client`                 | Catálogo              |
| `/client/scanner`         | Scanner               |
| `/client/shopping-list`   | Listas de compras     |
| `/client/wallet`          | Carteira digital      |
| `/merchant`               | Painel do mercador    |
| `/merchant/reports`       | Relatórios            |
| `/merchant/coupons`       | Cupons                |

## Como Rodar

### 1. Instale as dependências

```bash
npm install
```

### 2. Copie seus arquivos de páginas

Coloque seus arquivos `.tsx` nas pastas corretas:

```
src/pages/Home.tsx
src/pages/client/Catalog.tsx
src/pages/client/Register.tsx
src/pages/client/Scanner.tsx
src/pages/client/ShoppingList.tsx
src/pages/client/Wallet.tsx
src/pages/merchant/Dashboard.tsx
src/pages/merchant/Reports.tsx
src/pages/merchant/Coupons.tsx
```

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O app estará disponível em `http://localhost:5173`

### 4. Build para produção

```bash
npm run build
```

## Tecnologias

- **React 18** + **TypeScript**
- **Vite** (bundler)
- **React Router v7** (roteamento)
- **Tailwind CSS** (estilização)
- **shadcn/ui** (componentes)
- **Recharts** (gráficos)
- **html5-qrcode** (scanner de câmera)
- **react-qr-code** (geração de QR Code)
- **Sonner** (notificações toast)
- **Lucide React** (ícones)

## Dados de Teste

Os dados de demonstração são carregados automaticamente no primeiro acesso via `src/lib/seed.ts`.

**CPFs para teste no catálogo:**
- `123.456.789-00` → João Silva (10% de desconto)
- `987.654.321-00` → Maria Santos (5% de desconto)

**Código de barras para scanner:**
- `7891234567890` → Arroz Branco 5kg
- `7891234567893` → Café Torrado 500g

## Funcionalidades

### Cliente
- ✅ Catálogo com busca e filtro por categoria
- ✅ Login por CPF com desconto personalizado
- ✅ Scanner de código de barras (câmera + manual)
- ✅ Listas de compras com total estimado
- ✅ Carteira digital (cartão, cupons, pontos, cashback)
- ✅ Cadastro de novos clientes

### Mercador
- ✅ CRUD completo de produtos
- ✅ Ativar/desativar disponibilidade
- ✅ Gestão de clientes e descontos
- ✅ Relatórios com gráficos (vendas, produtos, clientes, categorias)
- ✅ Criação e gestão de cupons
