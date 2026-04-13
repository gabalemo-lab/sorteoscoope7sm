import React, { useState } from 'react';
import { useRaffleStore, Purchase } from '../store/raffleStore';
import * as XLSX from 'xlsx';
import {
  ClipboardList, Download, Trash2, CheckCircle, Clock,
  Search, ArrowLeft, Phone,
  ChevronDown, ChevronUp
} from 'lucide-react';

const SalesRegistry: React.FC = () => {
  const { purchases, soldNumbers, config, confirmPurchase, deletePurchase, setCurrentPage } = useRaffleStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredPurchases = purchases.filter((p) => {
    const matchSearch =
      p.buyerName.toLowerCase().includes(search.toLowerCase()) ||
      p.buyerPhone.includes(search) ||
      p.numbers.some((n) => n.toString().includes(search)) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const exportToExcel = () => {
    const data = purchases.map((p) => ({
      'ID': p.id,
      'Fecha': new Date(p.timestamp).toLocaleString('es-AR'),
      'Nombre': p.buyerName,
      'Celular': p.buyerPhone,
      'Números': p.numbers.map((n) => n.toString().padStart(3, '0')).join(' - '),
      'Cantidad': p.numbers.length,
      'Método de Pago': p.paymentMethod === 'alias1'
        ? `Alias: ${config.payment.alias1}`
        : p.paymentMethod === 'alias2'
        ? `Alias: ${config.payment.alias2}`
        : `Alias: ${config.payment.alias3}`,
      'Total ($)': p.numbers.length === 2 && config.price.doubleEnabled
        ? config.price.doublePrice
        : p.numbers.length * config.price.singlePrice,
      'Estado': p.status === 'confirmed' ? 'Confirmado' : 'Pendiente',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    // Set column widths
    worksheet['!cols'] = [
      { wch: 18 }, { wch: 22 }, { wch: 25 }, { wch: 16 },
      { wch: 30 }, { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

    // Summary sheet
    const summaryData = [
      { 'Resumen': 'Total números vendidos', 'Valor': soldNumbers.length },
      { 'Resumen': 'Total compradores', 'Valor': purchases.length },
      { 'Resumen': 'Confirmados', 'Valor': purchases.filter((p) => p.status === 'confirmed').length },
      { 'Resumen': 'Pendientes', 'Valor': purchases.filter((p) => p.status === 'pending').length },
      { 'Resumen': 'Recaudado estimado', 'Valor': purchases.reduce((acc, p) => {
        return acc + (p.numbers.length === 2 && config.price.doubleEnabled
          ? config.price.doublePrice
          : p.numbers.length * config.price.singlePrice);
      }, 0) },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

    XLSX.writeFile(workbook, `Sorteo_Cooperadora_Esc7_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.xlsx`);
  };

  const totalRevenue = purchases.reduce((acc, p) => {
    return acc + (p.numbers.length === 2 && config.price.doubleEnabled
      ? config.price.doublePrice
      : p.numbers.length * config.price.singlePrice);
  }, 0);

  const getPaymentLabel = (p: Purchase) => {
    switch (p.paymentMethod) {
      case 'alias1': return config.payment.alias1 || 'Alias Principal';
      case 'alias2': return config.payment.alias2 || 'Alias 2';
      case 'alias3': return config.payment.alias3 || 'Alias 3';
    }
  };

  const getPurchaseTotal = (p: Purchase) => {
    if (p.numbers.length === 2 && config.price.doubleEnabled) return config.price.doublePrice;
    const pairs = Math.floor(p.numbers.length / 2);
    const singles = p.numbers.length % 2;
    if (config.price.doubleEnabled && p.numbers.length > 2) {
      return pairs * config.price.doublePrice + singles * config.price.singlePrice;
    }
    return p.numbers.length * config.price.singlePrice;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage('admin')}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" /> Registro de Ventas
                </h1>
                <p className="text-blue-200 text-sm">Cooperadora Escuela N° 7 - San Miguel</p>
              </div>
            </div>
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg transition-colors"
            >
              <Download className="w-4 h-4" /> Exportar Excel
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{soldNumbers.length}</p>
              <p className="text-blue-200 text-xs">Números vendidos</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{purchases.length}</p>
              <p className="text-blue-200 text-xs">Compradores</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-300">{purchases.filter((p) => p.status === 'confirmed').length}</p>
              <p className="text-blue-200 text-xs">Confirmados</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-yellow-300">${totalRevenue.toLocaleString('es-AR')}</p>
              <p className="text-blue-200 text-xs">Recaudado est.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Buscar por nombre, celular, número o ID..."
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'confirmed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex-1 sm:flex-none ${
                    filterStatus === s
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'Todos' : s === 'pending' ? '⏳ Pendientes' : '✅ Confirmados'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Purchases List */}
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-500 font-medium text-lg">No hay ventas registradas</h3>
            <p className="text-gray-400 text-sm mt-1">
              {search || filterStatus !== 'all' ? 'No se encontraron resultados con ese filtro' : 'Las compras aparecerán aquí cuando se realicen'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPurchases
              .slice()
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((purchase) => (
                <div
                  key={purchase.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${
                    purchase.status === 'confirmed' ? 'border-green-200' : 'border-orange-200'
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === purchase.id ? null : purchase.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          purchase.status === 'confirmed' ? 'bg-green-100' : 'bg-orange-100'
                        }`}>
                          {purchase.status === 'confirmed'
                            ? <CheckCircle className="w-5 h-5 text-green-600" />
                            : <Clock className="w-5 h-5 text-orange-500" />
                          }
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-800">{purchase.buyerName}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              purchase.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {purchase.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {purchase.buyerPhone}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {purchase.numbers.map((n) => (
                              <span key={n} className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-bold">
                                {n.toString().padStart(3, '0')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="font-bold text-blue-700 text-lg">
                          ${getPurchaseTotal(purchase).toLocaleString('es-AR')}
                        </span>
                        {expandedId === purchase.id
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === purchase.id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">ID de compra</p>
                          <p className="font-mono text-xs text-gray-700">{purchase.id}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">Fecha y hora</p>
                          <p className="text-gray-700">{new Date(purchase.timestamp).toLocaleString('es-AR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-0.5">Método de pago</p>
                          <p className="text-gray-700">{getPaymentLabel(purchase)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {purchase.status === 'pending' && (
                          <button
                            onClick={() => confirmPurchase(purchase.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" /> Confirmar pago
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const msg = `https://wa.me/${purchase.buyerPhone}?text=${encodeURIComponent(
                              `Hola ${purchase.buyerName}! Te recordamos que tenés pendiente el pago del sorteo de la Cooperadora Esc. N°7.\n\nNúmeros: ${purchase.numbers.map((n) => n.toString().padStart(3,'0')).join(', ')}\nTotal: $${getPurchaseTotal(purchase).toLocaleString('es-AR')}\n\nAlias: ${config.payment.alias1}`
                            )}`;
                            window.open(msg, '_blank');
                          }}
                          className="flex-1 bg-green-400 hover:bg-green-500 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                          💬 WhatsApp
                        </button>
                        {deleteConfirm === purchase.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { deletePurchase(purchase.id); setDeleteConfirm(null); }}
                              className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-xl text-sm font-semibold"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-3 rounded-xl text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(purchase.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 py-2 px-3 rounded-xl text-sm flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesRegistry;
