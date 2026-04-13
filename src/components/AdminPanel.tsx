import React, { useState, useRef } from 'react';
import { useRaffleStore, PaymentMethod, RaffleConfig } from '../store/raffleStore';
import {
  Settings, Trophy, CreditCard, Tag,
  Save, Upload, X, CheckCircle, Image, DollarSign,
  LogOut, Shield
} from 'lucide-react';

const ADMIN_PASSWORD = 'cooperadora7';

const AdminPanel: React.FC = () => {
  const { config, setConfig, setPrize, adminLoggedIn, setAdminLoggedIn, setCurrentPage } = useRaffleStore();
  const [activeTab, setActiveTab] = useState<'general' | 'prizes' | 'payment' | 'price'>('general');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);
  const qrRef2 = useRef<HTMLInputElement | null>(null);
  const qrRef3 = useRef<HTMLInputElement | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAdminLoggedIn(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePrizePhoto = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPrize(index, { photo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleQRUpload = (which: 2 | 3, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const key = which === 2 ? 'alias2QR' : 'alias3QR';
      setConfig({ payment: { ...config.payment, [key]: ev.target?.result as string } });
    };
    reader.readAsDataURL(file);
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    const current = config.activePaymentMethods;
    if (method === 'alias1') return; // alias1 is always active
    if (current.includes(method)) {
      setConfig({ activePaymentMethods: current.filter((m) => m !== method) });
    } else {
      setConfig({ activePaymentMethods: [...current, method] });
    }
  };

  if (!adminLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Panel Administrador</h2>
            <p className="text-gray-500 mt-1">Ingrese su contraseña para continuar</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-2 rounded-lg">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage('home')}
              className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
            >
              ← Volver al inicio
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'prizes', label: 'Premios', icon: Trophy },
    { id: 'payment', label: 'Pagos', icon: CreditCard },
    { id: 'price', label: 'Precios', icon: Tag },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">⚙️ Panel Administrador</h1>
            <p className="text-blue-200 text-sm">Cooperadora Escuela N° 7 - San Miguel</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage('registry')}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              📋 Registro
            </button>
            <button
              onClick={() => setCurrentPage('home')}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🏠 Ver Sorteo
            </button>
            <button
              onClick={() => setAdminLoggedIn(false)}
              className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" /> Configuración General
            </h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Cantidad de Números en el Sorteo
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {[100, 200, 300, 500, 1000].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setConfig({ totalTickets: qty as RaffleConfig['totalTickets'] })}
                    className={`py-3 px-4 rounded-xl border-2 text-center font-bold transition-all ${
                      config.totalTickets === qty
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                ⚠️ Cambiar la cantidad borrará los números vendidos actualmente.
              </p>
            </div>
          </div>
        )}

        {/* Prizes Tab */}
        {activeTab === 'prizes' && (
          <div className="space-y-4">
            {config.prizes.map((prize, index) => (
              <div key={prize.id} className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all ${
                prize.enabled ? 'border-blue-200' : 'border-gray-100 opacity-70'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Trophy className={`w-5 h-5 ${index < 3 ? 'text-yellow-500' : 'text-purple-500'}`} />
                    <h3 className="font-bold text-gray-800">{prize.name}</h3>
                    {index >= 2 && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Opcional</span>
                    )}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm text-gray-600">{prize.enabled ? 'Activo' : 'Inactivo'}</span>
                    <div
                      onClick={() => setPrize(index, { enabled: !prize.enabled })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        prize.enabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        prize.enabled ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>

                {prize.enabled && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Premio</label>
                        <input
                          type="text"
                          value={prize.name}
                          onChange={(e) => setPrize(index, { name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Ej: Smart TV 55'"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <input
                          type="text"
                          value={prize.description}
                          onChange={(e) => setPrize(index, { description: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Descripción breve"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Foto del Premio</label>
                      <div className="flex items-center gap-4">
                        {prize.photo ? (
                          <div className="relative">
                            <img
                              src={prize.photo}
                              alt={prize.name}
                              className="w-24 h-24 object-cover rounded-xl border-2 border-blue-200"
                            />
                            <button
                              onClick={() => setPrize(index, { photo: null })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                            <Image className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            ref={(el) => { fileRefs.current[index] = el; }}
                            onChange={(e) => handlePrizePhoto(index, e)}
                            className="hidden"
                          />
                          <button
                            onClick={() => fileRefs.current[index]?.click()}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            {prize.photo ? 'Cambiar foto' : 'Subir foto'}
                          </button>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG hasta 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-4">
            {/* Alias 1 - Always active */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <h3 className="font-bold text-gray-800">Alias Principal</h3>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Siempre activo</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alias de transferencia</label>
                <input
                  type="text"
                  value={config.payment.alias1}
                  onChange={(e) => setConfig({ payment: { ...config.payment, alias1: e.target.value } })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="tu.alias.aqui"
                />
              </div>
            </div>

            {/* Alias 2 */}
            <div className={`bg-white rounded-2xl shadow-sm border-2 p-6 ${
              config.activePaymentMethods.includes('alias2') ? 'border-green-200' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                  <h3 className="font-bold text-gray-800">Alias Secundario 2</h3>
                </div>
                <div
                  onClick={() => togglePaymentMethod('alias2')}
                  className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    config.activePaymentMethods.includes('alias2') ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    config.activePaymentMethods.includes('alias2') ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </div>
              </div>
              {config.activePaymentMethods.includes('alias2') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                    <input
                      type="text"
                      value={config.payment.alias2}
                      onChange={(e) => setConfig({ payment: { ...config.payment, alias2: e.target.value } })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="alias.secundario.2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CBU</label>
                    <input
                      type="text"
                      value={config.payment.alias2CBU}
                      onChange={(e) => setConfig({ payment: { ...config.payment, alias2CBU: e.target.value } })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0000000000000000000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">QR de Pago</label>
                    <div className="flex items-center gap-4">
                      {config.payment.alias2QR ? (
                        <div className="relative">
                          <img src={config.payment.alias2QR} alt="QR" className="w-24 h-24 object-cover rounded-xl border-2 border-green-200" />
                          <button
                            onClick={() => setConfig({ payment: { ...config.payment, alias2QR: null } })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <input type="file" accept="image/*" ref={qrRef2} onChange={(e) => handleQRUpload(2, e)} className="hidden" />
                        <button
                          onClick={() => qrRef2.current?.click()}
                          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
                        >
                          <Upload className="w-4 h-4" /> Subir QR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Alias 3 */}
            <div className={`bg-white rounded-2xl shadow-sm border-2 p-6 ${
              config.activePaymentMethods.includes('alias3') ? 'border-purple-200' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                  <h3 className="font-bold text-gray-800">Alias Secundario 3</h3>
                </div>
                <div
                  onClick={() => togglePaymentMethod('alias3')}
                  className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${
                    config.activePaymentMethods.includes('alias3') ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    config.activePaymentMethods.includes('alias3') ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </div>
              </div>
              {config.activePaymentMethods.includes('alias3') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                    <input
                      type="text"
                      value={config.payment.alias3}
                      onChange={(e) => setConfig({ payment: { ...config.payment, alias3: e.target.value } })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="alias.secundario.3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CBU</label>
                    <input
                      type="text"
                      value={config.payment.alias3CBU}
                      onChange={(e) => setConfig({ payment: { ...config.payment, alias3CBU: e.target.value } })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0000000000000000000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">QR de Pago</label>
                    <div className="flex items-center gap-4">
                      {config.payment.alias3QR ? (
                        <div className="relative">
                          <img src={config.payment.alias3QR} alt="QR" className="w-24 h-24 object-cover rounded-xl border-2 border-purple-200" />
                          <button
                            onClick={() => setConfig({ payment: { ...config.payment, alias3QR: null } })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <input type="file" accept="image/*" ref={qrRef3} onChange={(e) => handleQRUpload(3, e)} className="hidden" />
                        <button
                          onClick={() => qrRef3.current?.click()}
                          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm"
                        >
                          <Upload className="w-4 h-4" /> Subir QR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price Tab */}
        {activeTab === 'price' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" /> Configuración de Precios
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Precio por número (ARS $)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={config.price.singlePrice}
                    onChange={(e) => setConfig({ price: { ...config.price, singlePrice: Number(e.target.value) } })}
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold"
                    min={0}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Precio especial (2 números)</h3>
                    <p className="text-sm text-gray-500">Descuento al comprar 2 números juntos</p>
                  </div>
                  <div
                    onClick={() => setConfig({ price: { ...config.price, doubleEnabled: !config.price.doubleEnabled } })}
                    className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      config.price.doubleEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      config.price.doubleEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </div>
                </div>

                {config.price.doubleEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio por 2 números (ARS $)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        value={config.price.doublePrice}
                        onChange={(e) => setConfig({ price: { ...config.price, doublePrice: Number(e.target.value) } })}
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-lg font-semibold"
                        min={0}
                      />
                    </div>
                    {config.price.doublePrice < config.price.singlePrice * 2 && (
                      <p className="text-green-600 text-sm mt-1 font-medium">
                        💰 Ahorro: ${(config.price.singlePrice * 2 - config.price.doublePrice).toLocaleString('es-AR')} por par
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle className="w-5 h-5" /> ¡Guardado!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
