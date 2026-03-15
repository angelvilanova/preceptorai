export function RightPanel() {
  return (
    <div className="flex-1 bg-[#f7f6f3] flex items-center justify-center p-12 max-lg:hidden">
      <div className="max-w-[440px] w-full">
        <div className="inline-flex items-center gap-1.5 bg-[#FCEBEB] text-[#791F1F] text-[11px] font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
          Exclusivo para médicos
        </div>
        <h2 className="text-[26px] font-bold tracking-tight mb-3 leading-tight">Decisão clínica em segundos.</h2>
        <p className="text-sm text-[#666] leading-relaxed mb-8">
          Protocolos, cálculos de dose e condutas atualizados — no chat, na calculadora e pelo WhatsApp.
        </p>

        <div className="bg-white border border-[#e2e0d8] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e2e0d8] flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E24B4A]"/>
            <div className="w-2.5 h-2.5 rounded-full bg-[#f0c040]"/>
            <div className="w-2.5 h-2.5 rounded-full bg-[#4caf7d]"/>
            <span className="text-xs text-[#999] ml-1">Chat clínico</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="self-end bg-[#E24B4A] text-white text-xs px-3 py-2 rounded-2xl rounded-br-sm max-w-[75%]">
              Noradrenalina 72kg
            </div>
            <div className="self-start bg-[#f7f6f3] border border-[#e2e0d8] text-xs px-3 py-2 rounded-2xl rounded-bl-sm font-mono leading-loose max-w-[80%]">
              <strong className="text-[#E24B4A]">Noradrenalina</strong> — 72 kg<br/>
              Dose: 0,05 mcg/kg/min → 3,6 mcg/min<br/>
              Diluição: 4 mg em 50 ml SF<br/>
              <strong>Velocidade: 2,7 ml/h</strong>
            </div>
            <div className="self-end bg-[#E24B4A] text-white text-xs px-3 py-2 rounded-2xl rounded-br-sm">Conduta sepse</div>
            <div className="self-start bg-[#f7f6f3] border border-[#e2e0d8] text-xs px-3 py-2 rounded-2xl rounded-bl-sm leading-relaxed max-w-[80%]">
              1. Lactato venoso<br/>2. Hemocultura (2 pares)<br/>3. ATB em até 1h<br/>4. Cristaloide 30 ml/kg<br/>5. Nora se PAM &lt;65
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {[
            'Cálculos automáticos com peso do paciente',
            '8 protocolos de emergência com acesso em 1 clique',
            'WhatsApp integrado — responde sem abrir app',
          ].map(f => (
            <div key={f} className="flex items-center gap-2.5 text-[13px] text-[#666]">
              <div className="w-5 h-5 rounded-full bg-[#edf7f2] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 11 11" fill="none" className="w-2.5 h-2.5"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="#3d9b6e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
