import React, { useState } from 'react';
import { useRaffleStore } from '../store/raffleStore';
import TicketGrid from './TicketGrid';
import CartModal from './CartModal';
import { Trophy, ShoppingCart, Settings, ClipboardList, Star, ChevronDown, ChevronUp } from 'lucide-react';

const HomePage: React.FC = () => {
  const { config, cart, setCurrentPage, adminLoggedIn } = useRaffleStore();
  const [showCart, setShowCart] = useState(false);
  const [showPrizes, setShowPrizes] = useState(true);

  const activePrizes = config.prizes.filter((p) => p.enabled);

  const prizeColors = [
    { bg: 'from-yellow-400 to-amber-500', icon: '🥇', border: 'border-yellow-300', badge: 'bg-yellow-400 text-yellow-900' },
    { bg: 'from-gray-300 to-gray-400', icon: '🥈', border: 'border-gray-300', badge: 'bg-gray-300 text-gray-800' },
    { bg: 'from-amber-600 to-amber-700', icon: '🥉', border: 'border-amber-400', badge: 'bg-amber-600 text-white' },
    { bg: 'from-purple-500 to-purple-600', icon: '⭐', border: 'border-purple-300', badge: 'bg-purple-500 text-white' },
    { bg: 'from-pink-500 to-pink-600', icon: '🎁', border: 'border-pink-300', badge: 'bg-pink-500 text-white' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-800 text-white shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🏫</span>
                <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Gran Sorteo</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
                COOPERADORA
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-200 leading-tight">
                ESCUELA N° 7
              </h2>
              <p className="text-blue-300 text-sm mt-1 font-medium">San Miguel, Buenos Aires</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {cart.length > 0 && (
                <button
                  onClick={() => setShowCart(true)}
                  className="relative bg-white text-blue-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg hover:bg-blue-50 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Carrito</span>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {cart.length}
                  </span>
                </button>
              )}
              <div className="flex gap-2">
                {adminLoggedIn && (
                  <button
                    onClick={() => setCurrentPage('registry')}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                    title="Registro de ventas"
                  >
                    <ClipboardList className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setCurrentPage('admin')}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                  title="Panel administrador"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

              {/* Prize summary badges */}
          {activePrizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activePrizes.slice(0, 3).map((prize, i) => (
                <div key={prize.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${prizeColors[i].badge}`}>
                  <span>{prizeColors[i].icon}</span>
                  <span>{prize.name}{prize.description ? `: ${prize.description}` : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Banner Image */}
      <div className="w-full overflow-hidden h-28 sm:h-40 relative">
        <img src="/banner.jpg" alt="Sorteo Cooperadora" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-800/40 to-transparent" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="bg-yellow-400 text-yellow-900 px-4 py-1.5 rounded-full font-black text-sm shadow-lg animate-bounce">
            🎟️ ¡GRAN SORTEO SOLIDARIO!
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Prizes Section */}
        {activePrizes.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowPrizes(!showPrizes)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-800">Premios del Sorteo</h2>
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {activePrizes.length} premio{activePrizes.length !== 1 ? 's' : ''}
                </span>
              </div>
              {showPrizes ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {showPrizes && (
              <div className="px-5 pb-5">
                <div className={`grid gap-4 ${activePrizes.length === 1 ? 'grid-cols-1' : activePrizes.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                  {activePrizes.map((prize, i) => {
                    const color = prizeColors[i] || prizeColors[3];
                    return (
                      <div
                        key={prize.id}
                        className={`rounded-2xl border-2 ${color.border} overflow-hidden`}
                      >
                        {/* Prize image or placeholder */}
                        <div className={`bg-gradient-to-br ${color.bg} h-36 sm:h-44 flex items-center justify-center relative`}>
                          {prize.photo ? (
                            <img
                              src={prize.photo}
                              alt={prize.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <span className="text-5xl sm:text-6xl">{color.icon}</span>
                            </div>
                          )}
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-black ${color.badge}`}>
                            {prize.name}
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          {prize.description && (
                            <p className="text-sm text-gray-600 font-medium">{prize.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Ticket Selection */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                🎫 Elegí tus números
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Sorteo de {config.totalTickets} números · Hacé clic para seleccionar
              </p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setShowCart(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Ver ({cart.length})
              </button>
            )}
          </div>
          <TicketGrid onOpenCart={() => setShowCart(true)} />
        </section>

        {/* How to participate */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-300" /> ¿Cómo participar?
          </h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { num: '1', text: 'Elegí uno o más números de la grilla', icon: '🎫' },
              { num: '2', text: 'Completá tu nombre y celular', icon: '👤' },
              { num: '3', text: 'Realizá la transferencia al alias indicado', icon: '💳' },
              { num: '4', text: 'Enviá el comprobante por WhatsApp', icon: '📱' },
            ].map((step) => (
              <div key={step.num} className="flex sm:flex-col items-start sm:items-center gap-3 sm:text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  {step.icon}
                </div>
                <div>
                  <span className="text-blue-200 text-xs font-medium">Paso {step.num}</span>
                  <p className="text-sm font-medium mt-0.5">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Price info */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            💰 Precios
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[140px] bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
              <p className="text-3xl font-black text-blue-700">${config.price.singlePrice.toLocaleString('es-AR')}</p>
              <p className="text-sm text-gray-600 mt-1">por número</p>
            </div>
            {config.price.doubleEnabled && (
              <div className="flex-1 min-w-[140px] bg-green-50 rounded-xl p-4 border border-green-200 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-bl-xl font-bold">
                  OFERTA
                </div>
                <p className="text-3xl font-black text-green-700">${config.price.doublePrice.toLocaleString('es-AR')}</p>
                <p className="text-sm text-gray-600 mt-1">por 2 números</p>
                {config.price.doublePrice < config.price.singlePrice * 2 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    Ahorrás ${(config.price.singlePrice * 2 - config.price.doublePrice).toLocaleString('es-AR')}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-4 text-gray-400 text-sm">
          <p>🏫 Cooperadora Escuela N° 7 · San Miguel, Buenos Aires</p>
          <p className="mt-1 text-xs">Sorteo solidario para la comunidad educativa</p>
        </footer>
      </div>

      {/* Cart Modal */}
      {showCart && <CartModal onClose={() => setShowCart(false)} />}
    </div>
  );
};

export default HomePage;
