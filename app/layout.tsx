import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PRECEPTOR.AI — Copiloto de Plantão',
  description: 'Ferramenta clínica para médicos em plantão',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
