'use client'
import { createContext, useContext, useState, useEffect } from 'react'

export type Ambiente = 'upa' | 'hospital'

interface AmbienteCtx {
  ambiente: Ambiente
  setAmbiente: (a: Ambiente) => void
}

const Ctx = createContext<AmbienteCtx>({ ambiente: 'upa', setAmbiente: () => {} })

export function AmbienteProvider({ children }: { children: React.ReactNode }) {
  const [ambiente, setAmbienteState] = useState<Ambiente>('upa')

  useEffect(() => {
    const saved = localStorage.getItem('preceptor_ambiente') as Ambiente
    if (saved === 'upa' || saved === 'hospital') setAmbienteState(saved)
  }, [])

  function setAmbiente(a: Ambiente) {
    setAmbienteState(a)
    localStorage.setItem('preceptor_ambiente', a)
  }

  return <Ctx.Provider value={{ ambiente, setAmbiente }}>{children}</Ctx.Provider>
}

export function useAmbiente() { return useContext(Ctx) }

export function AmbienteSwitcher() {
  const { ambiente, setAmbiente } = useAmbiente()

  return (
    <div className="flex items-center gap-1 p-1 bg-[#f0ede4] rounded-lg">
      <button
        onClick={() => setAmbiente('upa')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
          ambiente === 'upa'
            ? 'bg-white text-[#E24B4A] shadow-sm'
            : 'text-[#999] hover:text-[#666]'
        }`}
      >
        <span className="text-[10px]">🏥</span> UPA
      </button>
      <button
        onClick={() => setAmbiente('hospital')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
          ambiente === 'hospital'
            ? 'bg-white text-[#378ADD] shadow-sm'
            : 'text-[#999] hover:text-[#666]'
        }`}
      >
        <span className="text-[10px]">🏨</span> Hospital
      </button>
    </div>
  )
}
