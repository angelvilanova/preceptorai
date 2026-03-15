'use client'
import { useState } from 'react'

export function CalcModule() {
  return (
        <div className="p-4 flex flex-col gap-4" style={{ overflowY: 'auto', height: '100%', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      <VasoCalc />
      <SedacaoCalc />
      <InsulinaCalc />
      <MidazolamCalc />
    </div>
  )
}

function ResultBox({ rows }: { rows: [string, string, boolean?][] }) {
  return (
    <div className="mt-3 bg-[#f7f6f3] border border-[#e2e0d8] rounded-xl p-3 font-mono text-xs">
      {rows.map(([k, v, hi], i) => (
        <div key={i} className={`flex justify-between py-1 ${i < rows.length-1 ? 'border-b border-[#ece9e0]' : ''}`}>
          <span className="text-[#999]">{k}</span>
          <span className={hi ? 'text-[#E24B4A] font-bold text-sm' : 'font-semibold'}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function CalcCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e2e0d8] rounded-2xl p-4">
      <div className="text-sm font-semibold mb-3">{title}</div>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-center mb-2.5">
      <span className="text-xs text-[#666] w-28 flex-shrink-0">{label}</span>
      {children}
    </div>
  )
}

const inputCls = "flex-1 border border-[#e2e0d8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E24B4A] bg-[#f7f6f3] focus:bg-white transition-all"
const selectCls = "flex-1 border border-[#e2e0d8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#E24B4A] bg-[#f7f6f3]"

function VasoCalc() {
  const [med, setMed] = useState('nora')
  const [peso, setPeso] = useState('')
  const [dose, setDose] = useState('0.05')

  const p = parseFloat(peso)
  const d = parseFloat(dose)
  const concMg: Record<string,number> = { nora:4, adre:2, dopa:200 }
  const concMcgMl = (concMg[med]*1000)/50
  const mcgMin = d * p
  const mlH = (mcgMin*60/concMcgMl).toFixed(1)
  const names: Record<string,string> = { nora:'Noradrenalina', adre:'Adrenalina', dopa:'Dopamina' }

  return (
    <CalcCard title="💊 Vasopressores em infusão">
      <Row label="Medicação">
        <select className={selectCls} value={med} onChange={e => setMed(e.target.value)}>
          <option value="nora">Noradrenalina</option>
          <option value="adre">Adrenalina</option>
          <option value="dopa">Dopamina</option>
        </select>
      </Row>
      <Row label="Peso (kg)">
        <input className={inputCls} type="number" placeholder="70" value={peso} onChange={e => setPeso(e.target.value)} />
      </Row>
      <Row label="Dose">
        <select className={selectCls} value={dose} onChange={e => setDose(e.target.value)}>
          <option value="0.05">0,05 mcg/kg/min (inicial)</option>
          <option value="0.1">0,1 mcg/kg/min</option>
          <option value="0.2">0,2 mcg/kg/min</option>
          <option value="0.5">0,5 mcg/kg/min (alta)</option>
        </select>
      </Row>
      {p > 0 && <ResultBox rows={[
        ['Medicação', names[med]],
        ['Dose', `${d} mcg/kg/min`],
        [`→ ${mcgMin.toFixed(1)} mcg/min`, `${mlH} ml/h`, true],
        ['Diluição', `${concMg[med]} mg em 50 ml`],
        ['Concentração', `${concMcgMl.toFixed(0)} mcg/ml`],
      ]} />}
    </CalcCard>
  )
}

function SedacaoCalc() {
  const [peso, setPeso] = useState('')
  const [tipo, setTipo] = useState('rsi')
  const p = parseFloat(peso)

  const rows: [string,string,boolean?][] = p > 0
    ? tipo === 'rsi'
      ? [['Etomidato 0,3 mg/kg',`${(0.3*p).toFixed(1)} mg IV`,true],['Succinilcolina 1,5 mg/kg',`${(1.5*p).toFixed(0)} mg IV`,true],['Fentanil pré 2 mcg/kg',`${(2*p).toFixed(0)} mcg IV`]]
      : tipo === 'ket'
      ? [['Ketamina 2 mg/kg',`${(2*p).toFixed(0)} mg IV`,true],['Rocurônio 1,2 mg/kg',`${(1.2*p).toFixed(0)} mg IV`,true],['Fentanil pré 2 mcg/kg',`${(2*p).toFixed(0)} mcg IV`]]
      : [['Propofol 1,5–2 mg/kg',`${(1.5*p).toFixed(0)}–${(2*p).toFixed(0)} mg IV`,true],['Fentanil 2 mcg/kg',`${(2*p).toFixed(0)} mcg IV`,true],['Succinilcolina 1,5 mg/kg',`${(1.5*p).toFixed(0)} mg IV`]]
    : []

  return (
    <CalcCard title="🫁 Sedação para intubação (RSI)">
      <Row label="Peso (kg)">
        <input className={inputCls} type="number" placeholder="70" value={peso} onChange={e => setPeso(e.target.value)} />
      </Row>
      <Row label="Esquema">
        <select className={selectCls} value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="rsi">Etomidato + Succinilcolina</option>
          <option value="ket">Ketamina + Rocurônio</option>
          <option value="prop">Propofol + Fentanil</option>
        </select>
      </Row>
      {rows.length > 0 && <ResultBox rows={rows} />}
    </CalcCard>
  )
}

function InsulinaCalc() {
  const [glic, setGlic] = useState('')
  const [tipo, setTipo] = useState('normal')
  const g = parseFloat(glic)

  const escalas: Record<string,[number,number][]> = {
    normal: [[150,0],[200,2],[250,4],[300,6],[350,8],[400,10],[Infinity,12]],
    resist: [[150,0],[200,4],[250,6],[300,8],[350,12],[400,16],[Infinity,20]],
    fragil: [[150,0],[200,1],[250,2],[300,3],[350,4],[400,6],[Infinity,8]],
  }

  let dose = 0
  if (g > 0) for (const [lim,d] of escalas[tipo]) { if (g < lim) { dose = d; break } }

  return (
    <CalcCard title="🩸 Insulina subcutânea (escala móvel)">
      <Row label="Glicemia (mg/dL)">
        <input className={inputCls} type="number" placeholder="380" value={glic} onChange={e => setGlic(e.target.value)} />
      </Row>
      <Row label="Sensibilidade">
        <select className={selectCls} value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="normal">Normal</option>
          <option value="resist">Resistente</option>
          <option value="fragil">Frágil / Idoso</option>
        </select>
      </Row>
      {g > 0 && <ResultBox rows={[
        ['Glicemia', `${g} mg/dL`],
        ['Insulina Regular SC', dose === 0 ? 'Sem correção' : `${dose} UI`, true],
        ['Reavaliar em', '2h'],
        ...(g >= 400 ? [['⚠️ Investigar CAD', ''] as [string,string]] : []),
      ]} />}
    </CalcCard>
  )
}

function MidazolamCalc() {
  const [peso, setPeso] = useState('')
  const [tipo, setTipo] = useState('conv')
  const p = parseFloat(peso)

  const ranges: Record<string,[number,number]> = { conv:[0.1,0.2], sed:[0.05,0.05], ind:[0.2,0.3] }
  const [dMin, dMax] = ranges[tipo]

  return (
    <CalcCard title="⚡ Midazolam">
      <Row label="Peso (kg)">
        <input className={inputCls} type="number" placeholder="70" value={peso} onChange={e => setPeso(e.target.value)} />
      </Row>
      <Row label="Indicação">
        <select className={selectCls} value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="conv">Convulsão (0,1–0,2 mg/kg)</option>
          <option value="sed">Sedação leve (0,05 mg/kg)</option>
          <option value="ind">Indução (0,2–0,3 mg/kg)</option>
        </select>
      </Row>
      {p > 0 && <ResultBox rows={[
        ['Dose IV', dMin===dMax ? `${(dMin*p).toFixed(1)} mg` : `${(dMin*p).toFixed(1)}–${(dMax*p).toFixed(1)} mg`, true],
        ['Apresentação 5mg/ml', dMin===dMax ? `${((dMin*p)/5).toFixed(1)} ml` : `${((dMin*p)/5).toFixed(1)}–${((dMax*p)/5).toFixed(1)} ml`],
      ]} />}
    </CalcCard>
  )
}
