'use client'
import { useState } from 'react'
import { useAmbiente, AMBIENTES, type Ambiente } from '@/lib/AmbienteContext'

export function AmbienteSwitcher() {
  const { ambiente, setAmbiente } = useAmbiente()
  const [open, setOpen] = useState(false)

  const recursoLabels: Record<string, string> = {
    hemodinamica: 'Hemodinâmica',
    uti: 'UTI',
    cirurgia: 'Cirurgia emerg.',
    tomografia: 'Tomografia',
    laboratorio: 'Laboratório',
    hemotransfusao: 'Hemotransfusão',
    ventilacaoMecanica: 'VM invasiva',
    ecocardiograma: 'Ecocardiograma',
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:opacity-80"
        style={{ borderColor: ambiente.cor, color: ambiente.corTexto, background: ambiente.corBg }}
      >
        <span>{ambiente.emoji}</span>
        <span>{ambiente.labelCurto}</span>
        <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5 opacity-60">
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}>

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e2e0d8]">
              <div>
                <h2 className="text-lg font-bold">Selecionar ambiente de trabalho</h2>
                <p className="text-sm text-[#666] mt-0.5">O sistema adapta protocolos e alertas conforme o ambiente</p>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#aaa] hover:bg-[#f7f6f3] hover:text-[#1a1a1a] transition-all">
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Ambientes */}
            <div className="p-6 grid grid-cols-1 gap-3">
              {(Object.values(AMBIENTES) as typeof AMBIENTES[Ambiente][]).map((a) => {
                const selected = ambiente.id === a.id
                return (
                  <button key={a.id}
                    onClick={() => { setAmbiente(a.id); setOpen(false) }}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                      selected ? 'border-current' : 'border-[#e2e0d8] hover:border-[#ccc]'
                    }`}
                    style={selected ? { borderColor: a.cor, background: a.corBg } : {}}>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-2xl">{a.emoji}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{a.label}</span>
                            {selected && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: a.cor, color: 'white' }}>
                                Ativo
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#666] mt-0.5">{a.descricao}</div>
                        </div>
                      </div>

                      {/* Recursos disponíveis */}
                      <div className="flex flex-wrap gap-1 justify-end max-w-[260px]">
                        {Object.entries(a.recursos).map(([key, val]) => (
                          <span key={key}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              val
                                ? 'bg-[#edf7f2] text-[#27644a]'
                                : 'bg-[#f7f6f3] text-[#ccc] line-through'
                            }`}>
                            {recursoLabels[key]}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Alertas do ambiente */}
                    {a.alertas.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#e2e0d8]">
                        <div className="flex flex-col gap-1">
                          {a.alertas.map((alerta, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-[#BA7517]">
                              <span className="flex-shrink-0 mt-0.5">⚠️</span>
                              <span>{alerta}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
