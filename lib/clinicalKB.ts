export function parseLocal(text: string): string | null {
  const q = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const wm = q.match(/(\d{2,3})\s*kg/)
  const w = wm ? parseFloat(wm[1]) : null

  if (q.includes('noradrenalina') || (q.includes('nora') && q.includes('kg'))) return calcNora(w)
  if (q.includes('midazolam')) return calcMidazolam(w)
  if (q.includes('intubac') || q.includes('intubar') || q.includes(' rsi')) return calcIntubacao(w)
  if (q.includes('ketamina')) return calcKetamina(w)
  if (q.includes('insulina') || (q.includes('glicemia') && q.match(/\d{2,3}/))) return calcInsulina(q)
  if (q.includes('adrenalina') || q.includes('epinefrina')) return doseAdrenalina()
  if (q.includes('sepse')) return protoSepse()
  if (q.includes('avc')) return protoAVC()
  if (q.includes('iam') || q.includes('infarto')) return protoIAM()
  if (q.includes('anafilaxia')) return protoAnafilaxia()
  if (q.includes('convulsao') || q.includes('status epileptic')) return protoConvulsao()
  if (q.includes('asma') || q.includes('broncoespasmo')) return protoAsma()
  return null
}

function calcNora(w: number | null): string {
  if (!w) return '**Calculadora**\nInforme o peso. Ex: _noradrenalina 70kg_'
  const mcgMin = (0.05 * w).toFixed(1)
  const mlH = ((parseFloat(mcgMin) * 60) / 80).toFixed(1)
  return `**Noradrenalina** — ${w} kg\n\`\`\`\nDose inicial:  0,05 mcg/kg/min\n→ Resultado:   ${mcgMin} mcg/min\n\nDiluição:      4 mg em 50 ml SF\nConcentração:  80 mcg/ml\n\nVelocidade:    ${mlH} ml/h\n\`\`\`\nMeta PAM ≥65 mmHg. Preferir acesso central.`
}

function calcMidazolam(w: number | null): string {
  if (!w) return '**Midazolam**\nInforme o peso. Ex: _midazolam 80kg_'
  return `**Midazolam** — ${w} kg\n\`\`\`\nConvulsão  0,1–0,2 mg/kg → ${(0.1*w).toFixed(1)}–${(0.2*w).toFixed(1)} mg IV\nSedação    0,05 mg/kg    → ${(0.05*w).toFixed(1)} mg IV\nIndução    0,2–0,3 mg/kg → ${(0.2*w).toFixed(1)}–${(0.3*w).toFixed(1)} mg IV\n\`\`\`\n⚠️ Monitorar apneia e hipotensão.`
}

function calcIntubacao(w: number | null): string {
  if (!w) return '**RSI**\nInforme o peso. Ex: _intubação 80kg_'
  return `**Intubação RSI** — ${w} kg\n\`\`\`\n── Esquema 1 (padrão)\nEtomidato 0,3 mg/kg    ${(0.3*w).toFixed(1)} mg IV\nSuccinilcolina 1,5 mg/kg  ${(1.5*w).toFixed(0)} mg IV\n\n── Esquema 2 (instável/asma)\nKetamina 2 mg/kg       ${(2*w).toFixed(0)} mg IV\nRocurônio 1,2 mg/kg    ${(1.2*w).toFixed(0)} mg IV\n\n── Pré (3 min antes)\nFentanil 1–2 mcg/kg    ${(1*w).toFixed(0)}–${(2*w).toFixed(0)} mcg IV\n\`\`\`\nPré-oxigenar 3–5 min · VM: VC 6–8 ml/kg PI · FR 14–16 · PEEP 5`
}

function calcKetamina(w: number | null): string {
  if (!w) return '**Ketamina**\nInforme o peso. Ex: _ketamina 70kg_'
  return `**Ketamina** — ${w} kg\n\`\`\`\nIndução IOT 1,5–2 mg/kg → ${(1.5*w).toFixed(0)}–${(2*w).toFixed(0)} mg IV\nAnalgesia  0,3–0,5 mg/kg → ${(0.3*w).toFixed(0)}–${(0.5*w).toFixed(0)} mg IV\n\`\`\`\nMantém drive respiratório. Boa escolha na instabilidade HD.`
}

function calcInsulina(q: string): string {
  const m = q.match(/\b(\d{2,3})\b/)
  const glic = m ? parseInt(m[1]) : null
  if (!glic || glic < 100) return '**Insulina SC**\nInforme a glicemia. Ex: _insulina glicemia 380_'
  const tabela = [[150,0],[200,2],[250,4],[300,6],[350,8],[400,10],[Infinity,12]] as [number,number][]
  let dose = 0
  for (const [lim,d] of tabela) { if (glic < lim) { dose = d; break } }
  return `**Insulina Regular SC**\n\`\`\`\nGlicemia: ${glic} mg/dL\nDose:     ${dose === 0 ? 'Sem correção' : dose + ' UI SC'}\nReavaliar: 2h\n\`\`\`\n${glic >= 400 ? '⚠️ Glicemia crítica — investigar CAD. Considerar insulina EV.' : ''}`
}

function doseAdrenalina(): string {
  return `**Adrenalina (Epinefrina) 1:1.000**\n\`\`\`\nAnafilaxia — IM (lateral da coxa)\n  Adulto: 0,3–0,5 mg\n  Criança: 0,01 mg/kg (máx 0,5 mg)\n  Repetir a cada 5–15 min\n\nPCR — EV\n  1 mg a cada 3–5 min\n\`\`\`\n⚠️ IM é preferível ao SC. NUNCA protelar na anafilaxia.`
}

function protoSepse(): string {
  return `**Sepse — Bundle 1 hora**\n\n1. Lactato venoso\n2. Hemoculturas (2 pares antes do ATB)\n3. ATB amplo espectro em até 1h\n4. Cristaloide 30 ml/kg (Ringer ou SF)\n5. Noradrenalina se PAM <65 mmHg\n6. Reavaliar a cada 30 min\n\nMetas: PAM ≥65 · Débito urinário >0,5 ml/kg/h · Lactato clearance >10%/2h`
}

function protoAVC(): string {
  return `**AVC Isquêmico — Ações imediatas**\n\n1. TC crânio SEM contraste (excluir hemorragia)\n2. Não tratar PA <220/120 (sem trombolítico)\n3. Se elegível rt-PA: manter PA <185/110\n4. rt-PA 0,9 mg/kg IV (máx 90 mg) — janela 4,5h\n5. AAS 300 mg + Atorvastatina 80 mg\n6. Internação UAVC, cabeceira 30°\n\n⚠️ Contraindicar rt-PA se: hemorragia, anticoagulante, cirurgia recente`
}

function protoIAM(): string {
  return `**IAM com supra ST**\n\n1. AAS 300 mg mastigado (imediato)\n2. ECG 12 derivações (<10 min)\n3. Ticagrelor 180 mg VO\n4. HNF 70–100 UI/kg IV bólus\n5. Ativar hemodinâmica — meta porta-balão <90 min\n6. O2 se SatO2 <90%, monitor contínuo\n\n⚠️ Não usar Morfina rotineiramente.`
}

function protoAnafilaxia(): string {
  return `**Anafilaxia — 1ª linha é adrenalina IM**\n\n1. Adrenalina 0,3–0,5 mg IM (lateral da coxa)\n2. Decúbito dorsal + MMII elevados + O2 alto fluxo\n3. SF 0,9% 1–2L IV rápido se hipotensão\n4. Prometazina 25–50 mg IV/IM\n5. Hidrocortisona 200 mg IV\n6. Observação mínima 6–8h`
}

function protoConvulsao(): string {
  return `**Convulsão / Status epilepticus**\n\n0–5 min:   Midazolam 0,1–0,2 mg/kg IV (máx 10 mg)\n           ou Diazepam 0,15–0,2 mg/kg IV\n5–20 min:  Levetiracetam 60 mg/kg IV\n           ou Fenitoína 20 mg/kg IV\n>20 min:   Sedação + intubação + UTI\n\n⚠️ Sempre checar glicemia! Tiamina antes de glicose se etilismo.`
}

function protoAsma(): string {
  return `**Crise asmática grave**\n\n1. Salbutamol 2,5–5 mg NBZ (repetir 3× a cada 20 min)\n2. Ipratrópio 0,5 mg junto ao salbutamol\n3. Hidrocortisona 200 mg IV\n4. O2: meta SatO2 93–95%\n5. MgSO4 2g IV em 20 min se sem resposta\n6. VMNI se hipercapnia`
}
