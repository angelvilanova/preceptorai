'use client'
import { useState, useEffect } from 'react'
import { useAmbiente, type Ambiente } from '@/components/AmbienteContext'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Urgencia = 'vermelho' | 'laranja' | 'amarelo' | 'azul'

interface Step {
  titulo: string
  detalhe: string
  alerta?: string
  upa_only?: boolean
  hospital_only?: boolean
}

interface Protocol {
  id: string
  nome: string
  subtitulo: string
  icone: string
  urgencia: Urgencia
  categoria: string
  upa_aviso?: string       // aviso específico quando em UPA
  hospital_aviso?: string  // aviso específico quando em hospital
  steps: Step[]
  referencias?: string[]
  drogas_chave?: string[]
}

// ─── PALETA DE URGÊNCIA ───────────────────────────────────────────────────────

const urgenciaMeta: Record<Urgencia, { label: string; bg: string; text: string; dot: string }> = {
  vermelho: { label: 'Emergência imediata', bg: '#FCEBEB', text: '#8B1A1A', dot: '#E24B4A' },
  laranja:  { label: 'Muito urgente',        bg: '#FEF3E8', text: '#7A3D0A', dot: '#E8820C' },
  amarelo:  { label: 'Urgente',              bg: '#FEFBE8', text: '#6B5A00', dot: '#D4A017' },
  azul:     { label: 'Procedimento',         bg: '#E8F2FE', text: '#0C3A6B', dot: '#378ADD' },
}

// ─── BASE DE PROTOCOLOS ───────────────────────────────────────────────────────

const PROTOCOLS: Protocol[] = [
  {
    id: 'sepse',
    nome: 'Sepse e Choque Séptico',
    subtitulo: 'Surviving Sepsis Campaign 2021',
    icone: '🦠',
    urgencia: 'vermelho',
    categoria: 'Infectologia',
    drogas_chave: ['Noradrenalina', 'Piperacilina-Tazobactam', 'Meropenem', 'Hidrocortisona'],
    upa_aviso: 'Iniciar bundle 1h e acionar transferência para UTI se choque séptico confirmado.',
    hospital_aviso: 'Acionar UTI precocemente. Considerar cateter venoso central para noradrenalina.',
    steps: [
      {
        titulo: '1. Reconhecimento',
        detalhe: 'Suspeitar em: febre ou hipotermia + foco infeccioso + ≥2 critérios SIRS ou qSOFA ≥2 (FR>22, alteração nível consciência, PAS<100).',
        alerta: 'qSOFA ≥2 fora da UTI = alta mortalidade. Não aguardar confirmação laboratorial para iniciar conduta.',
      },
      {
        titulo: '2. Lactato venoso — imediato',
        detalhe: 'Coletar na 1ª avaliação. Lactato >2 mmol/L = sepse. Lactato >4 mmol/L = choque séptico (iniciar noradrenalina independente da PA).',
        alerta: 'Lactato elevado sem hipotensão já indica choque críptico — não subestimar.',
      },
      {
        titulo: '3. Hemoculturas — 2 pares',
        detalhe: 'Coletar ANTES do antibiótico. Sítios diferentes (preferencialmente periférico + central se já tiver acesso). Não atrasar ATB mais de 45 min para coleta.',
      },
      {
        titulo: '4. Antibioticoterapia em até 1 hora',
        detalhe: 'Sepse sem foco definido: Piperacilina-Tazobactam 4,5g IV 6/6h.\nChoque séptico: Meropenem 1g IV 8/8h + Vancomicina 25-30mg/kg IV (dose de ataque) se risco de MRSA.\nFoco urinário não complicado: Ceftriaxona 2g IV.',
        alerta: 'Cada hora de atraso no ATB aumenta mortalidade em 7%. Cubra empiricamente e deescalone com culturas.',
      },
      {
        titulo: '5. Ressuscitação volêmica',
        detalhe: 'Cristaloide (Ringer Lactato preferível ao SF 0,9%) 30 ml/kg em 30 min se hipoperfusão.\nReavaliar com critérios dinâmicos: variação de pressão de pulso, elevação passiva dos membros.\nEvitar sobrecarga: parar se sem melhora de hipoperfusão após 2L ou sinais de edema pulmonar.',
        alerta: 'Albumina 5% pode ser usada como adjuvante se albumina sérica <2g/dL.',
        hospital_only: true,
      },
      {
        titulo: '5. Ressuscitação volêmica — UPA',
        detalhe: 'Ringer Lactato 30 ml/kg em 30 min. Reavaliar: FC, PA, diurese, nível de consciência.\nSe sem resposta após 2L: iniciar noradrenalina e acionar transferência UTI.',
        upa_only: true,
      },
      {
        titulo: '6. Vasopressor se PAM <65 mmHg',
        detalhe: 'Noradrenalina 0,05–0,5 mcg/kg/min — primeira escolha.\nAccesso central preferencial; pode iniciar periférico calibroso (antecubital) por curto período.\nMeta PAM ≥65 mmHg (≥75 em hipertensos crônicos).\nAdrenalina como 2ª linha ou adjuvante.',
        alerta: 'Não aguardar acesso central para iniciar noradrenalina — periférico calibroso temporariamente.',
      },
      {
        titulo: '7. Hidrocortisona — se refratário',
        detalhe: 'Indicada se dose noradrenalina >0,25 mcg/kg/min por >4h sem atingir alvo.\nHidrocortisona 200 mg/dia IV em infusão contínua ou 50 mg 6/6h.',
        hospital_only: true,
      },
      {
        titulo: '8. Controle do foco',
        detalhe: 'Identificar e controlar foco infeccioso: drenagem de abscesso, remoção de cateter infectado, desbridamento.\nTCax se suspeita de abscesso intra-abdominal.',
        hospital_only: true,
      },
      {
        titulo: '8. Controle do foco e transferência — UPA',
        detalhe: 'Iniciar ATB, volume e vasopressor. Contatar SAMU/Central de leitos para transferência UTI.\nDocumentar lactato inicial, hora do ATB e resposta hemodinâmica para continuidade do cuidado.',
        upa_only: true,
      },
      {
        titulo: '9. Metas nas primeiras 6h',
        detalhe: 'PAM ≥65 mmHg · Diurese >0,5 ml/kg/h · Lactato clearance ≥10% em 2h · SvO2 >65% (se disponível) · Melhora do nível de consciência.',
      },
    ],
    referencias: ['Surviving Sepsis Campaign 2021', 'ILAS — Instituto Latino Americano de Sepse', 'CFM Resolução 2.156/2016'],
  },

  {
    id: 'iam',
    nome: 'IAM com Supradesnivelamento ST',
    subtitulo: 'STEMI — AHA/ESC 2023',
    icone: '❤️',
    urgencia: 'vermelho',
    categoria: 'Cardiologia',
    drogas_chave: ['AAS', 'Ticagrelor', 'Heparina', 'Fibrinolítico', 'Morfina'],
    upa_aviso: '⚠️ UPA sem hemodinâmica: fibrinólise é a 1ª linha se sintomas <12h e sem contraindicações. Acionar transferência imediatamente após.',
    hospital_aviso: 'Meta porta-balão <90 min. Acionar hemodinâmica imediatamente ao diagnóstico do ECG.',
    steps: [
      {
        titulo: '1. Diagnóstico rápido',
        detalhe: 'ECG 12 derivações em até 10 min da chegada. Critérios STEMI:\n• Supra ST ≥1mm em ≥2 derivações contíguas\n• Supra ST ≥2mm em V1-V4 (homens) / ≥1,5mm (mulheres)\n• BRE novo ou presumivelmente novo\n• Supra em aVR + supra difuso = oclusão de TCE ou DA proximal',
        alerta: 'Infarto de parede inferior: sempre fazer V3R/V4R para descartar IAM de VD — contraindicar nitrato!',
      },
      {
        titulo: '2. Antiagregação dupla — imediata',
        detalhe: 'AAS 300 mg mastigado (dose de ataque) → manutenção 100 mg/dia.\nTicagrelor 180 mg VO (preferível) ou Clopidogrel 600 mg se Ticagrelor indisponível.\nPresasugrel 60 mg: apenas em pacientes que irão para ICP, sem AVC prévio, <75 anos.',
        alerta: 'Não usar Morfina + Ticagrelor juntos — Morfina reduz absorção do antiagregante. Se dor intensa: Fentanil 25-50 mcg IV.',
      },
      {
        titulo: '3. Anticoagulação',
        detalhe: 'HNF (Heparina não fracionada): 70-100 UI/kg IV bolus (máx 5.000 UI) se ICP planejada.\nEnoxaparina: 30mg IV bolus + 1mg/kg SC se fibrinólise ou conservador.\nFondaparinux 2,5mg SC: alternativa no conservador (não usar na ICP).',
      },
      {
        titulo: '4A. ICP primária — Hospital com hemodinâmica',
        detalhe: 'Estratégia de escolha se disponível em <120 min (porta-balão <90 min).\nAcionar equipe de hemodinâmica ao diagnóstico do ECG — não aguardar troponina.\nTransportar diretamente da sala de emergência ao catlab.',
        hospital_only: true,
        alerta: 'Porta-balão >90 min = aumento significativo de mortalidade. Não protelar por exames laboratoriais.',
      },
      {
        titulo: '4B. Fibrinólise — UPA / sem hemodinâmica disponível',
        detalhe: 'Indicada se: sintomas <12h + sem contraindicações + hemodinâmica indisponível em <120 min.\n\nTenecteplase (TNK) — dose em bolus IV único:\n• <60 kg: 30 mg · 60–70 kg: 35 mg · 70–80 kg: 40 mg\n• 80–90 kg: 45 mg · >90 kg: 50 mg (máx)\n\nAlteplase: 15 mg bolus → 0,75 mg/kg em 30 min → 0,5 mg/kg em 60 min.',
        upa_only: true,
        alerta: 'Contraindicações absolutas: AVC hemorrágico prévio, AVC isquêmico <3 meses, neoplasia SNC, TCE grave <3 meses, dissecção de aorta, sangramento interno ativo.',
      },
      {
        titulo: '4B. Fibrinólise — alternativa no hospital',
        detalhe: 'Se hemodinâmica não disponível em <120 min da chegada ou <90 min do diagnóstico, considerar fibrinólise e transferência.\nApós fibrinólise: transferência para ICP de resgate em <24h.',
        hospital_only: true,
      },
      {
        titulo: '5. Critérios de reperfusão (pós-fibrinólise)',
        detalhe: 'Avaliar 60-90 min após fibrinólise:\n✓ Redução ≥50% do supra ST na derivação de maior supra\n✓ Dor aliviada\n✓ Arritmia de reperfusão (RIVA — não tratar se bem tolerado)\n\nSe AUSÊNCIA de reperfusão: ICP de resgate imediata.',
        upa_only: true,
      },
      {
        titulo: '6. Suporte e monitorização',
        detalhe: 'Monitor cardíaco contínuo · Oximetria · 2 acessos periféricos calibrosos.\nO2 apenas se SatO2 <90% — hiperoxia aumenta área de infarto!\nNitrato: sublingual se dor isquêmica sem hipotensão e sem IAM de VD.',
      },
      {
        titulo: '7. Complicações precoces',
        detalhe: 'Choque cardiogênico: Dobutamina 2,5–20 mcg/kg/min + suporte hemodinâmico.\nFibrilação ventricular: desfibrilação 200J bifásico imediato.\nBloqueio AV total no IAM inferior: atropina 0,5-1mg IV; marcapasso transcutâneo se refratário.\nEdema agudo pulmonar: Furosemida 40-80mg IV + VNI.',
        alerta: 'IAM de VD: evitar diuréticos, nitratos e morfina. Expansão volêmica + dobutamina.',
      },
    ],
    referencias: ['ESC Guidelines STEMI 2023', 'SBC Diretriz IAM com Supra 2019', 'AHA STEMI 2022 Update'],
  },

  {
    id: 'avc',
    nome: 'AVC Isquêmico Agudo',
    subtitulo: 'Janela trombolítica e trombectomia',
    icone: '🧠',
    urgencia: 'vermelho',
    categoria: 'Neurologia',
    drogas_chave: ['Alteplase (rt-PA)', 'AAS', 'Atorvastatina', 'Labetalol', 'Nicardipino'],
    upa_aviso: '⚠️ UPA: iniciar rt-PA se elegível (não aguardar transferência). Acionar SAMU para transferência urgente a hospital com tomógrafo e neurologia.',
    hospital_aviso: 'Acionar time de AVC imediatamente. Trombectomia mecânica disponível até 24h em casos selecionados.',
    steps: [
      {
        titulo: '1. Código AVC — primeiros 10 minutos',
        detalhe: 'NIHSS rápido + tempo de início dos sintomas (ou última vez visto bem).\nGlicemia capilar imediata — hipoglicemia mimetiza AVC!\nTC crânio sem contraste em até 25 min da chegada.',
        alerta: 'Não tratar PA antes da TC — hipertensão pode ser protetora na fase aguda.',
      },
      {
        titulo: '2. TC crânio sem contraste',
        detalhe: 'Excluir: hemorragia intracraniana, lesão ocupando espaço, isquemia precoce extensa (>1/3 território ACM).\nAchados precoces de isquemia NÃO contraindicam trombólise (exceto se >1/3 ACM).\nAngioTC se suspeita de oclusão de grande vaso (trombectomia).',
        hospital_only: true,
      },
      {
        titulo: '2. TC crânio — UPA',
        detalhe: 'Se disponível: realizar imediatamente. Se indisponível: decisão clínica baseada em NIHSS + tempo de sintomas.\nIniciar rt-PA se elegível clinicamente — não aguardar TC para transferir se paciente em janela e sem sinais de sangramento.',
        upa_only: true,
        alerta: 'Em caso de dúvida: o risco de não tratar supera o risco de trombólise na maioria dos pacientes elegíveis.',
      },
      {
        titulo: '3. Controle pressórico',
        detalhe: 'SEM trombolítico: não tratar PA <220/120 mmHg. Tratar apenas se encefalopatia hipertensiva, dissecção, IAM concomitante.\nCOM trombolítico: manter PA <185/110 antes e <180/105 por 24h após.\nDroga de escolha: Labetalol 10-20 mg IV lento ou Nicardipino 5 mg/h em infusão.',
        alerta: 'Redução abrupta da PA piora perfusão na penumbra isquêmica. Reduzir no máximo 15% nas primeiras 24h (sem trombolítico).',
      },
      {
        titulo: '4. Trombólise IV — Alteplase (rt-PA)',
        detalhe: 'Indicada se: sintomas <4,5h (ou acordou com sintomas + último bem <9h com imagem favorável).\nDose: 0,9 mg/kg IV (máx 90 mg) — 10% em bolus em 1 min + 90% em 60 min.\n\nCriterios de elegibilidade simplificados:\n• AVC isquêmico com déficit neurológico mensurável\n• TC sem hemorragia\n• Sintomas <4,5h\n• PA controlável <185/110',
        alerta: 'Contraindicações absolutas: AVC/TCE grave <3 meses · Hemorragia intracraniana prévia · Neoplasia SNC · Cirurgia grande <14 dias · Plaquetas <100.000 · INR >1,7 · Uso de anticoagulante direto nas últimas 48h',
      },
      {
        titulo: '5. Trombectomia mecânica',
        detalhe: 'Considerar se: oclusão de grande vaso (ACM M1/M2, ACI, basilar) confirmada em angioTC.\nJanela: até 6h para AVC de circulação anterior; até 24h se imagem favorável (DAWN/DEFUSE-3).\nRealizar mesmo após rt-PA (não são excludentes).',
        hospital_only: true,
        alerta: 'Trombectomia NÃO é disponível em UPA — acionar transferência imediata para centro de AVC.',
      },
      {
        titulo: '6. Monitorização nas primeiras 24h',
        detalhe: 'Neurológico horário (NIHSS) · Pressão arterial a cada 15 min nas 2h pós-trombolítico · Glicemia 4/4h (meta 140-180 mg/dL) · Temperatura (tratar febre >37,5°C — piora prognóstico) · SatO2 >94%.',
        alerta: 'Sinais de transformação hemorrágica pós-rt-PA: piora neurológica súbita + cefaleia + vômito. Interromper infusão imediatamente. TC de urgência.',
      },
      {
        titulo: '7. Antitrombótico após 24h',
        detalhe: 'AVC cardioembólico (FA): anticoagulação plena após 48–72h se infarto pequeno; 7–14 dias se grande.\nNão cardioembólico: AAS 100–300 mg/dia + Clopidogrel 75 mg por 21 dias (POINT/CHANCE), depois monoterapia.\nEstatina: Atorvastatina 80 mg imediatamente.',
      },
      {
        titulo: '8. Internação e reabilitação',
        detalhe: 'UAVC (Unidade de AVC) reduz mortalidade em 25% vs enfermaria geral.\nCabeceira 0° nas primeiras 24h se sem risco de aspiração (melhora perfusão).\nFisioterapia e fonoaudiologia em até 24h.',
        hospital_only: true,
      },
    ],
    referencias: ['AHA/ASA Guidelines AVC Isquêmico 2019 + Update 2022', 'SBN Protocolo AVC 2022', 'ANVISA RT-PA bula brasileira'],
  },

  {
    id: 'anafilaxia',
    nome: 'Anafilaxia',
    subtitulo: 'Reação alérgica grave — WAO 2020',
    icone: '⚡',
    urgencia: 'vermelho',
    categoria: 'Emergência',
    drogas_chave: ['Adrenalina 1:1.000', 'SF 0,9%', 'Hidrocortisona', 'Prometazina'],
    steps: [
      {
        titulo: '1. Diagnóstico clínico — não esperar exames',
        detalhe: 'Anafilaxia = provável se ≥1 critério:\n• Início agudo com acometimento de pele/mucosas + comprometimento respiratório ou cardiovascular\n• 2 ou mais sistemas acometidos após exposição a alérgeno\n• Hipotensão isolada após exposição conhecida\n\nGatilhos: medicamentos (principal), alimentos, picadas de insetos, látex, contraste.',
        alerta: 'A morte por anafilaxia ocorre em minutos. A adrenalina nunca deve ser protelada por hesitação diagnóstica.',
      },
      {
        titulo: '2. Adrenalina IM — primeira e mais importante medida',
        detalhe: 'Adrenalina 1:1.000 (1 mg/ml) — face anterolateral da coxa (vastus lateralis):\n• Adulto: 0,3–0,5 mg (0,3–0,5 ml) IM\n• Criança: 0,01 mg/kg IM (máx 0,5 mg)\n\nRepetir a cada 5–15 min se necessário. 2ª ou 3ª dose IM são seguras.\nVia IM é SUPERIOR à SC (absorção mais rápida e confiável).',
        alerta: 'A adrenalina IM na coxa é o único tratamento que salva vidas na anafilaxia. Anti-histamínico e corticoide NÃO são primeira linha.',
      },
      {
        titulo: '3. Posição e oxigênio',
        detalhe: 'Decúbito dorsal com MMII elevados (melhora retorno venoso) — exceto se dispneia intensa ou vômitos.\nGestante: decúbito lateral esquerdo.\nO2 alto fluxo: 8–15 L/min por máscara com reservatório.\nNão sentar ou deixar em pé — colapso cardiovascular pode ser imediato.',
      },
      {
        titulo: '4. Acesso venoso e volume',
        detalhe: 'SF 0,9% 1–2L IV rápido se hipotensão (adulto). 10–20 ml/kg em crianças.\nPode ser necessário volume agressivo — anafilaxia causa redistribuição maciça de fluidos.',
      },
      {
        titulo: '5. Adrenalina EV — se choque refratário',
        detalhe: 'Apenas se sem resposta às doses IM e volume:\n• Adrenalina 0,1 mg (1 ml da ampola 1:1.000 diluídos em 9 ml SF = 0,1 mg/ml) IV lento em 5–10 min\n• Ou infusão: 0,1–1 mcg/kg/min\nMonitorização contínua obrigatória.',
        alerta: 'Adrenalina IV em bolus sem diluição pode causar FV. Sempre diluir e monitorizar.',
      },
      {
        titulo: '6. Adjuvantes — após estabilização',
        detalhe: 'Anti-H1: Prometazina 25–50 mg IM/IV (não substitui adrenalina — apenas alivia urticária/prurido).\nCorticoide: Hidrocortisona 200 mg IV ou Metilprednisolona 125 mg IV (efeito tardio em 4–6h — previne reação bifásica).\nBroncoespasmo resistente: Salbutamol nebulizado.',
      },
      {
        titulo: '7. Reação bifásica — observação obrigatória',
        detalhe: 'Manter observação por 6–8h após estabilização (reação bifásica em 1–20% dos casos).\nCritérios para observação >12h: uso de múltiplas doses de adrenalina, asma grave prévia, reação severa.\nAlta: com prescrição de adrenalina autoinjetável (EpiPen) + encaminhamento para alergologista.',
        alerta: 'Não liberar precocemente mesmo com melhora rápida.',
      },
    ],
    referencias: ['WAO Anafilaxia Guidelines 2020', 'SBAI Protocolo Anafilaxia 2021', 'UpToDate Anaphylaxis 2023'],
  },

  {
    id: 'intubacao',
    nome: 'Intubação de Sequência Rápida',
    subtitulo: 'RSI — Protocolo ACEP/SEMER',
    icone: '🫁',
    urgencia: 'azul',
    categoria: 'Procedimento',
    drogas_chave: ['Etomidato', 'Succinilcolina', 'Ketamina', 'Rocurônio', 'Fentanil'],
    steps: [
      {
        titulo: '1. Indicação e preparação — SOAPME',
        detalhe: 'Indicações: insuficiência respiratória, rebaixamento de consciência (Glasgow ≤8), obstrução de via aérea, falência ventilatória iminente.\n\nSSOAPME: Sucção (aspirador), O2 (100% × 3–5 min), Aparelhagem (laringoscópio, guia, seringa), Posição (rampa/sniffing), Medicações (prontas e calcula das), Extremos (videolaringoscópio, cricotireoidotomia).',
        alerta: 'Se predição de via aérea difícil (LEMON: Look, Evaluate 3-3-2, Mallampati, Obstruction, Neck): chamar ajuda ANTES de sedar.',
      },
      {
        titulo: '2. Pré-oxigenação — 3–5 min',
        detalhe: 'O2 100% por máscara com reservatório a 15 L/min — desnitrogenar (alvo SatO2 >95%).\nSe SatO2 <93%: BVM passiva com PEEP (válvula PEEP 5 cmH2O) ou VNI 2–3 min.\nOxigenoterapia apneica: cânula nasal 15 L/min mantida durante laringoscopia — aumenta apneia segura.',
      },
      {
        titulo: '3. Pré-medicação — 3 min antes (opcional)',
        detalhe: 'Fentanil 2–3 mcg/kg IV (atenua resposta simpática — útil em IAM, HIC, dissecção).\nAtropina 0,02 mg/kg IV em crianças <5 anos (previne bradicardia por succinilcolina).\nNão usar lidocaína IV rotineiramente.',
      },
      {
        titulo: '4. Indução — dose calculada pelo peso',
        detalhe: 'ESQUEMA 1 — PADRÃO:\n• Etomidato 0,3 mg/kg IV rápido (hemodinamicamente neutro)\n• + Succinilcolina 1,5 mg/kg IV rápido\n\nESQUEMA 2 — INSTABILIDADE HEMODINÂMICA / ASMA / BRONCOESPASMO:\n• Ketamina 1,5–2 mg/kg IV (broncodilatador, mantém PA)\n• + Rocurônio 1,2 mg/kg IV\n\nESQUEMA 3 — CONTRAINDICAÇÃO À SUCCINILCOLINA:\n(hipercalemia, queimadura >24h, rabdomiólise, paralisia crônica)\n• Rocurônio 1,2 mg/kg IV (SUGARSC: sugamadex disponível?)',
        alerta: 'Succinilcolina contraindicada em: hipercalemia, lesão muscular crônica, imobilização >72h, miopatias, grandes queimados após 24h.',
      },
      {
        titulo: '5. Laringoscopia e intubação',
        detalhe: 'Aguardar fasciculações + relaxamento (45–60s para succinilcolina, 60–90s para rocurônio).\nPressão cricóide (Sellick): opcional, pode piorar visualização — usar criteriosamente.\nTamanho do tubo: homem 7,5–8,0; mulher 7,0–7,5. Cuff insuflado a 20–25 cmH2O.',
        alerta: 'Máximo 2 tentativas de laringoscopia antes de acionar plano de via aérea difícil (supraglótico + videolaringoscópio).',
      },
      {
        titulo: '6. Confirmação de posição',
        detalhe: 'Capnografia de onda contínua — padrão-ouro (>3 ondas no traçado).\nAusculta: bilateral + epigástrio (sem borborigmos).\nRx de tórax: 2–3 cm acima da carina (4° dedo do médio no esterno).\nSatO2 demora para cair — não é bom indicador precoce de entubação esofágica.',
        alerta: 'Sem capnografia: usar detector colorimétrico de CO2 (muda de roxo para amarelo se traqueal).',
      },
      {
        titulo: '7. Parâmetros iniciais do ventilador',
        detalhe: 'Volume corrente: 6–8 ml/kg do PESO IDEAL (não peso real).\nFrequência: 12–16 ipm · PEEP: 5 cmH2O · FiO2: 100% → titular para SatO2 94–98%.\nPressão de platô alvo: <30 cmH2O.\n\nPeso ideal (homem): 50 + 0,91 × (altura cm – 152,4)\nPeso ideal (mulher): 45,5 + 0,91 × (altura cm – 152,4)',
      },
      {
        titulo: '8. Sedação e analgesia pós-IOT',
        detalhe: 'Iniciar imediatamente — succinilcolina dura 10–15 min, rocurônio 30–60 min!\nSedação: Midazolam 0,05 mg/kg/h + Fentanil 1–2 mcg/kg/h (ou Propofol 5–50 mcg/kg/min se disponível).\nMeta: RASS –2 a –3 (sedação leve-moderada).',
        alerta: 'Não deixar paciente acordar paralisado — causa trauma psicológico grave (paralisia consciente).',
      },
    ],
    referencias: ['ACEP Clinical Policy RSI 2022', 'UpToDate RSI Adults 2023', 'SEMER Protocolo Nacional IOT'],
  },

  {
    id: 'asma',
    nome: 'Crise Asmática Grave',
    subtitulo: 'GINA 2023 — Exacerbação grave',
    icone: '💨',
    urgencia: 'laranja',
    categoria: 'Pneumologia',
    drogas_chave: ['Salbutamol', 'Ipratrópio', 'Hidrocortisona', 'MgSO4', 'Ketamina'],
    steps: [
      {
        titulo: '1. Classificação de gravidade',
        detalhe: 'GRAVE: FR>30, SpO2<92%, incapaz de falar frases completas, uso intenso de musculatura acessória, PFE <50% do previsto.\nQUASE FATAL: cianose, rebaixamento de consciência, exaustão, acidose respiratória (CO2 >45 com FR>25), silêncio auscultatório ("peito silencioso" = obstrução grave).',
        alerta: '"Peito silencioso" = emergência extrema. O paciente não está melhorando — está se cansando.',
      },
      {
        titulo: '2. SABA nebulizado — imediato e repetido',
        detalhe: 'Salbutamol (Fenoterol) 2,5–5 mg (20 gotas) em NBZ com O2 6–8 L/min.\nRepetir a cada 20 min por 3 doses na 1ª hora (protocolo intensivo).\nGrave: nebulização contínua (10–15 mg/h) se não houver melhora.\nAlternativa: Salbutamol spray 4–8 jatos com espaçador (tão eficaz quanto NBZ).',
      },
      {
        titulo: '3. Ipratrópio — associar nas primeiras 3 doses',
        detalhe: 'Brometo de ipratrópio 0,5 mg junto ao salbutamol em cada uma das 3 primeiras nebulizações.\nNão adicionar após as 3 primeiras — benefício adicional mínimo depois de 1h.\nReduz hospitalização em 30% quando associado precocemente.',
      },
      {
        titulo: '4. Corticosteroide sistêmico — iniciar em até 1h',
        detalhe: 'Hidrocortisona 200 mg IV (preferível no grave) ou Metilprednisolona 125 mg IV.\nAlternativa leve/moderada: Prednisolona 40–60 mg VO.\nEfeito clínico em 4–6h — não aguardar melhora imediata para checar eficácia.\nManter por 5–7 dias (não precisa reduzir gradualmente em cursos curtos).',
      },
      {
        titulo: '5. O2 controlado',
        detalhe: 'Meta SatO2: 93–95% (não 100% — hiperoxia pode piorar V/Q).\nMáscara de Venturi se disponível para controle preciso de FiO2.\nSe SpO2 <90% com O2 convencional: escalar para VNI antes da IOT.',
      },
      {
        titulo: '6. Sulfato de Magnésio — crise grave refratária',
        detalhe: 'MgSO4 2g IV em 20 min (adulto) se sem resposta adequada ao SABA após 1h ou PFE <25%.\nMecanismo: relaxamento da musculatura lisa brônquica (antagonismo de cálcio).\nSeguro: monitorar PA e reflexos patelares. Dose pediátrica: 40 mg/kg (máx 2g).',
        alerta: 'Hipotensão durante infusão: reduzir velocidade. Abolição de reflexos: parar imediatamente (toxicidade por magnésio).',
      },
      {
        titulo: '7. VNI — alternativa antes da IOT',
        detalhe: 'Considerar CPAP ou BiPAP se: PaCO2 crescente, SpO2 <92% com O2 convencional, exaustão iminente.\nBiPAP: IPAP 10–14 cmH2O / EPAP 4–6 cmH2O.\nContraindicar se: rebaixamento de consciência, vômitos, incapacidade de cooperar.',
        hospital_only: true,
      },
      {
        titulo: '8. Intubação — último recurso na asma',
        detalhe: 'Indicações: PCR, apneia, rebaixamento de consciência, exaustão com hipercapnia crescente.\nIndução: Ketamina 1,5–2 mg/kg (broncodilatador) + Rocurônio 1,2 mg/kg.\nVentilação permissiva: FR baixa (8–12) + Ti curto + Tempo expiratório longo (I:E 1:4) para prevenir hiperinsuflação dinâmica (auto-PEEP).',
        alerta: 'Auto-PEEP na asma intubada = hipotensão + PCR. Se hipotenso após IOT: desconectar do ventilador e comprimir tórax manualmente (libera ar aprisionado).',
      },
    ],
    referencias: ['GINA Global Strategy Asthma 2023', 'SBPT Diretrizes Asma 2020', 'BTS/SIGN Asthma Guidelines 2022'],
  },

  {
    id: 'convulsao',
    nome: 'Status Epilepticus',
    subtitulo: 'NCS Guidelines 2012 + Update 2023',
    icone: '⚡',
    urgencia: 'vermelho',
    categoria: 'Neurologia',
    drogas_chave: ['Midazolam', 'Diazepam', 'Levetiracetam', 'Fenitoína', 'Fenobarbital'],
    steps: [
      {
        titulo: '1. Definição e tipos',
        detalhe: 'Status epilepticus convulsivo (SEC): convulsão >5 min OU ≥2 convulsões sem recuperação entre elas.\nStatus não-convulsivo (SENC): alteração de consciência sem convulsão (diagnóstico pelo EEG).\nSEC refratário: sem resposta a 2 antiepilépticos IV.\nSEC super-refratário: sem resposta após 24h de anestesia geral.',
        alerta: 'Após 5 min de convulsão: iniciar tratamento imediatamente (não aguardar "parar sozinha").',
      },
      {
        titulo: '2. Medidas gerais imediatas',
        detalhe: 'Posição lateral de segurança · O2 alto fluxo · Aspirar secreções · 2 acessos venosos.\nGlicemia capilar IMEDIATA — hipoglicemia causa convulsão refratária!\nSe glicemia <60: Tiamina 100 mg IV ANTES da glicose (alcoólicos/desnutridos) → SG 50% 50 ml IV.\nMonitorização: ECG, oximetria, capnografia se rebaixado.',
        alerta: 'Nunca introduzir objeto na boca — risco de fratura dentária e lesão do socorrista. Não conter forçadamente os movimentos.',
      },
      {
        titulo: '3. Fase 1 — BZD: 0–5 minutos',
        detalhe: 'PRIMEIRA ESCOLHA:\n• Midazolam 0,2 mg/kg IM (máx 10 mg) — se sem acesso venoso (tão eficaz quanto IV no SEC)\n• Midazolam 0,1–0,2 mg/kg IV (máx 10 mg) — se com acesso\n\nALTERNATIVA:\n• Diazepam 0,15–0,2 mg/kg IV (máx 10 mg) — pode repetir 1× após 5 min\n• Lorazepam 0,1 mg/kg IV (máx 4 mg) — se disponível (não disponível no Brasil em IV)\n\nRepetir BZD 1× se sem resposta em 5 min.',
      },
      {
        titulo: '4. Fase 2 — Antiepiléptico IV: 5–20 minutos',
        detalhe: 'Iniciar SIMULTANEAMENTE ao BZD se convulsão >10 min:\n\nLEVETIRACETAM 60 mg/kg IV em 10 min (máx 4.500 mg) — 1ª escolha (menos efeitos)\nou\nFENITOÍNA 20 mg/kg IV a 50 mg/min (máx 1.500 mg) — monitorizar ECG\nLa — sempre em SF (precipita em SG)\nou\nVALPROATO 40 mg/kg IV em 10 min (máx 3.000 mg) — evitar em <2 anos e hepatopatias\nou\nFENOBARBITAL 20 mg/kg IV a 100 mg/min — disponível na maioria das UPAs/hospitais.',
        alerta: 'Fenitoína: não infundir em SG · Monitorar ECG (arritmia) · Síndrome de infusão rápida (hipotensão + bradicardia).',
      },
      {
        titulo: '5. Fase 3 — SEC Refratário: >20 minutos',
        detalhe: 'Se sem resposta: intubar e sedar com anestésico.\n\nMIDAPROLAM infusão: 0,2 mg/kg bolus → 0,05–2 mg/kg/h\nPROPOFOL infusão: 1–2 mg/kg bolus → 20–200 mcg/kg/min (atenção: síndrome da infusão >48h)\nKETAMINA infusão: 1,5 mg/kg bolus → 1,2–7,5 mg/kg/h (crescente interesse no SEC refratário)\nTIOPENTAL: 2 mg/kg bolus → 3–7 mg/kg/h (reservado ao super-refratário)',
        hospital_only: true,
        alerta: 'EEG contínuo obrigatório no SEC refratário para monitorizar supressão de surto.',
      },
      {
        titulo: '5. SEC Refratário — UPA',
        detalhe: 'Se sem acesso a propofol/tiopental: Midazolam infusão contínua + intubação.\nAcionar UTI e preparar transferência imediata.\nManter BZD e antiepiléptico até transferência.',
        upa_only: true,
      },
      {
        titulo: '6. Investigação da causa',
        detalhe: 'Sempre investigar causa:\n• Eletrólitos (Na, K, Ca, Mg, glicose) · Gasometria · Hemograma · Função renal/hepática\n• Nível sérico de antiepilépticos se em uso\n• TC crânio (após estabilização): AVC, TCE, tumor, abscesso\n• Punção lombar se suspeita de meningite/encefalite (após TC e sem HIC)\n• Drogas/toxicologia se suspeita\n\nCausas comuns no Brasil: abandono de medicação, hipoglicemia, hiponatremia, AVC, alcoolismo, TCE, meningite.',
      },
    ],
    referencias: ['NCS Status Epilepticus Guidelines 2012 + 2023 Update', 'ILAE SE Classification 2015', 'SBN Protocolo SE 2020'],
  },

  {
    id: 'cetoacidose',
    nome: 'Cetoacidose Diabética (CAD)',
    subtitulo: 'ADA Standards 2023',
    icone: '🩸',
    urgencia: 'laranja',
    categoria: 'Endocrinologia',
    drogas_chave: ['Insulina Regular', 'Ringer Lactato', 'SF 0,9%', 'KCl', 'Bicarbonato'],
    steps: [
      {
        titulo: '1. Critérios diagnósticos',
        detalhe: 'CAD leve: pH 7,25–7,30 · Bicarbonato 15–18 · GAP anion >12 · Glicemia >250 · Cetonúria/cetonemia +\nCAD moderada: pH 7,0–7,25 · Bicarbonato 10–15\nCAD grave: pH <7,0 · Bicarbonato <10 · Alteração de consciência\n\nEHHO (hiperosmolar): glicemia >600 · Osmolalidade >320 · Sem acidose significativa.',
        alerta: 'CAD euglicêmica: pode ocorrer em uso de inibidores de SGLT2 (gliflozinas). Glicemia pode ser <250 — não exclui CAD!',
      },
      {
        titulo: '2. Monitorização e exames',
        detalhe: 'Gasometria venosa (pH venoso é confiável: subtrair 0,03 do pH arterial) · Eletrólitos · Ureia/creatinina · Glicemia horária · Cetonas (beta-OH-butirato se disponível) · ECG (hipocalemia causa arritmia).\nCateter urinário se oligúria ou coma.',
      },
      {
        titulo: '3. Hidratação — fase 1 (primeira hora)',
        detalhe: 'RINGER LACTATO preferível ao SF 0,9% (menos acidose hiperclorêmica).\nPhase inicial: 1L em 1h (adulto, sem ICC).\nSe choque: 1L em 15–30 min, repetir até PA estável.\nPediátrico: 10 ml/kg em 1h (máx 500 ml) — expansão lenta para evitar edema cerebral.',
        alerta: 'Edema cerebral pediátrico: principal causa de morte em crianças com CAD. Expansão lenta + evitar hipoosmolalidade rápida.',
      },
      {
        titulo: '4. Hidratação — fases 2 e 3',
        detalhe: 'Fase 2 (2ª–4ª hora): 500 ml/h de RL ou SF 0,45% se Na corrigido alto.\nFase 3 (após 4h): 250 ml/h ou conforme estado hídrico.\nTrocar para SG 5% + NaCl 0,45% quando glicemia <200 (mantém insulina, previne hipoglicemia).\n\nNa corrigido = Na medido + 1,6 × [(glicemia – 100)/100]',
      },
      {
        titulo: '5. Potássio — ANTES da insulina',
        detalhe: 'K+ <3,5 mEq/L: NÃO iniciar insulina. Repor KCl 20–40 mEq/h até K+ ≥3,5.\nK+ 3,5–5,5: Adicionar 20–30 mEq/L na solução de hidratação.\nK+ >5,5: Não repor; iniciar insulina; monitorizar a cada 2h.\n\nA insulina reduz K+ rapidamente — hipocalemia causa arritmia fatal!',
        alerta: 'Fazer ECG: onda U + QT longo = hipocalemia grave. Ondas T apiculadas = hipercalemia.',
      },
      {
        titulo: '6. Insulina regular EV',
        detalhe: 'Iniciar APÓS garantir K+ ≥3,5 e 1ª hora de hidratação.\nDose: 0,1 UI/kg/h em infusão contínua (sem bolus — evidência atual).\nMeta de queda glicêmica: 50–75 mg/dL/hora.\n\nSe queda <50 mg/dL/h na 1ª hora: dobrar a velocidade.\nSe queda >100 mg/dL/h: reduzir a velocidade pela metade.',
        alerta: 'Não parar insulina quando glicemia <200 — manter 0,02–0,05 UI/kg/h com SG 5%. Interromper apenas com resolução bioquímica (pH >7,3, GAP <12, bicarbonato >18).',
      },
      {
        titulo: '7. Bicarbonato — uso restrito',
        detalhe: 'Indicado APENAS se pH <6,9 (evidência fraca para pH 6,9–7,0).\nBicarbonato de sódio 8,4%: 100 mEq em 400 ml de SF 0,45% em 2h.\nNÃO usar rotineiramente — piora hipocalemia, alcalose de rebote e edema cerebral pediátrico.',
        alerta: 'Nunca usar bicarbonato sem correção de K+ — precipita arritmia.',
      },
      {
        titulo: '8. Resolução e transição para insulina SC',
        detalhe: 'Critérios de resolução: pH >7,3 · GAP anion <12 · Bicarbonato >18 · Aceitar dieta oral.\nTransição: aplicar insulina basal SC 1–2h ANTES de parar insulina EV.\nNão parar EV abruptamente — hiperglicemia de rebote.\nInvestigar fator precipitante: infecção (80%), abandono de insulina, IAM, pancreatite.',
      },
    ],
    referencias: ['ADA Standards of Care 2023 — CAD', 'SBD Posicionamento CAD/EHHO 2022', 'Kitabchi AE — Diabetes Care 2009 (clássico)'],
  },

  {
    id: 'edema_pulmonar',
    nome: 'Edema Agudo de Pulmão',
    subtitulo: 'EAP cardiogênico — ESC HF 2021',
    icone: '🫧',
    urgencia: 'vermelho',
    categoria: 'Cardiologia',
    drogas_chave: ['Furosemida', 'Nitroglicerina', 'Morfina', 'BiPAP', 'Dobutamina'],
    upa_aviso: 'VNI é a medida mais eficaz. Se indisponível: posição + O2 + Furosemida + nitrato.',
    steps: [
      {
        titulo: '1. Reconhecimento e posicionamento',
        detalhe: 'Quadro: dispneia súbita intensa, ortopneia, estertores em bases (crepitações em "maré montante"), SpO2 baixa, sudorese fria, ansiedade extrema.\nPosição: sentado com pernas para baixo (reduz pré-carga imediatamente).\nMonitorização: ECG contínuo, oximetria, PA não-invasiva a cada 5 min.',
        alerta: 'Não deitar o paciente — piora imediata da dispneia e do retorno venoso.',
      },
      {
        titulo: '2. VNI — medida mais eficaz',
        detalhe: 'CPAP 5–10 cmH2O ou BiPAP (IPAP 10–14 / EPAP 4–6 cmH2O).\nInício imediato — reduz mortalidade e IOT em ~50%.\nMeta: SpO2 >95%, FR <25, melhora da sensação de dispneia.\nReavaliar em 30–60 min: sem melhora = ajustar pressões ou intubar.',
        alerta: 'Não usar VNI em: rebaixamento de consciência, vômitos incoercíveis, instabilidade hemodinâmica grave sem vasoativas em curso.',
      },
      {
        titulo: '3. Furosemida IV',
        detalhe: 'Furosemida 40–80 mg IV em bolus (dobrar se em uso crônico de furosemida).\nEfeito venodilatador imediato (antes do efeito diurético) — benefício nos primeiros minutos.\nMeta diurese: 0,5–1 ml/kg/h. Repetir em 1h se resposta insuficiente.\nEspironolactona: não usar na fase aguda.',
      },
      {
        titulo: '4. Nitrato — se PA >100 mmHg',
        detalhe: 'Isossorbida dinitrato sublingual 5 mg (repetir a cada 5 min, máx 3 doses).\nNitroglicerina IV: iniciar 10–20 mcg/min → aumentar 10 mcg/min a cada 5 min (titulando PA).\nVenodilatador potente — reduz pré-carga rapidamente.\nContaindicado se: PA <90 mmHg, IAM de VD, uso de sildenafil nas últimas 24–48h.',
      },
      {
        titulo: '5. Morfina — uso controverso',
        detalhe: 'Morfina 2–4 mg IV: alivia ansiedade e pode reduzir pré-carga.\nEvidência atual questionável — associada a piores desfechos em alguns estudos (ALARM-HF).\nUsar apenas se ansiedade intensa e dor, com monitorização rigorosa.\nEvitar em DPOC e hipercapnia.',
        alerta: 'Morfina NÃO é mais recomendada como medida padrão no EAP — dar preferência a VNI e nitratos.',
      },
      {
        titulo: '6. EAP com hipotensão (PA <90 mmHg)',
        detalhe: 'Choque cardiogênico: Dobutamina 2,5–20 mcg/kg/min (inotrópico positivo).\nSe PA <70 mmHg: Noradrenalina 0,1–0,5 mcg/kg/min (vasopressor).\nNÃO usar nitrato se PA <90 mmHg.\nVNI com cuidado — pode reduzir ainda mais o DC.\nConsiderar balão intra-aórtico (BIA) em hospital.',
        alerta: 'EAP + hipotensão = choque cardiogênico. Mortalidade >40%. Suporte intensivo urgente.',
      },
      {
        titulo: '7. Investigar causa precipitante',
        detalhe: 'ECG: IAM (principal causa tratável — chame hemodinâmica!), FA com alta resposta ventricular.\nEcocardiograma: disfunção sistólica vs diastólica, valvopatia aguda.\nBNP/NT-proBNP, troponina, Rx tórax.\nCausas: IAM, crise hipertensiva, FA, abandono de diurético, endocardite, miocardite.',
      },
    ],
    referencias: ['ESC Heart Failure Guidelines 2021', 'SBC Diretriz IC 2018', 'ALARM-HF Registry 2021'],
  },

  {
    id: 'tep',
    nome: 'Tromboembolismo Pulmonar',
    subtitulo: 'TEP agudo — ESC 2019',
    icone: '🩺',
    urgencia: 'laranja',
    categoria: 'Pneumologia',
    drogas_chave: ['Enoxaparina', 'HNF', 'Alteplase', 'Rivaroxabana', 'Apixabana'],
    upa_aviso: 'TEP maciço: iniciar HNF + considerar fibrinólise sistêmica. Acionar transferência para centro com UTI.',
    steps: [
      {
        titulo: '1. Suspeita clínica e estratificação',
        detalhe: 'Suspeitar em: dispneia súbita, dor pleurítica, taquicardia, síncope, hipoxemia sem causa aparente.\nEscore de Wells simplificado:\n• Sinais de TVP: 1 · FC>100: 1 · Imobilização/cirurgia <4 sem: 1.5 · TVP/TEP prévio: 1.5 · Hemoptise: 1 · Neoplasia ativa: 1 · Diagnóstico alternativo menos provável: 3\nWells ≤4: probabilidade baixa/intermediária · Wells >4: alta probabilidade.',
      },
      {
        titulo: '2. Angiotomografia de tórax — padrão-ouro',
        detalhe: 'AngioTC tórax com contraste: sensibilidade 83%, especificidade 96%.\nUsar D-Dímero apenas se probabilidade baixa (Wells ≤4): D-Dímero negativo exclui TEP.\nECG: S1Q3T3 (clássico mas pouco sensível), taquicardia sinusal, BRD novo, inversão T V1-V4.\nEcocardiograma: disfunção de VD confirma TEP de risco alto.',
        hospital_only: true,
      },
      {
        titulo: '2. Avaliação na UPA',
        detalhe: 'Sem AngioTC disponível: estratificação clínica (Wells) + ECG + ecocardiograma (se disponível).\nD-Dímero se baixa probabilidade.\nTEP maciço (hipotensão + taquicardia + suspeita clínica): não aguardar confirmação — iniciar HNF e considerar fibrinólise.\nTransferência para hospital com AngioTC urgente.',
        upa_only: true,
      },
      {
        titulo: '3. Estratificação de risco',
        detalhe: 'ALTO RISCO (maciço): hipotensão (PAS<90 ou queda >40 mmHg) e/ou choque — mortalidade >15%.\nRISCO INTERMEDIÁRIO-ALTO: sem hipotensão + disfunção de VD (eco/AngioTC) + troponina elevada.\nRISCO INTERMEDIÁRIO-BAIXO: sem hipotensão + apenas 1 critério acima.\nBAIXO RISCO: PESI baixo, sem disfunção VD, troponina normal — candidato a alta precoce.',
      },
      {
        titulo: '4. Anticoagulação — iniciar se ≥probabilidade intermediária',
        detalhe: 'HNF (Heparina NF) EV: se alto risco ou candidato a fibrinólise/embolectomia.\nBolus 80 UI/kg → 18 UI/kg/h → ajustar por TTPa (alvo 60–80s).\n\nEnoxaparina 1 mg/kg SC 12/12h: risco intermediário e baixo, sem insuficiência renal grave.\n\nAnticoagulante oral direto (DOAC): Rivaroxabana 15 mg 12/12h × 3 sem ou Apixabana 10 mg 12/12h × 7 dias — alternativa simplificada se sem contraindicação.',
      },
      {
        titulo: '5. Fibrinólise — TEP maciço',
        detalhe: 'Indicada se: TEP maciço (hipotensão) sem contraindicações absolutas.\nAlteplase: 100 mg IV em 2h (ou 0,6 mg/kg em 15 min se parada cardíaca).\n\nContraindicações absolutas: AVC hemorrágico prévio, AVC isquêmico <3 meses, neoplasia SNC, sangramento interno ativo, cirurgia grande <3 semanas.\n\nApós fibrinólise: iniciar HNF sem bolus quando TTPa <80s.',
        alerta: 'Fibrinólise no TEP maciço salva vidas mas tem risco de 3% de hemorragia intracraniana — benefício supera risco na instabilidade hemodinâmica.',
      },
      {
        titulo: '6. Embolectomia cirúrgica / cateter — resgate',
        detalhe: 'Indicar se: TEP maciço com contraindicação à fibrinólise ou falha terapêutica.\nEmbolectomia por cateter (aspiração fragmentação): centros especializados.\nRealizar em conjunto com cardiologia e cirurgia cardiovascular.',
        hospital_only: true,
      },
    ],
    referencias: ['ESC TEP Guidelines 2019', 'SBC Diretriz TEP 2018', 'PESI Score validation studies'],
  },
]

// ─── CATEGORIAS ────────────────────────────────────────────────────────────────

const CATEGORIAS = ['Todas', 'Cardiologia', 'Neurologia', 'Infectologia', 'Pneumologia', 'Endocrinologia', 'Emergência', 'Procedimento']

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

interface Props {
  initialProto: string | null
  onProtoOpen: () => void
}

export function ProtocolsModule({ initialProto, onProtoOpen }: Props) {
  const { ambiente } = useAmbiente()
  const [selected, setSelected] = useState<Protocol | null>(null)
  const [categoria, setCategoria] = useState('Todas')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (initialProto) {
      const p = PROTOCOLS.find(p => p.id === initialProto)
      if (p) { setSelected(p); onProtoOpen() }
    }
  }, [initialProto])

  const filtrados = PROTOCOLS.filter(p => {
    const matchCat = categoria === 'Todas' || p.categoria === categoria
    const matchBusca = busca === '' ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.subtitulo.toLowerCase().includes(busca.toLowerCase()) ||
      p.drogas_chave?.some(d => d.toLowerCase().includes(busca.toLowerCase()))
    return matchCat && matchBusca
  })

  if (selected) return <ProtocolDetail protocol={selected} ambiente={ambiente} onBack={() => setSelected(null)} />

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Barra de busca + filtros */}
      <div className="px-4 pt-4 pb-3 border-b border-[#e2e0d8] bg-white space-y-3">
        <input
          className="w-full border border-[#e2e0d8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#E24B4A] bg-[#f7f6f3] focus:bg-white transition-all placeholder:text-[#aaa]"
          placeholder="Buscar protocolo ou medicamento..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIAS.map(c => (
            <button key={c} onClick={() => setCategoria(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                categoria === c
                  ? 'bg-[#E24B4A] text-white'
                  : 'bg-[#f7f6f3] text-[#666] hover:bg-[#ede9e0]'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Badge de ambiente */}
      <div className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${
        ambiente === 'upa'
          ? 'bg-[#FCEBEB] text-[#8B1A1A]'
          : 'bg-[#E8F2FE] text-[#0C3A6B]'
      }`}>
        <span>{ambiente === 'upa' ? '🏥' : '🏨'}</span>
        {ambiente === 'upa'
          ? 'Modo UPA — protocolos adaptados para recursos limitados e transferência'
          : 'Modo Hospital — protocolos completos com suporte especializado'}
      </div>

      {/* Grid de protocolos */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtrados.length === 0 ? (
          <div className="text-center text-sm text-[#aaa] py-12">Nenhum protocolo encontrado.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtrados.map(p => {
              const urg = urgenciaMeta[p.urgencia]
              return (
                <button key={p.id} onClick={() => setSelected(p)}
                  className="bg-white border border-[#e2e0d8] rounded-2xl p-4 text-left hover:border-[#ccc] hover:shadow-md transition-all group text-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: urg.bg }}>
                      {p.icone}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-[#1a1a1a] group-hover:text-[#E24B4A] transition-colors leading-snug">{p.nome}</div>
                      <div className="text-xs text-[#aaa] mt-0.5 leading-snug">{p.subtitulo}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: urg.dot }} />
                      <span className="text-[10px] font-medium" style={{ color: urg.text }}>{urg.label}</span>
                    </div>
                    <span className="text-[10px] text-[#bbb] bg-[#f7f6f3] px-2 py-0.5 rounded-full">{p.categoria}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── DETALHE DO PROTOCOLO ─────────────────────────────────────────────────────

function ProtocolDetail({ protocol: p, ambiente, onBack }: { protocol: Protocol; ambiente: Ambiente; onBack: () => void }) {
  const urg = urgenciaMeta[p.urgencia]
  const aviso = ambiente === 'upa' ? p.upa_aviso : p.hospital_aviso

  const stepsVisiveis = p.steps.filter(s => {
    if (ambiente === 'upa' && s.hospital_only) return false
    if (ambiente === 'hospital' && s.upa_only) return false
    return true
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e2e0d8] bg-white flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack}
          className="border border-[#e2e0d8] rounded-lg px-3 py-1.5 text-xs text-[#666] hover:bg-[#f7f6f3] transition-colors flex-shrink-0">
          ← Voltar
        </button>
        <div className="min-w-0">
          <div className="font-bold text-[#1a1a1a] text-sm leading-tight">{p.icone} {p.nome}</div>
          <div className="text-xs text-[#aaa]">{p.subtitulo}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">

          {/* Urgência + ambiente */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: urg.bg, color: urg.text }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: urg.dot }} />
              {urg.label}
            </div>
            <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
              ambiente === 'upa' ? 'bg-[#FCEBEB] text-[#8B1A1A]' : 'bg-[#E8F2FE] text-[#0C3A6B]'
            }`}>
              {ambiente === 'upa' ? '🏥 UPA' : '🏨 Hospital'}
            </div>
          </div>

          {/* Aviso específico do ambiente */}
          {aviso && (
            <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed font-medium ${
              ambiente === 'upa'
                ? 'bg-[#FEF3E8] text-[#7A3D0A] border border-[#f5d5a8]'
                : 'bg-[#E8F2FE] text-[#0C3A6B] border border-[#b8d5f5]'
            }`}>
              {aviso}
            </div>
          )}

          {/* Drogas-chave */}
          {p.drogas_chave && (
            <div className="bg-[#f7f6f3] rounded-xl px-4 py-3">
              <div className="text-[10px] font-bold text-[#aaa] uppercase tracking-widest mb-2">Medicamentos-chave</div>
              <div className="flex flex-wrap gap-1.5">
                {p.drogas_chave.map(d => (
                  <span key={d} className="text-xs bg-white border border-[#e2e0d8] px-2.5 py-1 rounded-full text-[#444] font-medium">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Steps */}
          <div className="bg-white border border-[#e2e0d8] rounded-2xl overflow-hidden">
            {stepsVisiveis.map((s, i) => (
              <StepItem key={i} step={s} index={i} total={stepsVisiveis.length} />
            ))}
          </div>

          {/* Referências */}
          {p.referencias && (
            <div className="px-4 py-3 bg-[#f7f6f3] rounded-xl">
              <div className="text-[10px] font-bold text-[#aaa] uppercase tracking-widest mb-2">Referências</div>
              {p.referencias.map(r => (
                <div key={r} className="text-xs text-[#888] leading-relaxed">• {r}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepItem({ step: s, index, total }: { step: Step; index: number; total: number }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className={`${index < total - 1 ? 'border-b border-[#f0ede4]' : ''}`}>
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-[#fafaf8] transition-colors"
        onClick={() => setOpen(o => !o)}>
        <div className="w-5 h-5 rounded-full bg-[#f7f6f3] border border-[#e2e0d8] flex items-center justify-center text-[10px] font-bold text-[#666] flex-shrink-0 mt-0.5">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#1a1a1a] leading-snug">{s.titulo.replace(/^\d+\.\s*/, '')}</div>
          {!open && <div className="text-xs text-[#aaa] mt-0.5 truncate">{s.detalhe.split('\n')[0]}</div>}
        </div>
        <div className={`text-[#aaa] flex-shrink-0 mt-0.5 transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 ml-8 space-y-2">
          <div className="text-xs text-[#444] leading-relaxed whitespace-pre-line">{s.detalhe}</div>
          {s.alerta && (
            <div className="flex gap-2 bg-[#FEF3E8] border border-[#f5d5a8] rounded-lg px-3 py-2">
              <span className="text-sm flex-shrink-0">⚠️</span>
              <div className="text-xs text-[#7A3D0A] leading-relaxed font-medium">{s.alerta}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
