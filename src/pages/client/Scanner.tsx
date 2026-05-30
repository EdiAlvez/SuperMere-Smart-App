import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Html5Qrcode } from "html5-qrcode";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { Header } from "../../components/layout/Header";
import { readStoredJson } from "../../lib/storage";
import type { Product } from "../../types";

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") {
    return false;
  }

  const product = value as Partial<Product>;
  return typeof product.id === "string" && typeof product.barcode === "string";
}

export default function Scanner() {
  const [products, setProducts] = useState<Product[]>([]);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  useEffect(() => {
    const savedProducts = readStoredJson<unknown[]>("products", []);
    setProducts(Array.isArray(savedProducts) ? savedProducts.filter(isProduct) : []);

    return () => {
      const scanner = scannerRef.current;
      if (scanner) {
        scannerRef.current = null;
        scanner.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = () => {
    setIsScanning(true);

    // Aguarda o React renderizar a div visualmente antes de iniciar o scanner
    setTimeout(async () => {
      const element = document.getElementById("scanner-region");
      if (!element) {
        setIsScanning(false);
        return;
      }

      try {
        const html5QrCode = new Html5Qrcode("scanner-region");
        scannerRef.current = html5QrCode;
        let isProcessing = false;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            // Evita que o evento seja disparado múltiplas vezes (crash de estado)
            if (isProcessing) return;
            isProcessing = true;
            
            await stopScanner();
            handleBarcodeDetected(decodedText);
          },
          () => {
            // Ignora pequenos erros de leitura do scanner
          }
        );

        // Evita "câmera fantasma" se o usuário clicou em Parar enquanto carregava
        if (!scannerRef.current) {
          await html5QrCode.stop().catch(() => {});
        }
      } catch (err) {
        console.error("Error starting scanner:", err);
        setIsScanning(false);
        if (scannerRef.current) {
          alert("Não foi possível acessar a câmera. Verifique as permissões.");
        }
      }
    }, 100);
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      scannerRef.current = null; // Impede múltiplas chamadas concorrentes
      try {
        await scanner.stop();
      } catch (error) {
        console.error("Erro ao parar o scanner:", error);
      } finally {
        setIsScanning(false);
      }
    } else {
      setIsScanning(false);
    }
  };

  const handleBarcodeDetected = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    
    if (product) {
      setScannedProduct(product);
    } else {
      alert(`Código de barras ${barcode} não encontrado no sistema`);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;

    handleBarcodeDetected(manualBarcode);
    setManualBarcode("");
  };

  const similarProducts = scannedProduct
    ? products.filter(
        p =>
          p.category === scannedProduct.category &&
          p.id !== scannedProduct.id &&
          p.available
      ).slice(0, 3)
    : [];

  return(
    <div className="min-h-screen bg-gray-50 pt-[80px]">
      <Header 
        title="Scanner de Código de Barras"
        leftNode={
          <Link to="/client">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#299449]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto">
        {!scannedProduct ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Escanear Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isScanning && (
                  <Button onClick={startScanner} className="w-full" size="lg">
                    <Camera className="w-5 h-5 mr-2" />
                    Abrir Câmera
                  </Button>
                )}
                
                <div
                  id="scanner-region"
                  className={`w-full aspect-square bg-black rounded-lg overflow-hidden ${!isScanning ? 'hidden' : ''}`}
                />
                {isScanning && (
                  <Button onClick={stopScanner} variant="destructive" className="w-full mt-4">
                    Parar Scanner
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-50 px-2 text-gray-500">ou</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Buscar por Código de Barras</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualSearch} className="flex gap-2">
                  <Input
                    placeholder="Digite o código de barras..."
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                  />
                  <Button type="submit">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Aponte a câmera para o código de barras do produto
                  para ver informações detalhadas, comparar preços e encontrar produtos similares.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Badge variant="default" className="mb-4">
                    Produto Encontrado!
                  </Badge>
                </div>
                <img
                  src={scannedProduct.image}
                  alt={scannedProduct.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <h2 className="text-2xl mb-2">{scannedProduct.name}</h2>
                <p className="text-gray-600 mb-4">{scannedProduct.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Categoria:</span>
                    <Badge variant="outline">{scannedProduct.category}</Badge>
                  </div>
                  {scannedProduct.brand && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Marca:</span>
                      <span className="font-medium">{scannedProduct.brand}</span>
                    </div>
                  )}
                  {scannedProduct.barcode && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Código de Barras:</span>
                      <span className="font-mono text-sm">{scannedProduct.barcode}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    {scannedProduct.originalPrice && (
                      <span className="text-gray-400 line-through">
                        R$ {scannedProduct.originalPrice.toFixed(2)}
                      </span>
                    )}
                    {scannedProduct.discount && (
                      <Badge className="bg-red-500">{scannedProduct.discount}% OFF</Badge>
                    )}
                  </div>
                  <p className="text-4xl text-green-600 mb-4">
                    R$ {scannedProduct.price.toFixed(2)}
                  </p>
                  
                  {scannedProduct.stock !== undefined && (
                    <p className="text-sm text-gray-600">
                      {scannedProduct.stock > 0
                        ? `${scannedProduct.stock} unidades disponíveis`
                        : "Produto indisponível"}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => setScannedProduct(null)}
                  variant="outline"
                  className="w-full mt-4"
                >
                  Escanear Outro Produto
                </Button>
              </CardContent>
            </Card>

            {similarProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Similares Mais Baratos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {similarProducts.map(product => {
                    const savings = scannedProduct.price - product.price;
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setScannedProduct(product)}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-lg text-green-600">
                            R$ {product.price.toFixed(2)}
                          </p>
                          {savings > 0 && (
                            <p className="text-sm text-green-600">
                              Economize R$ {savings.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
