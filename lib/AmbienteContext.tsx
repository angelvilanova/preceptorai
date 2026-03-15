'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Ambiente = 'upa' | 'ps_hospitalar' | 'uti' | 'enfermaria' | 'samu'

export interface AmbienteConfig {
  id: Ambiente
  label: string
  labelCurto: string
  emoji: string
  cor: string
  corBg: string
  corTexto: string
  descricao: string
  recursos: {
    hemodinamica: boolean
    uti: boolean
    cirurgia: boolean
    tomografia: boolean
    laboratorio: boolean
    hemotransfusao: boolean
    ventilacaoMecanica: boolean
    ecocardiograma: boolean
  }
  alertas: string[]
}

export const AMBIENTES: Record<Ambiente, AmbienteConfig> = {
  upa: {
    id: 'upa',
    label: 'UPA 24h',
    labelCurto: 'UPA',
    emoji: '🏥',
    cor: '#E24B4A',
    corBg: '#FCEBEB',
    corTexto: '#791F1F',
    descricao: 'Unidade de Pronto Atendimento',
    recursos: {
      hemodinamica: false,
      uti: false,
      cirurgia: false,
      tomografia: true,
      laboratorio: true,
      hemotransfusao: false,
      ventilacaoMecanica: false,
      ecocardiograma: false,
    },
    alertas: [
      'Sem UTI — estabilizar e transferir casos graves',
      'Sem hemodinâmica — IAM com supra: transferência imediata',
      'Sem banco de sangue — politrauma grave: transferir',
      'Sem cirurgia de emergência — acionar SAMU para remoção',
    ],
  },
  ps_hospitalar: {
    id: 'ps_hospitalar',
    label: 'Pronto-Socorro Hospitalar',
    labelCurto: 'PS',
    emoji: '🏨',
    cor: '#378ADD',
    corBg: '#E6F1FB',
    corTexto: '#0C447C',
    descricao: 'Pronto-Socorro com suporte completo',
    recursos: {
      hemodinamica: true,
      uti: true,
      cirurgia: true,
      tomografia: true,
      laboratorio: true,
      hemotransfusao: true,
      ventilacaoMecanica: true,
      ecocardiograma: true,
    },
    alertas: [],
  },
  uti: {
    id: 'uti',
    label: 'UTI',
    labelCurto: 'UTI',
    emoji: '🫁',
    cor: '#7c3aed',
    corBg: '#f3f0ff',
    corTexto: '#4c1d95',
    descricao: 'Unidade de Terapia Intensiva',
    recursos: {
      hemodinamica: true,
      uti: true,
      cirurgia: true,
      tomografia: true,
      laboratorio: true,
      hemotransfusao: true,
      ventilacaoMecanica: true,
      ecocardiograma: true,
    },
    alertas: [
      'Foco em suporte avançado e monitorização contínua',
      'Priorizar protocolos de desmame e bundle de UTI',
    ],
  },
  enfermaria: {
    id: 'enfermaria',
    label: 'Enfermaria',
    labelCurto: 'ENF',
    emoji: '🛏️',
    cor: '#639922',
    corBg: '#EAF3DE',
    corTexto: '#27500A',
    descricao: 'Internação clínica',
    recursos: {
      hemodinamica: false,
      uti: false,
      cirurgia: false,
      tomografia: false,
      laboratorio: true,
      hemotransfusao: true,
      ventilacaoMecanica: false,
      ecocardiograma: false,
    },
    alertas: [
      'Sem monitorização contínua — acionar equipe de resposta rápida se deterioração',
      'Paciente grave: acionar UTI imediatamente',
    ],
  },
  samu: {
    id: 'samu',
    label: 'SAMU / Pré-hospitalar',
    labelCurto: 'SAMU',
    emoji: '🚑',
    cor: '#BA7517',
    corBg: '#FAEEDA',
    corTexto: '#633806',
    descricao: 'Atendimento pré-hospitalar',
    recursos: {
      hemodinamica: false,
      uti: false,
      cirurgia: false,
      tomografia: false,
      laboratorio: false,
      hemotransfusao: false,
      ventilacaoMecanica: false,
      ecocardiograma: false,
    },
    alertas: [
      'Recursos limitados — foco em estabilização e transporte rápido',
      'Acionar regulação médica para definir destino',
      'Sem laboratório — guiar por clínica e oximetria',
    ],
  },
}

interface AmbienteCtx {
  ambiente: AmbienteConfig
  setAmbiente: (a: Ambiente) => void
}

const Ctx = createContext<AmbienteCtx>({
  ambiente: AMBIENTES.ps_hospitalar,
  setAmbiente: () => {},
})

export function AmbienteProvider({ children }: { children: ReactNode }) {
  const [ambiente, setAmbienteState] = useState<AmbienteConfig>(AMBIENTES.ps_hospitalar)

  useEffect(() => {
    const saved = localStorage.getItem('preceptor_ambiente') as Ambiente | null
    if (saved && AMBIENTES[saved]) setAmbienteState(AMBIENTES[saved])
  }, [])

  function setAmbiente(a: Ambiente) {
    setAmbienteState(AMBIENTES[a])
    localStorage.setItem('preceptor_ambiente', a)
  }

  return <Ctx.Provider value={{ ambiente, setAmbiente }}>{children}</Ctx.Provider>
}

export function useAmbiente() { return useContext(Ctx) }
