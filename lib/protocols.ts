// ================================================================
// PRECEPTOR.AI — Base de protocolos clínicos
// Adaptados por ambiente: UPA | Hospital Geral | Hospital Terciário
// Baseados em: CFM, SBC, SBP, SBED, AMIB, SBEM — diretrizes 2024
// ================================================================

export type Ambiente = 'upa' | 'hospital' | 'terciario'

export interface Step {
  n: number
  titulo: string
  descricao: string
  detalhe?: string        // info expandível
  urgencia: 'critico' | 'importante' | 'atencao' | 'ok'
  so_hospital?: boolean   // ocultar na UPA
  so_terciario?: boolean  // apenas terciário
}

export interface Protocolo {
  id: string
  nome: string
  categoria: 'cardiovascular' | 'neurologico' | 'respiratorio' | 'metabolico' | 'trauma' | 'infectologia'
  subtitulo: string
  urgencia_label: string
  urgencia_nivel: 'vermelho' | 'laranja' | 'amarelo' | 'azul'
  tempo_alvo?: string
  referencias: string[]
  notas_upa?: string       // aviso específico para UPA
  steps: Step[]
  criterios_transferencia?: string[]  // UPA → hospital
  criterios_internacao?: string[]
  criterios_alta?: string[]
  drogas_chave: { nome: string; dose: string; via: string; obs?: string }[]
  exames_iniciais: string[]
  metas_terapeuticas?: string[]
}

const URGENCIA_CORES = {
  vermelho: { bg: '#FCEBEB', text: '#791F1F', badge: '#E24B4A' },
  laranja:  { bg: '#FAEEDA', text: '#633806', badge: '#BA7517' },
  amarelo:  { bg: '#FEF9C3', text: '#713F12', badge: '#CA8A04' },
  azul:     { bg: '#E6F1FB', text: '#0C447C', badge: '#378ADD' },
}

export const PROTOCOLOS: Record<string, Protocolo> = {

  // ================================================================
  sepse: {
    id: 'sepse',
    nome: 'Sepse e Choque Séptico',
    categoria: 'infectologia',
    subtitulo: 'Bundle 1 hora — Surviving Sepsis Campaign 2021',
    urgencia_label: 'EMERGÊNCIA',
    urgencia_nivel: 'vermelho',
    tempo_alvo: 'Bundle em 60 min',
    referencias: ['Surviving Sepsis Campaign 2021', 'AMIB 2022', 'CFM Resolução 2.156/2016'],
    notas_upa: '⚠️ UPA: estabilizar e providenciar transferência para hospital com UTI se choque séptico. Não retardar ATB por ausência de recursos.',
    exames_iniciais: ['Lactato venoso (ou arterial)', 'Hemoculturas × 2 pares', 'Hemograma', 'PCR / Procalcitonina', 'Ureia, creatinina, eletrólitos', 'Bilirrubinas, TGO, TGP', 'Coagulograma (TP, KTTP, Plaquetas)', 'Gasometria arterial', 'Urina tipo I + urocultura', 'ECG', 'Raio-X tórax'],
    metas_terapeuticas: ['PAM ≥ 65 mmHg', 'Débito urinário > 0,5 ml/kg/h', 'Lactato clearance > 10% em 2h', 'SvO2 ≥ 70% (ScvO2 ≥ 65%)', 'Lactato < 2 mmol/L em 6h'],
    steps: [
      {
        n: 1,
        titulo: 'Lactato venoso imediato',
        descricao: 'Coletar lactato venoso (periférico aceito). Lactato > 2 mmol/L = suspeita de sepse. Lactato > 4 mmol/L = choque séptico — iniciar vasopressor mesmo sem hipotensão.',
        detalhe: 'O lactato é marcador de hipoperfusão tecidual, não de infecção. Causas de lactato elevado sem sepse: isquemia mesentérica, convulsão prolongada, uso de metformina, intoxicação por CO, insuficiência hepática grave.',
        urgencia: 'critico',
      },
      {
        n: 2,
        titulo: 'Hemoculturas (2 pares)',
        descricao: 'Colher 2 pares (4 frascos: 2 aeróbios + 2 anaeróbios) antes do ATB. Volume mínimo: 10 ml por frasco. Não atrasar ATB > 45 min para realizar coleta.',
        detalhe: 'Sítios diferentes: ex. veia antecubital direita e esquerda. Se CVC presente: 1 par pelo cateter + 1 par periférico. Colher urocultura, cultura de secreção e líquor se indicado clinicamente.',
        urgencia: 'critico',
      },
      {
        n: 3,
        titulo: 'Antibiótico em até 1 hora',
        descricao: 'Foco pulmonar: Ceftriaxona 2g IV + Azitromicina 500mg IV. Foco urinário: Ceftriaxona 2g IV. Foco abdominal: Piperacilina-tazobactam 4,5g IV. Sem foco definido/grave: Meropenem 1g IV.',
        detalhe: 'Se suspeita de MRSA (infecção em pele, CVC, hemodiálise): adicionar Vancomicina 25–30 mg/kg IV (máx 3g). Imunocomprometidos: cobertura antifúngica com Micafungina 100mg IV.',
        urgencia: 'critico',
      },
      {
        n: 4,
        titulo: 'Cristaloide 30 ml/kg em 30–60 min',
        descricao: 'Ringer Lactato (preferível) ou SF 0,9%. Administrar 30 ml/kg em bolus. Reavaliar após cada 500 ml: ausculta pulmonar, JVP, edema. Suspender se sinais de sobrecarga.',
        detalhe: 'Preditores de responsividade a volume: variação de pressão de pulso > 13% (VM), PLR (passive leg raising) com aumento do DC > 10%. Evitar SF 0,9% em grandes volumes: risco de acidose hiperclorêmica.',
        urgencia: 'importante',
      },
      {
        n: 5,
        titulo: 'Noradrenalina se PAM < 65',
        descricao: 'Iniciar noradrenalina 0,05–0,1 mcg/kg/min. Preferir acesso central. Titular para PAM ≥ 65 mmHg. Dose vasopressora alta (> 0,25 mcg/kg/min): associar Vasopressina 0,03 UI/min.',
        detalhe: 'Se sem acesso central: pode iniciar noradrenalina em veia periférica calibrosa por até 6h com vigilância rigorosa de extravasamento. Hidrocortisona 200 mg/dia IV se vasopressor-refratário após ressuscitação adequada.',
        urgencia: 'critico',
      },
      {
        n: 6,
        titulo: 'Controle glicêmico',
        descricao: 'Meta: glicemia 140–180 mg/dL. Glicemia > 180: iniciar insulina regular EV. Evitar hipoglicemia (< 70 mg/dL). Monitorar a cada 1–2h.',
        urgencia: 'atencao',
      },
      {
        n: 7,
        titulo: 'Reavaliação e metas em 6h',
        descricao: 'Reavaliar lactato após 2h (clearance > 10% = boa resposta). Débito urinário > 0,5 ml/kg/h. Solicitar ecocardiograma se disfunção miocárdica suspeitada.',
        detalhe: 'ScvO2 < 65%: considerar transfusão (Hb < 7g/dL), dobutamina 2,5–10 mcg/kg/min, ventilatório.',
        urgencia: 'ok',
      },
    ],
    criterios_transferencia: [
      'Choque séptico com necessidade de vasopressor',
      'Necessidade de UTI (ventilação mecânica, monitorização invasiva)',
      'Disfunção orgânica múltipla (creatinina > 3x basal, plaquetas < 100k, bilirrubina > 2)',
      'Falta de resposta ao bundle em 2–3h',
    ],
    criterios_internacao: [
      'Lactato > 2 mmol/L',
      'Hipotensão (mesmo que responsiva a volume)',
      'Disfunção orgânica de qualquer grau',
      'Foco infeccioso que requer tratamento IV prolongado',
    ],
    drogas_chave: [
      { nome: 'Noradrenalina', dose: '0,05–0,5 mcg/kg/min', via: 'EV IC', obs: 'Diluição padrão: 4mg em 50ml SF' },
      { nome: 'Hidrocortisona', dose: '200 mg/dia', via: 'EV IC ou 50mg/6h', obs: 'Se vasopressor-refratário' },
      { nome: 'Vasopressina', dose: '0,03 UI/min', via: 'EV IC', obs: 'Associar à nora se dose alta' },
      { nome: 'Meropenem', dose: '1–2g q8h', via: 'EV 30 min', obs: 'Ampliar cobertura se grave/nosocomial' },
    ],
  },

  // ================================================================
  iam: {
    id: 'iam',
    nome: 'IAM com Supradesnivelamento de ST',
    categoria: 'cardiovascular',
    subtitulo: 'STEMI — Diretriz SBC 2024',
    urgencia_label: 'EMERGÊNCIA',
    urgencia_nivel: 'vermelho',
    tempo_alvo: 'Porta-balão < 90 min',
    referencias: ['Diretriz SBC 2024', 'ESC Guidelines 2023', 'AHA/ACC 2022'],
    notas_upa: '⚠️ UPA sem hemodinâmica: acionar SAMU imediatamente. Se tempo porta-balão estimado > 120 min: considerar fibrinólise (Tenecteplase) se sem contraindicações. Não retardar transferência.',
    exames_iniciais: ['ECG 12 derivações em < 10 min', 'Troponina I ou T (ultra-sensível)', 'CK-MB', 'Hemograma', 'Coagulograma', 'Ureia, creatinina, eletrólitos', 'Glicemia', 'Raio-X tórax PA'],
    metas_terapeuticas: ['Porta-ECG < 10 min', 'Porta-balão < 90 min (hospital com hemo)', 'Porta-agulha < 30 min (fibrinólise)', 'SatO2 > 90%', 'PA sistólica > 90 mmHg'],
    steps: [
      {
        n: 1,
        titulo: 'AAS 300 mg mastigado',
        descricao: 'Administrar imediatamente, antes mesmo do ECG confirmatório. Dose de ataque: 300 mg mastigado (não deglutir inteiro). Contraindicação: alergia grave comprovada ao AAS.',
        detalhe: 'Se alergia ao AAS: Clopidogrel 600 mg VO como alternativa. O AAS reduz mortalidade em 23% no IAM — não protelar por qualquer motivo.',
        urgencia: 'critico',
      },
      {
        n: 2,
        titulo: 'ECG 12 derivações em < 10 min',
        descricao: 'Critério STEMI: supradesnivelamento ≥ 1mm em ≥ 2 derivações contíguas, ou BRE novo/presumivelmente novo. Derivações D posterior (V7-V9) se suspeita de IAM posterior. VD (V3R-V4R) se IAM inferior.',
        detalhe: 'STEMI equivalentes: oclusão de DA proximal com padrão de Wellens, padrão de De Winter (infradesnivelamento + supra em aVR). Repetir ECG a cada 15 min se sintoma típico com ECG inicial normal.',
        urgencia: 'critico',
      },
      {
        n: 3,
        titulo: 'Dupla antiagregação (DAPT)',
        descricao: 'Ticagrelor 180 mg VO (preferencial) ou Prasugrel 60 mg VO (se < 75 anos, peso > 60 kg, sem AVC prévio) ou Clopidogrel 600 mg VO (se indisponível ou fibrinólise).',
        detalhe: 'Contraindicação ao Ticagrelor: AVC hemorrágico prévio, sangramento ativo, uso de anticoagulante oral. Contraindicação ao Prasugrel: > 75 anos, peso < 60 kg, AVC/AIT prévio.',
        urgencia: 'critico',
      },
      {
        n: 4,
        titulo: 'Anticoagulação',
        descricao: 'HNF 70–100 UI/kg IV bolus (máx 5.000 UI antes da ICP). Se ICP primária: manter HNF durante procedimento. Alternativa: Enoxaparina 0,5 mg/kg IV bolus.',
        detalhe: 'Se fibrinólise com Tenecteplase: Enoxaparina — < 75 anos: 30 mg IV bolus + 1 mg/kg SC q12h; > 75 anos: sem bolus IV, 0,75 mg/kg SC q12h.',
        urgencia: 'importante',
      },
      {
        n: 5,
        titulo: 'Reperfusão: ICP primária ou fibrinólise',
        descricao: 'ICP primária (preferencial): contato com hemodinâmica imediato, alvo porta-balão < 90 min. Fibrinólise se porta-balão > 120 min: Tenecteplase peso-ajustada IV bolus único.',
        detalhe: 'Tenecteplase doses: < 60 kg → 30 mg; 60–69 kg → 35 mg; 70–79 kg → 40 mg; 80–89 kg → 45 mg; ≥ 90 kg → 50 mg. Contraindicações absolutas à fibrinólise: AVC hemorrágico, cirurgia intracraniana, sangramento interno ativo, suspeita de dissecção de aorta.',
        urgencia: 'critico',
        so_hospital: false,
      },
      {
        n: 6,
        titulo: 'Suporte e monitorização',
        descricao: 'Monitor cardíaco contínuo. 2 acessos venosos periféricos calibrosos. O2 suplementar apenas se SatO2 < 90%. Decúbito elevado 30–45°. Acesso venoso femoral ou radial para ICP.',
        detalhe: 'Evitar morfina: estudos CRUSADE e ATLANTIC associaram morfina a absorção reduzida dos antiagregantes e pior desfecho. Preferir analgesia com nitrato se dor isquêmica persistente e PA > 100 mmHg.',
        urgencia: 'atencao',
      },
    ],
    criterios_transferencia: [
      'Todo STEMI confirmado para hospital com hemodinâmica',
      'NSTEMI de alto risco (GRACE score > 140, Killip ≥ II, BRE novo)',
      'Instabilidade hemodinâmica',
      'Choque cardiogênico',
    ],
    drogas_chave: [
      { nome: 'AAS', dose: '300 mg', via: 'VO mastigado', obs: 'Ataque — manutenção 100 mg/dia' },
      { nome: 'Ticagrelor', dose: '180 mg', via: 'VO', obs: 'Manutenção: 90 mg 12/12h' },
      { nome: 'HNF', dose: '70–100 UI/kg', via: 'EV bolus', obs: 'Máx 5.000 UI antes ICP' },
      { nome: 'Tenecteplase', dose: 'Peso-ajustada', via: 'EV bolus único', obs: 'Se porta-balão > 120 min' },
    ],
  },

  // ================================================================
  avc: {
    id: 'avc',
    nome: 'AVC Isquêmico Agudo',
    categoria: 'neurologico',
    subtitulo: 'Janela trombolítica 4,5h — Diretriz ABN/SBN 2023',
    urgencia_label: 'URGÊNCIA',
    urgencia_nivel: 'laranja',
    tempo_alvo: 'Porta-agulha < 60 min',
    referencias: ['Diretriz ABN 2023', 'AHA/ASA Guidelines 2023', 'ESO Guidelines 2021'],
    notas_upa: '⚠️ UPA: iniciar avaliação com escala NIHSS, coletar exames, não tratar PA se < 220/120 (sem rt-PA). Transferência imediata para hospital com UAVC/neurologia. Não retardar transferência para realizar TC se indisponível.',
    exames_iniciais: ['TC crânio SEM contraste (urgente)', 'Glicemia capilar imediata', 'Hemograma', 'Coagulograma (TP, INR, KTTP)', 'Plaquetas', 'Ureia, creatinina, eletrólitos', 'ECG', 'Troponina', 'RNM DWI se TC inconclusivo'],
    metas_terapeuticas: ['Porta-TC < 25 min', 'Porta-agulha < 60 min', 'Glicemia 140–180 mg/dL', 'PA < 185/110 antes rt-PA', 'PA < 180/105 após rt-PA por 24h', 'Temperatura < 37,5°C'],
    steps: [
      {
        n: 1,
        titulo: 'Avaliação NIHSS + glicemia imediata',
        descricao: 'Aplicar escala NIHSS (National Institutes of Health Stroke Scale). Glicemia capilar: hipoglicemia (< 60 mg/dL) pode mimetizar AVC — corrigir com SG 50% 50 ml EV antes de qualquer outra conduta.',
        detalhe: 'NIHSS: avalia 11 domínios neurológicos (consciência, olhar, campos visuais, paralisia facial, membros, ataxia, sensibilidade, linguagem, disartria, extinção). Score > 4 indica AVC significativo. Score > 25 = muito grave.',
        urgencia: 'critico',
      },
      {
        n: 2,
        titulo: 'TC de crânio SEM contraste',
        descricao: 'Objetivo: excluir hemorragia intracraniana antes de qualquer anticoagulação ou trombólise. Também avaliar: extensão do infarto, sinais precoces (apagamento de sulcos, hiperdensidade de ACM).',
        detalhe: 'ASPECTS (Alberta Stroke Program Early CT Score): avalia 10 regiões do território da ACM. Score < 6 associado a pior prognóstico com trombólise. TC com contraste ou angio-TC se suspeita de oclusão de grande vaso.',
        urgencia: 'critico',
      },
      {
        n: 3,
        titulo: 'Controle pressórico criterioso',
        descricao: 'SEM candidato a trombólise: não tratar PA < 220/120 mmHg. Se > 220/120 ou encefalopatia: reduzir 15% nas primeiras 24h. COM rt-PA: PA deve estar < 185/110 antes e < 180/105 após por 24h.',
        detalhe: 'Droga de escolha para ajuste agudo: Labetalol 10–20 mg IV em 1–2 min (repetir a cada 10 min, máx 300 mg) ou Nicardipina 5 mg/h EV. Evitar nitroprussiato (vasodilatação cerebral excessiva).',
        urgencia: 'importante',
      },
      {
        n: 4,
        titulo: 'Trombólise com rt-PA (Alteplase)',
        descricao: 'Dose: 0,9 mg/kg IV (máx 90 mg). 10% em bólus em 1 min + 90% em 60 min. Janela: até 4,5h do início dos sintomas (ou do "último bem visto").',
        detalhe: 'Contraindicações absolutas: hemorragia intracraniana prévia, AVC isquêmico nos últimos 3 meses, cirurgia intracraniana recente, neoplasia intracraniana, sangramento interno ativo, PA > 185/110 não controlada, glicemia < 50 ou > 400 mg/dL, INR > 1,7 ou uso de anticoagulante. Após rt-PA: não dar AAS por 24h, PA < 180/105.',
        urgencia: 'critico',
        so_hospital: false,
      },
      {
        n: 5,
        titulo: 'Trombectomia mecânica (se elegível)',
        descricao: 'Indicada em oclusão de grande vaso (ACM M1/M2, ACI, artéria basilar) com NIHSS ≥ 6, ASPECTS ≥ 6, janela até 24h (selecionados por imagem). Associar ao rt-PA quando possível.',
        urgencia: 'critico',
        so_terciario: true,
      },
      {
        n: 6,
        titulo: 'Antiagregação (sem trombólise)',
        descricao: 'AAS 300 mg VO/SNE imediatamente se sem rt-PA. AVC leve (NIHSS ≤ 3)/AIT de alto risco: DAPT por 21 dias — AAS 100 mg + Clopidogrel 75 mg (após dose de ataque 300 mg). Atorvastatina 80 mg.',
        urgencia: 'importante',
      },
      {
        n: 7,
        titulo: 'Suporte geral e internação UAVC',
        descricao: 'Cabeceira 0° (ou 30° se aspiração). Temperatura: antitérmico se > 37,5°C. SNG precoce se disfagia. Monitor cardíaco 24h (FA paroxística). Profilaxia TVP. Reabilitação precoce.',
        urgencia: 'ok',
      },
    ],
    criterios_transferencia: [
      'Todo AVC isquêmico confirmado para hospital com UAVC',
      'Candidato a rt-PA: transferência antes de administrar se hospital sem neurologia',
      'Candidato a trombectomia: transferência para centro terciário',
      'AVC de fossa posterior (risco de hidrocefalia e herniação)',
    ],
    drogas_chave: [
      { nome: 'Alteplase (rt-PA)', dose: '0,9 mg/kg IV (máx 90 mg)', via: 'EV', obs: '10% bólus + 90% em 60 min' },
      { nome: 'AAS', dose: '300 mg ataque → 100 mg/dia', via: 'VO/SNE', obs: 'Aguardar 24h após rt-PA' },
      { nome: 'Atorvastatina', dose: '80 mg/dia', via: 'VO', obs: 'Iniciar na fase aguda' },
      { nome: 'Labetalol', dose: '10–20 mg IV', via: 'EV lento', obs: 'Ajuste pressórico pontual' },
    ],
  },

  // ================================================================
  anafilaxia: {
    id: 'anafilaxia',
    nome: 'Anafilaxia',
    categoria: 'cardiovascular',
    subtitulo: 'Reação alérgica grave sistêmica — WAO 2020',
    urgencia_label: 'EMERGÊNCIA IMEDIATA',
    urgencia_nivel: 'vermelho',
    tempo_alvo: 'Adrenalina em < 5 min',
    referencias: ['WAO Anaphylaxis Guidelines 2020', 'SBAI 2021', 'UpToDate 2024'],
    exames_iniciais: ['Oximetria contínua', 'PA e FC seriadas', 'ECG', 'Glicemia', 'Triptase sérica (se disponível — colher em 30 min–3h do início)'],
    metas_terapeuticas: ['PAM > 65 mmHg', 'SatO2 > 95%', 'FC < 100 bpm (após tratamento)', 'Via aérea pérvia'],
    notas_upa: 'UPA: adrenalina IM disponível é suficiente para estabilização. Observação mínima 6–8h OBRIGATÓRIA. Alta com prescrição de adrenalina autoinjetável e orientação escrita.',
    steps: [
      {
        n: 1,
        titulo: 'Adrenalina 1:1.000 IM — IMEDIATO',
        descricao: 'Face anterolateral da coxa (pode ser através da roupa). Adulto: 0,3–0,5 mg IM. Criança: 0,01 mg/kg IM (máx 0,5 mg). Repetir a cada 5–15 min se sem melhora. Não há contraindicação absoluta na anafilaxia.',
        detalhe: 'A adrenalina IM na coxa tem absorção 5× mais rápida que no deltoide. Evitar via SC (absorção imprevisível). Adrenalina EV apenas em PCR ou anafilaxia refratária a múltiplas doses IM: 0,1 mg (1 ml da solução 1:10.000) EV lento.',
        urgencia: 'critico',
      },
      {
        n: 2,
        titulo: 'Posição + oxigênio + acesso venoso',
        descricao: 'Decúbito dorsal com MMII elevados (exceto dispneia/vômitos: sentar). O2 alto fluxo 8–10 L/min por máscara com reservatório. 2 acessos venosos calibrosos. Não mobilizar desnecessariamente.',
        urgencia: 'critico',
      },
      {
        n: 3,
        titulo: 'Expansão volêmica agressiva',
        descricao: 'SF 0,9% 1–2L IV em 5–10 min se hipotensão ou choque. Repetir conforme resposta. Crianças: 10–20 ml/kg IV em 5–10 min.',
        urgencia: 'importante',
      },
      {
        n: 4,
        titulo: 'Broncodilatador se broncoespasmo',
        descricao: 'Salbutamol 2,5–5 mg nebulizado se sibilância persistente após adrenalina. Ipratrópio 0,5 mg pode ser associado.',
        urgencia: 'importante',
      },
      {
        n: 5,
        titulo: 'Anti-histamínico (2ª linha)',
        descricao: 'Prometazina 25–50 mg IM/IV lento OU Difenidramina 50 mg IV. Não substitui adrenalina. Usar apenas após estabilização hemodinâmica.',
        detalhe: 'Anti-histamínicos tratam urticária e prurido, NÃO hipotensão nem broncoespasmo. São medicações de conforto.',
        urgencia: 'atencao',
      },
      {
        n: 6,
        titulo: 'Corticosteroide (prevenção bifásica)',
        descricao: 'Hidrocortisona 200–500 mg IV ou Metilprednisolona 125 mg IV. Objetivo: prevenir reação bifásica (ocorre em 5–20% dos casos, até 72h após). Não tem efeito na fase aguda.',
        urgencia: 'atencao',
      },
      {
        n: 7,
        titulo: 'Observação mínima 6–8h + plano de alta',
        descricao: 'Alta com: adrenalina autoinjetável (Epipen 0,3 mg ou Jext), anti-histamínico oral 48h, corticosteroide oral 3–5 dias, orientação escrita, encaminhamento para alergologista.',
        urgencia: 'ok',
      },
    ],
    drogas_chave: [
      { nome: 'Adrenalina 1:1.000', dose: '0,3–0,5 mg adulto / 0,01 mg/kg criança', via: 'IM lateral da coxa', obs: 'Repetir a cada 5–15 min' },
      { nome: 'Hidrocortisona', dose: '200–500 mg', via: 'EV', obs: 'Prevenção bifásica' },
      { nome: 'Prometazina', dose: '25–50 mg', via: 'IM ou EV lento', obs: '2ª linha — após estabilização' },
      { nome: 'Salbutamol', dose: '2,5–5 mg', via: 'Nebulização', obs: 'Se broncoespasmo persistente' },
    ],
    criterios_transferencia: [
      'Anafilaxia refratária a 3 doses de adrenalina IM',
      'Necessidade de adrenalina EV',
      'Intubação orotraqueal',
      'Choque refratário a volume',
    ],
  },

  // ================================================================
  intubacao: {
    id: 'intubacao',
    nome: 'Intubação Orotraqueal',
    categoria: 'respiratorio',
    subtitulo: 'Sequência Rápida de Intubação (SRI/RSI)',
    urgencia_label: 'PROCEDIMENTO CRÍTICO',
    urgencia_nivel: 'azul',
    tempo_alvo: 'Preparação 5–10 min',
    referencias: ['SIAARTI 2020', 'Difficult Airway Society 2022', 'UpToDate 2024'],
    exames_iniciais: ['Gasometria arterial', 'Oximetria contínua', 'Capnografia (se disponível)', 'Radiografia de tórax pós-IOT'],
    metas_terapeuticas: ['SatO2 > 94% pré-intubação', 'ETCO2 35–45 mmHg', 'PaO2 > 60 mmHg (pós-IOT)', 'Pressão de platô < 30 cmH2O'],
    steps: [
      {
        n: 1,
        titulo: 'Preparação: SOAPME',
        descricao: 'S: Sucção (aspirador funcionando). O: O2 e equipamentos (BVM, fluxômetro). A: Airway (laringoscópio testado, lâminas, guia). P: Posicionamento. M: Medicações preparadas. E: Equipe e plano B (máscara laríngea, kit cricotireoidotomia).',
        urgencia: 'critico',
      },
      {
        n: 2,
        titulo: 'Pré-oxigenação 3–5 minutos',
        descricao: 'Máscara com reservatório O2 15 L/min. Meta: SatO2 > 95% (margem de segurança para apneia). Se insuficiente: CPAP ou BVM com PEEP. Posição 20–30° (anti-Trendelenburg).',
        detalhe: 'VNI por 3 min pode ser superior à máscara convencional em obesos e pacientes com SDRA. Apneia oxigenada: cateter nasal 15 L/min durante laringoscopia aumenta o tempo seguro de apneia.',
        urgencia: 'critico',
      },
      {
        n: 3,
        titulo: 'Calcular doses pelo peso estimado',
        descricao: 'Etomidato 0,3 mg/kg + Succinilcolina 1,5 mg/kg (esquema padrão). Ketamina 1,5–2 mg/kg + Rocurônio 1,2 mg/kg (instabilidade HD, asma, broncoespasmo). Propofol 1,5–2 mg/kg + Succinilcolina 1,5 mg/kg (sem hipotensão).',
        urgencia: 'critico',
      },
      {
        n: 4,
        titulo: 'Pré-medicação (3 min antes)',
        descricao: 'Fentanil 1–3 mcg/kg IV lento: atenua resposta simpática à laringoscopia (HAS, taquicardia, aumento PIC). Lidocaína 1,5 mg/kg IV: opcional, se suspeita de aumento de PIC. Atropina 0,02 mg/kg: em crianças < 1 ano.',
        urgencia: 'atencao',
      },
      {
        n: 5,
        titulo: 'Indução e bloqueio neuromuscular',
        descricao: 'Administrar sedativo IV rápido → aguardar 30–60s → administrar BNM. Não ventilar com BVM após BNM salvo SatO2 < 90%. Pressão cricóide (Sellick): opcional, pode dificultar laringoscopia.',
        detalhe: 'Succinilcolina: contraindicada em hipercalemia grave, rabdomiólise, queimaduras extensas (> 48h), trauma medular crônico, distrofias musculares. Usar rocurônio nesses casos. Sugamadex 16 mg/kg reverte rocurônio em < 3 min.',
        urgencia: 'critico',
      },
      {
        n: 6,
        titulo: 'Laringoscopia e passagem do tubo',
        descricao: 'Laringoscopia direta (lâmina Macintosh 3 ou 4) ou videolaringoscópio. Tubo 7,5–8,5 (homem) / 7,0–8,0 (mulher). Introdutor/guia de Cook se dificuldade prevista. Máx 2 tentativas por operador.',
        detalhe: 'Via aérea difícil prevista (LEMON: Look, Evaluate 3-3-2, Mallampati, Obstruction, Neck mobility): chamar ajuda antes, ter máscara laríngea e kit cirúrgico na sala. Se 2 tentativas fracassadas: máscara laríngea como ponte.',
        urgencia: 'critico',
      },
      {
        n: 7,
        titulo: 'Confirmação e parâmetros iniciais de VM',
        descricao: 'Capnografia (padrão ouro). Ausculta bilateral (2º EIC, linhas axilares). Rx tórax. VM inicial: VC 6–8 ml/kg peso ideal. FR 14–16 ipm. PEEP 5 cmH2O. FiO2 100% → titular para SatO2 > 94%.',
        detalhe: 'Peso ideal: homem = 50 + 2,3 × (altura em polegadas − 60). Mulher = 45,5 + 2,3 × (altura em polegadas − 60). Nunca VC pelo peso real (risco de barotrauma). Sedação de manutenção: Propofol 0,3–3 mg/kg/h IC.',
        urgencia: 'importante',
      },
    ],
    drogas_chave: [
      { nome: 'Etomidato', dose: '0,3 mg/kg', via: 'EV rápido', obs: 'Padrão — preserva hemodinâmica' },
      { nome: 'Ketamina', dose: '1,5–2 mg/kg', via: 'EV rápido', obs: 'Instabilidade HD, broncoespasmo' },
      { nome: 'Succinilcolina', dose: '1,5 mg/kg', via: 'EV rápido', obs: 'Ação em 60s, duração 10 min' },
      { nome: 'Rocurônio', dose: '1,2 mg/kg', via: 'EV rápido', obs: 'Reverter com Sugamadex 16 mg/kg' },
      { nome: 'Fentanil', dose: '1–3 mcg/kg', via: 'EV lento (3 min antes)', obs: 'Pré-medicação' },
    ],
  },

  // ================================================================
  asma: {
    id: 'asma',
    nome: 'Crise Asmática Grave',
    categoria: 'respiratorio',
    subtitulo: 'Exacerbação grave — GINA 2024 / SBPT',
    urgencia_label: 'URGÊNCIA',
    urgencia_nivel: 'laranja',
    tempo_alvo: 'SABA em < 20 min',
    referencias: ['GINA 2024', 'SBPT 2022', 'BTS/SIGN 2023'],
    notas_upa: 'UPA: se sem resposta após 3 ciclos de SABA + corticosteroide EV, acionar suporte e providenciar transferência para UTI. Asma quase-fatal (PaCO2 > 45, cansaço extremo, alteração de consciência): intubação imediata.',
    exames_iniciais: ['Oximetria contínua', 'Pico de fluxo expiratório (PFE)', 'Gasometria arterial (se grave)', 'ECG', 'Raio-X tórax (excluir pneumotórax)', 'Potássio (salbutamol pode causar hipocalemia)'],
    metas_terapeuticas: ['SatO2 93–95%', 'PFE > 60% do predito após tratamento', 'FR < 25 ipm', 'FC < 110 bpm', 'Fala em frases completas'],
    steps: [
      {
        n: 1,
        titulo: 'Classificar gravidade + SatO2',
        descricao: 'Grave: fala em palavras, SatO2 < 92%, FR > 30, FC > 120, uso de musculatura acessória, PFE < 40%. Muito grave (quase-fatal): cianose, exaustão, silêncio auscultatório, confusão, bradicardia.',
        detalhe: 'Sibilância ≠ gravidade. Tórax silencioso em paciente disneico = gravíssimo (obstrução crítica sem fluxo suficiente para sibiância). PaCO2 normal ou elevado em crise = sinal de alarme (fadiga muscular iminente).',
        urgencia: 'critico',
      },
      {
        n: 2,
        titulo: 'SABA nebulizado em dose plena',
        descricao: 'Salbutamol 2,5–5 mg (20 gotas) em nebulização com O2. Repetir a cada 20 min × 3 doses na 1ª hora. Crise muito grave: nebulização contínua (10 mg/h).',
        detalhe: 'SABA por aerossol dosimetrado (MDI) com espaçador é equivalente à nebulização em crises leves-moderadas. Cada 2,5 mg em nebulização ≈ 4–8 jatos de MDI. Efeito colateral: tremor, taquicardia, hipocalemia.',
        urgencia: 'critico',
      },
      {
        n: 3,
        titulo: 'Ipratrópio nebulizado (associar)',
        descricao: 'Brometo de ipratrópio 0,5 mg junto ao salbutamol nas primeiras 3 nebulizações (1ª hora). Reduz internações hospitalares em 30% na crise grave. Após 1ª hora: manter apenas salbutamol.',
        urgencia: 'importante',
      },
      {
        n: 4,
        titulo: 'Corticosteroide sistêmico precoce',
        descricao: 'Prednisolona 40–60 mg VO OU Hidrocortisona 200 mg IV (se via oral indisponível). Manter por 5–7 dias VO. Efeito clínico em 4–6h — não esperar antes de escalar terapia.',
        urgencia: 'importante',
      },
      {
        n: 5,
        titulo: 'Sulfato de magnésio se sem resposta',
        descricao: 'MgSO4 2g IV em 20 min se PFE < 25% ou sem resposta após 1ª hora. Causa broncodilatação por antagonismo do cálcio. Contraindicação: IR grave (clearance < 30 ml/min).',
        urgencia: 'importante',
      },
      {
        n: 6,
        titulo: 'VNI ou intubação se falha',
        descricao: 'VNI (BiPAP IPAP 10–15 / EPAP 5–8): considerar em crise grave sem melhora, hipercapnia emergente, sem alteração de consciência. Intubação: hipoxemia refratária, cansaço extremo, alteração de consciência, parada.',
        detalhe: 'IOT em asmático é de alto risco (auto-PEEP, barotrauma). Usar Ketamina para indução (broncodilatadora). VM: FR baixa (10–14), VC 6 ml/kg, I:E 1:3–4, PEEP 0–5, tolerar hipercapnia permissiva (pH > 7,2).',
        urgencia: 'critico',
        so_hospital: false,
      },
    ],
    drogas_chave: [
      { nome: 'Salbutamol', dose: '2,5–5 mg q20min × 3', via: 'Nebulização', obs: 'Contínuo 10 mg/h se muito grave' },
      { nome: 'Ipratrópio', dose: '0,5 mg', via: 'Nebulização', obs: 'Junto ao SABA nas 3 primeiras' },
      { nome: 'Hidrocortisona', dose: '200 mg', via: 'EV', obs: 'Ou prednisolona 40–60 mg VO' },
      { nome: 'MgSO4', dose: '2g em 20 min', via: 'EV', obs: 'Se sem resposta após 1h' },
    ],
    criterios_transferencia: ['Necessidade de VNI', 'Falha ao tratamento inicial', 'PaCO2 > 45 mmHg ou acidose respiratória', 'IOT e ventilação mecânica'],
    criterios_internacao: ['PFE < 40% após 4h de tratamento', 'SatO2 < 92% em ar ambiente', 'Necessidade de SABA > 4/4h', 'Crise noturna grave'],
    criterios_alta: ['PFE > 70% do predito ou basal', 'SatO2 > 95% em ar ambiente', 'Fala em frases, sem uso de musculatura acessória', 'Responsivo a SABA por 4h', 'Corticosteroide oral prescrito'],
  },

  // ================================================================
  convulsao: {
    id: 'convulsao',
    nome: 'Status Epilepticus',
    categoria: 'neurologico',
    subtitulo: 'Convulsão ativa > 5 min ou 2 crises sem recuperação',
    urgencia_label: 'EMERGÊNCIA',
    urgencia_nivel: 'vermelho',
    tempo_alvo: 'BZD em < 5 min',
    referencias: ['Neurocritical Care Society 2012', 'SBN 2022', 'ESICM 2023'],
    notas_upa: '⚠️ UPA: tratar agressivamente com BZD e 2ª linha se disponível. Status refratário (> 20 min sem resposta): transferência urgente para UTI com suporte ventilatório.',
    exames_iniciais: ['Glicemia capilar imediata', 'Hemograma', 'Eletrólitos (Na, K, Ca, Mg)', 'Ureia, creatinina', 'Gasometria arterial', 'Toxicológico se indicado', 'TC crânio após estabilização', 'EEG (hospital terciário)'],
    steps: [
      {
        n: 1,
        titulo: 'Glicemia imediata + suporte básico',
        descricao: 'Glicemia capilar imediata. Se < 60 mg/dL: Tiamina 100 mg IV primeiro → SG 50% 50 ml EV. Decúbito lateral, O2 alto fluxo, aspiração de secreções. NÃO introduzir objeto na boca. Monitorização contínua.',
        urgencia: 'critico',
      },
      {
        n: 2,
        titulo: 'Benzodiazepínico IV — 0 a 5 min',
        descricao: 'Midazolam 0,1–0,2 mg/kg IV (máx 10 mg). Alternativa: Diazepam 0,15–0,2 mg/kg IV (máx 10 mg). Sem acesso venoso: Midazolam 10 mg IM ou intranasal (0,2 mg/kg). Pode repetir 1× após 5 min.',
        detalhe: 'Midazolam IM é tão eficaz quanto diazepam IV (RAMPART trial) e mais prático no pré-hospitalar. Diazepam retal (0,5 mg/kg, máx 20 mg): alternativa em crianças sem acesso.',
        urgencia: 'critico',
      },
      {
        n: 3,
        titulo: '2ª linha antiepiléptica — 5 a 20 min',
        descricao: 'Levetiracetam 60 mg/kg IV em 15 min (máx 4.500 mg) — 1ª escolha. Ácido valpróico 40 mg/kg IV em 10 min (máx 3.000 mg) — contraindicado gestação, hepatopatia. Fenitoína 20 mg/kg IV (máx 50 mg/min) — monitorizar ECG.',
        detalhe: 'Ensaio ESETT 2019: levetiracetam, fenitoína e ácido valpróico têm eficácia equivalente como 2ª linha. Preferir levetiracetam pela facilidade de uso e menor toxicidade cardíaca.',
        urgencia: 'critico',
      },
      {
        n: 4,
        titulo: 'Status refratário > 20 min — Sedação',
        descricao: 'Propofol 1–2 mg/kg IV bolus + IC 1–5 mg/kg/h. Midazolam 0,2 mg/kg bolus + IC 0,1–0,5 mg/kg/h. Tiopental 3–5 mg/kg bolus + IC 0,2–0,4 mg/kg/h. Intubação e UTI obrigatórias.',
        urgencia: 'critico',
        so_hospital: false,
      },
      {
        n: 5,
        titulo: 'Investigar e tratar causa base',
        descricao: 'Causas mais frequentes: AVC (TC urgente), infecção SNC (punção lombar após TC), distúrbios metabólicos (Na, Ca, Mg, glicose), intoxicação (tóxico screen), não aderência à medicação epiléptica.',
        urgencia: 'importante',
      },
    ],
    drogas_chave: [
      { nome: 'Midazolam', dose: '0,1–0,2 mg/kg IV (máx 10 mg)', via: 'EV ou IM', obs: '1ª linha — pode repetir 1× em 5 min' },
      { nome: 'Levetiracetam', dose: '60 mg/kg IV (máx 4.500 mg)', via: 'EV em 15 min', obs: '2ª linha preferencial' },
      { nome: 'Ácido valpróico', dose: '40 mg/kg IV (máx 3.000 mg)', via: 'EV em 10 min', obs: 'Contraindicado gestação e hepatopatia' },
      { nome: 'Fenitoína', dose: '20 mg/kg IV', via: 'EV (máx 50 mg/min)', obs: 'Monitorar ECG durante infusão' },
    ],
    criterios_transferencia: ['Status refratário (> 20 min sem resposta)', 'Necessidade de sedação profunda e IOT', 'EEG para monitorização'],
  },

  // ================================================================
  cetoacidose: {
    id: 'cetoacidose',
    nome: 'Cetoacidose Diabética (CAD)',
    categoria: 'metabolico',
    subtitulo: 'DM1 e DM2 — ADA Standards of Care 2024',
    urgencia_label: 'URGÊNCIA',
    urgencia_nivel: 'laranja',
    tempo_alvo: 'Insulina após K+ > 3,5',
    referencias: ['ADA Standards 2024', 'SBD 2023', 'ISPAD 2022'],
    notas_upa: 'UPA: iniciar hidratação, colher exames e corrigir hipocalemia antes da insulina. Transferir para hospital com UTI se: pH < 7,0, alteração de consciência, choque, insuficiência renal.',
    exames_iniciais: ['Glicemia (capilar + laboratorial)', 'Gasometria arterial ou venosa', 'Eletrólitos (Na, K, Cl, Mg, P)', 'Ureia, creatinina', 'Hemograma', 'Cetonas urinárias (cetonúria) ou séricas (β-OH-butirato)', 'ECG (hipercalemia)', 'Urocultura, hemocultura se febre', 'Raio-X tórax'],
    metas_terapeuticas: ['Glicemia 150–250 mg/dL (fase inicial)', 'pH > 7,3', 'Bicarbonato > 18 mEq/L', 'Gap aniônico normalizado', 'K+ 3,5–5,0 mEq/L', 'Diurese > 0,5 ml/kg/h'],
    steps: [
      {
        n: 1,
        titulo: 'Hidratação agressiva — SF 0,9%',
        descricao: 'SF 0,9% 1L na 1ª hora (15–20 ml/kg). Em seguida: 500 ml/h por 2–4h. Ajustar conforme estado hídrico. Trocar para SF 0,45% quando Na corrigido normalizar. Crianças: 10–20 ml/kg em 1h, depois 1,5× manutenção.',
        detalhe: 'Na corrigido = Na medido + 1,6 × (glicemia − 100)/100. Risco de edema cerebral em crianças com hidratação excessiva — não ultrapassar 50 ml/kg nas primeiras 4h.',
        urgencia: 'critico',
      },
      {
        n: 2,
        titulo: 'Correção do potássio ANTES da insulina',
        descricao: 'K+ < 3,5 mEq/L: repor KCl 20–40 mEq/h IV, NÃO iniciar insulina. K+ 3,5–5,0 mEq/L: adicionar 20–40 mEq/L na solução IV, iniciar insulina. K+ > 5,5 mEq/L: iniciar insulina, sem reposição, monitorar.',
        detalhe: 'Apesar de K+ total corporal reduzido, o K+ sérico pode estar normal ou elevado na admissão (acidose desloca K+ para extracelular). A insulina move K+ para intracelular — risco de hipocalemia grave se não reposto.',
        urgencia: 'critico',
      },
      {
        n: 3,
        titulo: 'Insulina regular EV em infusão contínua',
        descricao: '0,1 UI/kg/h em bomba de infusão (sem bolus IV). Meta: redução de 50–75 mg/dL/h. Se redução < 50 mg/dL/h após 1h e hidratação adequada: dobrar dose. Quando glicemia < 250 mg/dL: trocar SF para SG 5% e reduzir insulina para 0,05 UI/kg/h.',
        detalhe: 'Não suspender insulina pelo valor de glicemia isoladamente — o objetivo é fechar o gap aniônico. Manter insulina até: pH > 7,3, bicarbonato > 18, gap aniônico < 12. Transição para insulina SC: sobrepor 1–2h com IC antes de suspender.',
        urgencia: 'critico',
      },
      {
        n: 4,
        titulo: 'Monitorização laboratorial seriada',
        descricao: 'Glicemia: horária. Eletrólitos + gasometria: a cada 2h nas primeiras 6h, depois a cada 4h. Cetonas séricas ou GAP aniônico: a cada 4h (critério de resolução).',
        urgencia: 'importante',
      },
      {
        n: 5,
        titulo: 'Bicarbonato? Apenas se pH < 6,9',
        descricao: 'NaHCO3 100 mEq em 400 ml de AD + 20 mEq KCl em 2h apenas se pH < 6,9. Acima disso: contraindicado — piora hipocalemia, acidose paradoxal no SNC, retarda fechamento do gap.',
        urgencia: 'atencao',
      },
      {
        n: 6,
        titulo: 'Investigar e tratar fator precipitante',
        descricao: 'Infecção (mais comum): ATB se foco identificado. Abandono de insulina. IAM (ECG, troponina). Pancreatite. Medicamentos (corticóide, SGLT2i — CAD euglicêmica). Gestação (CAD mais grave).',
        urgencia: 'importante',
      },
    ],
    drogas_chave: [
      { nome: 'Insulina Regular', dose: '0,1 UI/kg/h', via: 'EV IC', obs: 'Sem bolus — após K+ > 3,5' },
      { nome: 'KCl 19,1%', dose: '20–40 mEq/h IV', via: 'EV diluído', obs: 'Máx 40 mEq/h — monitorar ECG' },
      { nome: 'SF 0,9%', dose: '1L/h na 1ª hora', via: 'EV', obs: 'Depois ajustar conforme Na corrigido' },
    ],
    criterios_internacao: ['Todo paciente com CAD confirmada (pH < 7,3, bicarbonato < 18, cetonúria > +2)'],
    criterios_transferencia: ['pH < 7,0', 'Alteração de consciência (Glasgow < 14)', 'Choque', 'Insuficiência renal oligúrica', 'Edema cerebral'],
  },

  // ================================================================
  dpoc: {
    id: 'dpoc',
    nome: 'Exacerbação Aguda de DPOC',
    categoria: 'respiratorio',
    subtitulo: 'EADPOC — GOLD 2024 / SBPT',
    urgencia_label: 'URGÊNCIA',
    urgencia_nivel: 'laranja',
    tempo_alvo: 'SABA + O2 em < 30 min',
    referencias: ['GOLD 2024', 'SBPT 2022', 'BTS 2023'],
    exames_iniciais: ['Gasometria arterial', 'Oximetria', 'Raio-X tórax', 'ECG', 'Hemograma', 'PCR', 'Ureia, creatinina', 'Eletrólitos', 'Hemocultura se febre'],
    metas_terapeuticas: ['SatO2 88–92% (cuidado com hipercapnia!)', 'pH > 7,35', 'PaCO2 basal do paciente', 'FR < 25 ipm'],
    notas_upa: '⚠️ UPA: VNI é gold standard para EADPOC com hipercapnia. Se sem VNI disponível: transfr urgente para hospital com UTI se pH < 7,30 ou PCO2 > 60 mmHg. Meta O2: SatO2 88–92% (NUNCA 100% — risco de hipercapnia)',
    steps: [
      {
        n: 1,
        titulo: 'O2 controlado — meta SatO2 88–92%',
        descricao: 'Máscara de Venturi 24–28% OU cateter nasal 1–2 L/min. NUNCA O2 a 100% em DPOC — risco de hipercapnia fatal. Reavaliação com gasometria em 30–60 min após O2.',
        urgencia: 'critico',
      },
      {
        n: 2,
        titulo: 'SABA + anticolinérgico nebulizados',
        descricao: 'Salbutamol 2,5–5 mg + Ipratrópio 0,5 mg nebulizados com ar comprimido (não O2 puro). Repetir a cada 20–30 min conforme resposta. Manutenção: a cada 4–6h.',
        urgencia: 'critico',
      },
      {
        n: 3,
        titulo: 'Corticosteroide sistêmico',
        descricao: 'Prednisolona 40 mg/dia VO por 5 dias OU Hidrocortisona 200 mg IV. Reduz falha de tratamento e tempo de internação. Sem benefício com cursos > 5 dias.',
        urgencia: 'importante',
      },
      {
        n: 4,
        titulo: 'Antibiótico se indicado',
        descricao: 'Indicação: escarro purulento + aumento de dispneia + aumento de volume. Sem todos 3: antibiótico NÃO recomendado. Amoxicilina-clavulanato 875/125 mg 12/12h VO × 5–7d ou Azitromicina 500 mg/dia × 3–5d.',
        detalhe: 'DPOC grave/hospitalizado/risco de Pseudomonas: Levofloxacino 750 mg/dia ou Ciprofloxacino 500 mg 12/12h.',
        urgencia: 'importante',
      },
      {
        n: 5,
        titulo: 'VNI se pH < 7,35 ou hipercapnia',
        descricao: 'BiPAP: IPAP 12–20 cmH2O / EPAP 4–8 cmH2O. Iniciar se pH < 7,35 e PaCO2 > 45. Reavaliação com gasometria em 1–2h. Reduz mortalidade e IOT em EADPOC.',
        urgencia: 'critico',
        so_hospital: false,
      },
      {
        n: 6,
        titulo: 'IOT se falha da VNI',
        descricao: 'Indicações: pH < 7,25 após VNI, exaustão, alteração de consciência, instabilidade HD. VM: FR 10–14, VC 6 ml/kg PI, I:E 1:3, PEEP 5, tolerar hipercapnia permissiva (pH > 7,20).',
        urgencia: 'critico',
        so_hospital: false,
      },
    ],
    drogas_chave: [
      { nome: 'Salbutamol', dose: '2,5–5 mg q20–30 min', via: 'Nebulização', obs: 'Com ar comprimido, não O2 puro' },
      { nome: 'Ipratrópio', dose: '0,5 mg', via: 'Nebulização', obs: 'Junto ao salbutamol' },
      { nome: 'Hidrocortisona', dose: '200 mg', via: 'EV', obs: 'Ou prednisolona 40 mg VO' },
      { nome: 'Amoxicilina-clavulanato', dose: '875/125 mg 12/12h', via: 'VO', obs: 'Se escarro purulento' },
    ],
    criterios_transferencia: ['pH < 7,30 sem VNI disponível', 'Necessidade de IOT', 'Pneumonia extensa', 'Cor pulmonale descompensado'],
  },

  // ================================================================
  edema_agudo: {
    id: 'edema_agudo',
    nome: 'Edema Agudo de Pulmão',
    categoria: 'cardiovascular',
    subtitulo: 'EAP cardiogênico — SBC 2023',
    urgencia_label: 'EMERGÊNCIA',
    urgencia_nivel: 'vermelho',
    tempo_alvo: 'VNI em < 30 min',
    referencias: ['ESC Heart Failure Guidelines 2023', 'SBC 2022'],
    notas_upa: '⚠️ UPA: VNI é 1ª linha e reduz IOT e mortalidade. Diuréticos IV e nitrato se PA > 100 mmHg. Transferir se sem VNI ou refratário.',
    exames_iniciais: ['ECG imediato', 'Troponina ultra-sensível', 'BNP ou NT-proBNP', 'Hemograma', 'Ureia, creatinina, eletrólitos', 'Gasometria arterial', 'Raio-X tórax PA', 'Ecocardiograma (se disponível)'],
    metas_terapeuticas: ['SatO2 > 94%', 'PAM 65–90 mmHg', 'FR < 25 ipm', 'Diurese > 100 ml/h na 1ª hora'],
    steps: [
      {
        n: 1,
        titulo: 'VNI imediata (CPAP ou BiPAP)',
        descricao: 'CPAP 5–10 cmH2O OU BiPAP IPAP 10–15 / EPAP 5–8. Reduz mortalidade e necessidade de IOT. Iniciar em todos com SpO2 < 90% ou FR > 25 em posição sentada.',
        urgencia: 'critico',
      },
      {
        n: 2,
        titulo: 'Furosemida IV',
        descricao: 'Furosemida 40–80 mg IV bolus (dobrar dose se em uso oral). Se sem resposta em 1h: 80–100 mg IV ou infusão contínua 5–10 mg/h. Monitorar eletrólitos (hipocalemia, hipomagnesemia).',
        urgencia: 'critico',
      },
      {
        n: 3,
        titulo: 'Nitrato se PA sistólica > 100 mmHg',
        descricao: 'Dinitrato de isossorbida sublingual 5 mg (repetir a cada 5–10 min, 3×) OU Nitroglicerina IV 10–20 mcg/min (titular até 200 mcg/min). Potente venodilatador: reduz pré-carga rapidamente.',
        urgencia: 'importante',
      },
      {
        n: 4,
        titulo: 'Identificar e tratar fator precipitante',
        descricao: 'FA com alta resposta: cardioversão ou controle de FC (Metoprolol EV ou Amiodarona). Hipertensão grave: nitroprussiato. IAM: reperfusão urgente. Infecção: ATB.',
        urgencia: 'importante',
      },
      {
        n: 5,
        titulo: 'Inotrópico se choque cardiogênico',
        descricao: 'Dobutamina 2,5–10 mcg/kg/min IC se PA < 90 sistólica com sinais de hipoperfusão. Evitar em FA (aumenta resposta ventricular). Milrinona se uso prévio de betabloqueador.',
        urgencia: 'critico',
        so_hospital: false,
      },
    ],
    drogas_chave: [
      { nome: 'Furosemida', dose: '40–80 mg IV (ou dobrar dose oral)', via: 'EV bolus', obs: 'Pode repetir ou fazer IC 5–10 mg/h' },
      { nome: 'Nitroglicerina', dose: '10–200 mcg/min', via: 'EV IC', obs: 'Apenas se PA sistólica > 100 mmHg' },
      { nome: 'Dobutamina', dose: '2,5–10 mcg/kg/min', via: 'EV IC', obs: 'Choque cardiogênico' },
    ],
  },

}

export { URGENCIA_CORES }
export const CATEGORIAS = {
  cardiovascular: { label: 'Cardiovascular', cor: '#E24B4A' },
  neurologico: { label: 'Neurológico', cor: '#BA7517' },
  respiratorio: { label: 'Respiratório', cor: '#378ADD' },
  metabolico: { label: 'Metabólico', cor: '#639922' },
  infectologia: { label: 'Infectologia', cor: '#8B5CF6' },
  trauma: { label: 'Trauma', cor: '#64748B' },
}
