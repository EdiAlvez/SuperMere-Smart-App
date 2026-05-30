import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, CheckCircle, XCircle, ShoppingBag, Tag } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Html5Qrcode } from "html5-qrcode";
import { LogoIcon } from "../../components/brand/LogoIcon";
import { Header } from "../../components/layout/Header";
import { readStoredJson } from "../../lib/storage";
import { toast } from "sonner";
import type { Customer, Coupon } from "../../types";

export default function MerchantScanner() {
  const [scannedData, setScannedData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
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
    setScannedData(null);

    setTimeout(async () => {
      const element = document.getElementById("merchant-scanner-region");
      if (!element) {
        setIsScanning(false);
        return;
      }

      try {
        const html5QrCode = new Html5Qrcode("merchant-scanner-region");
        scannerRef.current = html5QrCode;
        let isProcessing = false;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            if (isProcessing) return;
            isProcessing = true;
            
            await stopScanner();
            handleQRCodeDetected(decodedText);
          },
          () => {}
        );

        if (!scannerRef.current) {
          await html5QrCode.stop().catch(() => {});
        }
      } catch (err) {
        console.error("Error starting scanner:", err);
        setIsScanning(false);
        if (scannerRef.current) {
          toast.error("Não foi possível acessar a câmera.");
        }
      }
    }, 100);
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      scannerRef.current = null;
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

  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Frequência do beep (800Hz)
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume a 10%
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15); // Duração de 150 milissegundos
      }
    } catch (error) {
      console.error("Erro ao tentar tocar o beep:", error);
    }
  };

  const handleQRCodeDetected = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      if (data.type === "RESERVATION") {
        playBeep();
        setScannedData(data);
        toast.success("Reserva lida com sucesso!");
      } else {
        toast.error("O QR Code lido não é de uma reserva válida.");
      }
    } catch (e) {
      toast.error("Formato de QR Code não reconhecido.");
    }
  };

  const handleValidatePurchase = () => {
    if (!scannedData) return;

    const savedCustomers = readStoredJson<Customer[]>("customers", []);
    let purchaseFound = false;
    let alreadyCompleted = false;

    const updatedCustomers = savedCustomers.map((customer) => {
      if (customer.cpf === scannedData.customerId || customer.cnpj === scannedData.customerId) {
        const updatedHistory = (customer.purchaseHistory || []).map((purchase: any) => {
          // Comparamos a data (ISO string) pra achar a compra exata no histórico deste cliente
          if (purchase.date === scannedData.date) {
            purchaseFound = true;
            if (purchase.status === "COMPLETED") {
              alreadyCompleted = true;
            }
            // Insere o status de concluído na reserva
            return { ...purchase, status: "COMPLETED" };
          }
          return purchase;
        });
        return { ...customer, purchaseHistory: updatedHistory };
      }
      return customer;
    });

    if (alreadyCompleted) {
      toast.error("Essa reserva já foi validada e baixada anteriormente no caixa!");
      return;
    }

    if (!purchaseFound) {
      toast.error("Reserva não encontrada no histórico do cliente.");
      return;
    }

    // Salva o status atualizado do cliente
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));

    // Dá baixa na utilização do cupom
    if (scannedData.couponApplied) {
      const savedCoupons = readStoredJson<Coupon[]>("coupons", []);
      const updatedCoupons = savedCoupons.map((coupon) => {
        if (coupon.code === scannedData.couponApplied) {
          return { ...coupon, usedCount: (coupon.usedCount || 0) + 1 };
        }
        return coupon;
      });
      localStorage.setItem("coupons", JSON.stringify(updatedCoupons));
    }

    toast.success("Compra validada e baixada com sucesso!");
    setScannedData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-[80px]">
      <Header 
        title="Scanner do Caixa"
        leftNode={
          <Link to="/merchant">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#299449]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto">
        {!scannedData ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Escanear QR Code do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isScanning && (
                <Button onClick={startScanner} className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                  <Camera className="w-5 h-5 mr-2" />
                  Abrir Câmera
                </Button>
              )}
              
              <div
                id="merchant-scanner-region"
                className={`w-full aspect-square bg-black rounded-lg overflow-hidden ${!isScanning ? 'hidden' : ''}`}
              />
              {isScanning && (
                <Button onClick={stopScanner} variant="destructive" className="w-full mt-4">
                  Parar Scanner
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="bg-green-50 border-b">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <CardTitle className="text-green-800">Reserva Encontrada</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2 pt-4">
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="text-lg font-semibold">{scannedData.customerName}</p>
                <p className="text-sm text-gray-500">Documento: {scannedData.customerId}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Data do Pedido</p>
                <p className="font-medium">
                  {new Date(scannedData.date).toLocaleDateString("pt-BR")} às {new Date(scannedData.date).toLocaleTimeString("pt-BR")}
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-2">Itens da Compra</p>
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {scannedData.items?.map((item: any, i: number) => (
                    <li key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{item.quantity}x {item.productName}</span>
                      </div>
                      <span className="text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cupom Aplicado:</span>
                  {scannedData.couponApplied ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Tag className="w-3 h-3 mr-1" />
                      {scannedData.couponApplied}
                    </Badge>
                  ) : (
                    <span className="text-gray-400 text-sm">Nenhum</span>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-bold">Total a Cobrar:</span>
                  <span className="text-2xl font-bold text-green-600">
                    R$ {scannedData.total?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setScannedData(null)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleValidatePurchase}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Validar e Baixar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </main>
    </div>
  );
}