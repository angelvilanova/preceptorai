export function BrandLogo() {
  return (
    <div className="flex items-center gap-3 mb-12">
      <div className="w-9 h-9 bg-[#E24B4A] rounded-[10px] flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
          <path d="M10 2v6M10 12v6M2 10h6M12 10h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <div className="text-[15px] font-bold tracking-tight">PRECEPTOR.AI</div>
        <div className="text-[11px] text-[#aaa]">Copiloto de plantão</div>
      </div>
    </div>
  )
}
