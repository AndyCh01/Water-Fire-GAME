import React from 'react';
import { X, Keyboard, ShieldAlert, Droplets, Flame, Sparkles } from 'lucide-react';

interface ControlsModalProps {
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Guía y Controles de Water-Fire</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Characters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          {/* Watergirl */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-cyan-800/40">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-cyan-300 text-sm">Chica Agua (Water)</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Moverse:</span>
                <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white font-semibold">A / D</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Saltar:</span>
                <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white font-semibold">W</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Acción / Palanca:</span>
                <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white font-semibold">S</span>
              </div>
              <p className="text-[11px] text-cyan-400/90 pt-1">
                ✓ Camina seguro en agua azul.
                <br />
                ✗ Muere al tocar lava roja o ácido verde.
              </p>
            </div>
          </div>

          {/* Fireboy */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-orange-800/40">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="font-bold text-orange-300 text-sm">Chico Fuego (Fire)</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span>Moverse:</span>
                <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white font-semibold">← / →</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Saltar:</span>
                <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white font-semibold">↑</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Acción / Palanca:</span>
                <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white font-semibold">↓</span>
              </div>
              <p className="text-[11px] text-orange-400/90 pt-1">
                ✓ Camina seguro en lava roja.
                <br />
                ✗ Muere al tocar agua azul o ácido verde.
              </p>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 mb-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Alternar personaje en Modo 1 Jugador:</span>
            <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white font-semibold">Barra Espaciadora</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Reiniciar nivel instantáneamente:</span>
            <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-white font-semibold">Tecla R</span>
          </div>
        </div>

        {/* Boss Guardian mechanics */}
        <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/40 to-slate-900 p-4 rounded-xl border border-amber-500/40 mb-4">
          <div className="flex items-center gap-2 mb-2 text-amber-300 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>El Guardián del Nivel 3</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            El Titán Ancestral custodia la salida con un escudo impenetrable y envía <strong>ondas sísmicas</strong> por el suelo cuando golpea.
          </p>
          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
            <li><strong>¡Salta</strong> cuando veas la onda de choque aproximarse para no ser derrotado!</li>
            <li><strong>Agua</strong> debe ascender por el ala izquierda para canalizar la <strong>Runa de Agua</strong>.</li>
            <li><strong>Fuego</strong> debe ascender por el ala derecha para canalizar la <strong>Runa de Fuego</strong>.</li>
            <li>Al activar ambas runas, el Guardián quedará aturdido y la Gran Puerta se abrirá.</li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
        >
          Entendido, ¡a jugar!
        </button>
      </div>
    </div>
  );
};
