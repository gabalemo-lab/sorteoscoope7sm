import React, { useEffect, useState } from 'react';
import { useRaffleStore } from '../store/raffleStore';

interface TicketGridProps {
  onOpenCart: () => void;
}

const TicketGrid: React.FC<TicketGridProps> = ({ onOpenCart }) => {
  const { config, cart, soldNumbers, reservedNumbers, addToCart, removeFromCart, cleanExpiredReservations } = useRaffleStore();
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      cleanExpiredReservations();
    }, 30000);
    return () => clearInterval(interval);
  }, [cleanExpiredReservations]);

  const getStatus = (num: number): 'available' | 'in-cart' | 'sold' | 'reserved' => {
    if (soldNumbers.includes(num)) return 'sold';
    if (cart.includes(num)) return 'in-cart';
    const now = Date.now();
    const isReserved = reservedNumbers.some((r) => r.number === num && r.expiresAt > now && !cart.includes(num));
    if (isReserved) return 'reserved';
    return 'available';
  };

  const handleTicketClick = (num: number) => {
    const status = getStatus(num);
    if (status === 'available') {
      addToCart(num);
    } else if (status === 'in-cart') {
      removeFromCart(num);
    }
  };

  const tickets = Array.from({ length: config.totalTickets }, (_, i) => i + 1);

  const stats = {
    available: tickets.filter((n) => getStatus(n) === 'available').length,
    sold: soldNumbers.length,
    inCart: cart.length,
    reserved: reservedNumbers.filter((r) => r.expiresAt > Date.now() && !cart.includes(r.number)).length,
  };

  const getTicketStyle = (num: number) => {
    const status = getStatus(num);
    const isHovered = hoveredNumber === num;

    switch (status) {
      case 'sold':
        return 'bg-red-100 text-red-400 border-red-200 cursor-not-allowed line-through opacity-60';
      case 'in-cart':
        return 'bg-blue-600 text-white border-blue-700 cursor-pointer shadow-md scale-105';
      case 'reserved':
        return 'bg-orange-100 text-orange-400 border-orange-200 cursor-not-allowed opacity-70';
      case 'available':
        return isHovered
          ? 'bg-blue-500 text-white border-blue-600 cursor-pointer shadow-md scale-105'
          : 'bg-white text-gray-700 border-gray-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50';
      default:
        return '';
    }
  };

  // Determine grid columns based on total tickets
  const gridCols = config.totalTickets <= 100
    ? 'grid-cols-5 sm:grid-cols-10'
    : config.totalTickets <= 300
    ? 'grid-cols-5 sm:grid-cols-10 md:grid-cols-15'
    : 'grid-cols-5 sm:grid-cols-10 md:grid-cols-20';

  return (
    <div className="w-full">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 border border-gray-200 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          <p className="text-xs text-gray-500 mt-0.5">Disponibles</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200 text-center shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{stats.inCart}</p>
          <p className="text-xs text-gray-500 mt-0.5">En carrito</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200 text-center shadow-sm">
          <p className="text-2xl font-bold text-orange-500">{stats.reserved}</p>
          <p className="text-xs text-gray-500 mt-0.5">Reservados</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-500">{stats.sold}</p>
          <p className="text-xs text-gray-500 mt-0.5">Vendidos</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border-2 border-gray-200 bg-white" />
          <span className="text-gray-600">Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-blue-600" />
          <span className="text-gray-600">En tu carrito</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-orange-100 border border-orange-200" />
          <span className="text-gray-600">Reservado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-red-100 border border-red-200" />
          <span className="text-gray-600">Vendido</span>
        </div>
      </div>

      {/* Price info */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm">
          <span className="text-gray-600">1 número: </span>
          <span className="font-bold text-blue-700">${config.price.singlePrice.toLocaleString('es-AR')}</span>
        </div>
        {config.price.doubleEnabled && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm flex items-center gap-2">
            <span className="text-gray-600">2 números: </span>
            <span className="font-bold text-green-700">${config.price.doublePrice.toLocaleString('es-AR')}</span>
            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
              OFERTA
            </span>
          </div>
        )}
      </div>

      {/* Ticket Grid */}
      <div className={`grid ${gridCols} gap-1.5 mb-6`}>
        {tickets.map((num) => (
          <button
            key={num}
            onClick={() => handleTicketClick(num)}
            onMouseEnter={() => setHoveredNumber(num)}
            onMouseLeave={() => setHoveredNumber(null)}
            className={`
              aspect-square flex items-center justify-center 
              rounded-lg border-2 font-semibold text-xs transition-all duration-150
              ${getTicketStyle(num)}
            `}
            disabled={getStatus(num) === 'sold' || getStatus(num) === 'reserved'}
            title={`Número ${num.toString().padStart(3, '0')}`}
          >
            {num.toString().padStart(config.totalTickets >= 1000 ? 4 : 3, '0')}
          </button>
        ))}
      </div>

      {/* Cart CTA */}
      {cart.length > 0 && (
        <div className="sticky bottom-4 z-10">
          <button
            onClick={onOpenCart}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 text-lg"
          >
            <span className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              {cart.length}
            </span>
            Ver carrito y confirmar compra
            <span className="text-blue-200">→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketGrid;
