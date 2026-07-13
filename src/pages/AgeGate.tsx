import { Link } from 'react-router-dom'
import { IconProtocol } from '../components/icons'
import { Disclaimer } from '../components/Eyebrow'

/** Confirmação de idade (18+) exibida uma vez, antes do login. */
export default function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className="mx-auto w-full max-w-app min-h-full px-6 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="mb-8 h-20 w-20 rounded-3xl border border-cyan/40 bg-cyan/10 flex items-center justify-center shadow-glow">
          <IconProtocol width={36} height={36} className="text-cyan" />
        </div>
        <div className="eyebrow mb-3">SYS.GATE // 18+</div>
        <h1 className="text-[28px] leading-tight font-semibold text-ink mb-3">
          Conteúdo para maiores de 18
        </h1>
        <p className="text-muted text-[15px] leading-relaxed mb-8 px-1">
          O PepTrack é uma ferramenta de registro e referência educacional. Não
          vende, prescreve nem recomenda substâncias ou doses. Não constitui
          orientação médica.
        </p>

        <button className="btn-primary" onClick={onConfirm}>
          Tenho 18 anos ou mais — entrar
        </button>

        <p className="mt-4 text-[12px] text-muted">
          Ao continuar você concorda com os{' '}
          <Link to="/termos" className="text-cyan underline">
            Termos
          </Link>{' '}
          e a{' '}
          <Link to="/privacidade" className="text-cyan underline">
            Privacidade
          </Link>
          .
        </p>
      </div>

      <div
        className="pb-8 pt-4"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <Disclaimer className="text-center" />
      </div>
    </div>
  )
}
