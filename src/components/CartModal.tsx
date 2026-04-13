import React, { useState } from 'react';
import { useRaffleStore, PaymentMethod } from '../store/raffleStore';
import { X, ShoppingCart, User, Phone, CreditCard, Send, CheckCircle, Copy } from 'lucide-react';

interface CartModalProps {
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ onClose }) => {
  const { config, cart, removeFromCart, clearCart, submitPurchase } = useRaffleStore();
  const [step, setStep] = useState<'cart' | 'buyer' | 'payment' | 'success'>('cart');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('alias1');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [completedPurchase, setCompletedPurchase] = useState<{ id: string; numbers: number[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateTotal = () => {
    if (config.price.doubleEnabled && cart.length === 2) {
      return config.price.doublePrice;
    }
    // For more than 2, apply double pricing per pair
    if (config.price.doubleEnabled && cart.length > 2) {
      const pairs = Math.floor(cart.length / 2);
      const singles = cart.length % 2;
      return pairs * config.price.doublePrice + singles * config.price.singlePrice;
    }
    return cart.length * config.price.singlePrice;
  };

  const getDiscount = () => {
    const regularPrice = cart.length * config.price.singlePrice;
    const actualPrice = calculateTotal();
    return regularPrice - actualPrice;
  };

  const validateBuyer = () => {
    const newErrors: { name?: string; phone?: string } = {};
    if (!buyerName.trim() || buyerName.trim().length < 3) {
      newErrors.name = 'Ingrese su nombre completo';
    }
    if (!buyerPhone.trim() || !/^\d{8,15}$/.test(buyerPhone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ingrese un número de celular válido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextToBuyer = () => {
    setStep('buyer');
  };

  const handleNextToPayment = () => {
    if (validateBuyer()) {
      setStep('payment');
    }
  };

  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'alias1': return config.payment.alias1 || 'Alias Principal';
      case 'alias2': return config.payment.alias2 || 'Alias Secundario 2';
      case 'alias3': return config.payment.alias3 || 'Alias Secundario 3';
    }
  };

  const getPaymentDetails = (method: PaymentMethod) => {
    switch (method) {
      case 'alias1':
        return { alias: config.payment.alias1, cbu: '', qr: null };
      case 'alias2':
        return { alias: config.payment.alias2, cbu: config.payment.alias2CBU, qr: config.payment.alias2QR };
      case 'alias3':
        return { alias: config.payment.alias3, cbu: config.payment.alias3CBU, qr: config.payment.alias3QR };
    }
  };

  const handleConfirmPurchase = () => {
    const purchase = submitPurchase(buyerName, buyerPhone, selectedPayment);
    setCompletedPurchase({ id: purchase.id, numbers: purchase.numbers });
    sendWhatsApp(purchase.numbers, purchase.id);
    setStep('success');
  };

  const sendWhatsApp = (numbers: number[], purchaseId: string) => {
    const total = calculateTotal();
    const paymentDetails = getPaymentDetails(selectedPayment);
    const numStr = numbers.map((n) => n.toString().padStart(3, '0')).join(', ');

    const message = encodeURIComponent(
      `🎟️ *SORTEO COOPERADORA ESC. N°7 - SAN MIGUEL*\n\n` +
      `📋 *Comprobante de Reserva*\n` +
      `ID: ${purchaseId}\n\n` +
      `👤 *Comprador:* ${buyerName}\n` +
      `📞 *Celular:* ${buyerPhone}\n\n` +
      `🎫 *Números seleccionados:* ${numStr}\n` +
      `💰 *Total a pagar:* $${total.toLocaleString('es-AR')}\n\n` +
      `💳 *Forma de pago:* ${paymentDetails.alias ? 'Alias: ' + paymentDetails.alias : ''}\n` +
      (paymentDetails.cbu ? `CBU: ${paymentDetails.cbu}\n` : '') +
      `\n⚠️ *Por favor enviá el comprobante de transferencia a este número para confirmar tu compra.*\n\n` +
      `🏫 Cooperadora Escuela N°7 - San Miguel, Bs As`
    );

    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const copyAlias = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentDetails = getPaymentDetails(selectedPayment);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">
              {step === 'cart' && 'Mi Carrito'}
              {step === 'buyer' && 'Tus Datos'}
              {step === 'payment' && 'Confirmar Pago'}
              {step === 'success' && '¡Reserva Exitosa!'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        {step !== 'success' && (
          <div className="flex items-center px-6 py-3 border-b border-gray-100">
            {['cart', 'buyer', 'payment'].map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${
                  step === s ? 'text-blue-600' : 
                  ['cart', 'buyer', 'payment'].indexOf(step) > i ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s ? 'bg-blue-600 text-white' :
                    ['cart', 'buyer', 'payment'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {['cart', 'buyer', 'payment'].indexOf(step) > i ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:inline">{s === 'cart' ? 'Carrito' : s === 'buyer' ? 'Datos' : 'Pago'}</span>
                </div>
                {i < 2 && <div className="flex-1 h-0.5 bg-gray-200 mx-2" />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="p-6">
          {/* Step 1: Cart */}
          {step === 'cart' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {cart.map((num) => (
                  <div key={num} className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {num.toString().padStart(3, '0')}
                      </div>
                      <span className="text-gray-700 font-medium">Número {num.toString().padStart(3, '0')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 text-sm">${config.price.singlePrice.toLocaleString('es-AR')}</span>
                      <button
                        onClick={() => removeFromCart(num)}
                        className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2">
                {config.price.doubleEnabled && cart.length >= 2 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 line-through">${(cart.length * config.price.singlePrice).toLocaleString('es-AR')} (precio normal)</span>
                    <span className="text-green-600 font-medium">-${getDiscount().toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-700">${calculateTotal().toLocaleString('es-AR')}</span>
                </div>
                {config.price.doubleEnabled && cart.length === 2 && (
                  <div className="text-center text-xs text-green-600 bg-green-50 rounded-lg py-1 px-2">
                    🎉 ¡Aplicando precio especial por 2 números!
                  </div>
                )}
                {config.price.doubleEnabled && cart.length === 1 && (
                  <div className="text-center text-xs text-blue-600 bg-blue-50 rounded-lg py-1 px-2">
                    💡 ¡Agregá 1 número más y pagás sólo ${config.price.doublePrice.toLocaleString('es-AR')} los 2!
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={clearCart}
                  className="flex-1 border border-red-300 text-red-500 hover:bg-red-50 py-3 rounded-xl font-medium transition-colors"
                >
                  Vaciar carrito
                </button>
                <button
                  onClick={handleNextToBuyer}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors shadow-md"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Buyer Info */}
          {step === 'buyer' && (
            <div className="space-y-5">
              <p className="text-gray-600 text-sm bg-blue-50 rounded-xl p-3 border border-blue-100">
                📱 Completá tus datos. Recibiremos la confirmación de pago vía WhatsApp.
              </p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" /> Nombre completo *
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: María García"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" /> Número de celular (WhatsApp) *
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, ''))}
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 1134567890"
                  maxLength={15}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                <p className="text-gray-500 text-xs mt-1">Enviaremos los datos de pago a este número</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('cart')}
                  className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-medium"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleNextToPayment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md"
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm font-semibold text-blue-800 mb-2">Resumen de tu compra</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {cart.map((n) => (
                    <span key={n} className="bg-blue-600 text-white text-xs px-2 py-1 rounded-lg font-bold">
                      {n.toString().padStart(3, '0')}
                    </span>
                  ))}
                </div>
                <p className="text-right font-bold text-blue-800 text-lg">${calculateTotal().toLocaleString('es-AR')}</p>
              </div>

              {/* Payment method selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-1" /> Elegí el método de pago
                </label>
                <div className="space-y-2">
                  {config.activePaymentMethods.map((method) => (
                    <button
                      key={method}
                      onClick={() => setSelectedPayment(method)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        selectedPayment === method
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPayment === method ? 'border-blue-600' : 'border-gray-400'
                      }`}>
                        {selectedPayment === method && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {method === 'alias1' ? '🏦 Alias Principal' : method === 'alias2' ? '🏦 Alias 2' : '🏦 Alias 3'}
                        </p>
                        <p className="text-xs text-gray-500">{getPaymentLabel(method)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment details */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                <p className="font-semibold text-gray-700 text-sm">Datos para la transferencia:</p>
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Alias</p>
                    <p className="font-bold text-gray-800">{paymentDetails.alias || '-'}</p>
                  </div>
                  {paymentDetails.alias && (
                    <button
                      onClick={() => copyAlias(paymentDetails.alias)}
                      className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-lg"
                      title="Copiar alias"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {paymentDetails.cbu && (
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">CBU</p>
                      <p className="font-mono text-sm text-gray-800 break-all">{paymentDetails.cbu}</p>
                    </div>
                    <button
                      onClick={() => copyAlias(paymentDetails.cbu)}
                      className="text-blue-500 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {paymentDetails.qr && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Código QR</p>
                    <img src={paymentDetails.qr} alt="QR" className="w-40 h-40 mx-auto rounded-xl border-2 border-gray-200 object-contain" />
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800">
                ⚠️ Al confirmar, se abrirá WhatsApp para enviar el comprobante de pago. Tu reserva quedará pendiente hasta la confirmación.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('buyer')}
                  className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-medium"
                >
                  ← Volver
                </button>
                <button
                  onClick={handleConfirmPurchase}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Confirmar y enviar WA
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center space-y-5 py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Reserva Confirmada!</h3>
                <p className="text-gray-600">
                  Tus números han sido reservados. Por favor enviá el comprobante de transferencia por WhatsApp para confirmar la compra.
                </p>
              </div>

              {completedPurchase && (
                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 text-left space-y-3">
                  <p className="text-sm font-semibold text-blue-800">📋 Detalle de tu reserva</p>
                  <div className="flex flex-wrap gap-2">
                    {completedPurchase.numbers.map((n) => (
                      <span key={n} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm">
                        {n.toString().padStart(3, '0')}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-700">
                    <p><span className="font-medium">Nombre:</span> {buyerName}</p>
                    <p><span className="font-medium">Celular:</span> {buyerPhone}</p>
                    <p><span className="font-medium">Total:</span> ${calculateTotal().toLocaleString('es-AR')}</p>
                    <p><span className="font-medium">ID:</span> {completedPurchase.id}</p>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500">
                ¿No se abrió WhatsApp?
              </p>
              <button
                onClick={() => sendWhatsApp(completedPurchase?.numbers || [], completedPurchase?.id || '')}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Reenviar por WhatsApp
              </button>
              <button
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 py-3 rounded-xl font-medium"
              >
                Cerrar y seguir comprando
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
