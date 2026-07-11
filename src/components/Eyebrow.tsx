export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>
}

export const DISCLAIMER =
  'Apenas para referência educacional. Não constitui orientação médica. Consulte um profissional de saúde qualificado.'

export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-[11px] leading-relaxed text-muted/80 ${className}`}>
      {DISCLAIMER}
    </p>
  )
}
