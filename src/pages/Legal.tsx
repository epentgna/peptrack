import { useNavigate } from 'react-router-dom'
import { IconChevron } from '../components/icons'

/**
 * Páginas legais. O conteúdo abaixo é um RASCUNHO / MODELO — precisa ser
 * revisado e substituído por um profissional jurídico antes de cobrar ou
 * abrir ao público.
 */
export default function Legal({ doc }: { doc: 'termos' | 'privacidade' }) {
  const navigate = useNavigate()
  const isTerms = doc === 'termos'

  return (
    <div className="mx-auto w-full max-w-app min-h-full px-5 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted mb-4 font-mono text-[11px] tracking-widest uppercase"
      >
        <IconChevron width={16} height={16} className="rotate-180" /> Voltar
      </button>

      <div className="rounded-xl border border-amber-400/40 bg-amber-400/[0.06] px-3.5 py-2.5 mb-5 text-[12px] text-amber-200/90 leading-relaxed">
        RASCUNHO — modelo não revisado juridicamente. Substituir por texto de
        um advogado antes do lançamento.
      </div>

      <div className="eyebrow mb-1.5">
        {isTerms ? 'SYS.LEGAL // TERMS' : 'SYS.LEGAL // PRIVACY'}
      </div>
      <h1 className="text-2xl font-semibold text-ink mb-5">
        {isTerms ? 'Termos de Uso' : 'Política de Privacidade'}
      </h1>

      <div className="space-y-5 text-sm text-ink/85 leading-relaxed">
        {isTerms ? <TermsBody /> : <PrivacyBody />}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="sys-label text-cyan mb-1.5">{title}</h2>
      <div className="space-y-2 text-ink/80">{children}</div>
    </section>
  )
}

function TermsBody() {
  return (
    <>
      <p>Última atualização: [DATA]. Operado por [NOME/EMPRESA], contato [E‑MAIL].</p>
      <Section title="1. Natureza do serviço">
        <p>
          O PepTrack é uma ferramenta pessoal de <strong>registro e referência
          educacional</strong>. Não vende, fornece, prescreve nem recomenda
          substâncias, doses ou tratamentos. Não constitui orientação médica.
        </p>
      </Section>
      <Section title="2. Sem aconselhamento médico">
        <p>
          As informações são apenas educacionais. Consulte sempre um
          profissional de saúde qualificado. Você é o único responsável pelas
          suas decisões e pelo cumprimento das leis do seu país.
        </p>
      </Section>
      <Section title="3. Elegibilidade">
        <p>Você declara ter 18 anos ou mais para usar o serviço.</p>
      </Section>
      <Section title="4. Assinatura e pagamento">
        <p>
          Recursos premium podem exigir assinatura paga [descrever planos,
          renovação, reembolso conforme a loja/gateway e a legislação].
        </p>
      </Section>
      <Section title="5. Limitação de responsabilidade">
        <p>
          O serviço é fornecido "como está", sem garantias. Na máxima extensão
          permitida por lei, [NOME/EMPRESA] não se responsabiliza por danos
          decorrentes do uso.
        </p>
      </Section>
      <Section title="6. Alterações e contato">
        <p>Podemos atualizar estes termos. Dúvidas: [E‑MAIL].</p>
      </Section>
    </>
  )
}

function PrivacyBody() {
  return (
    <>
      <p>Última atualização: [DATA]. Responsável pelos dados: [NOME/EMPRESA], [E‑MAIL].</p>
      <Section title="1. Dados que coletamos">
        <p>
          Conta (e‑mail do login) e os dados que você registra (protocolo,
          doses, medições, frascos). Não coletamos dados de navegação de
          terceiros nem vendemos dados.
        </p>
      </Section>
      <Section title="2. Onde ficam">
        <p>
          Localmente no seu dispositivo e, ao entrar, sincronizados de forma
          protegida na sua conta (banco de dados [Supabase], com regras de
          acesso por usuário). [Descrever região do servidor.]
        </p>
      </Section>
      <Section title="3. Uso dos dados">
        <p>Operar e sincronizar o app na sua conta. Não usamos para publicidade.</p>
      </Section>
      <Section title="4. Seus direitos (LGPD/GDPR)">
        <p>
          Você pode exportar e apagar seus dados a qualquer momento pelo próprio
          app (aba Você), incluindo a exclusão total da conta. Solicitações:
          [E‑MAIL].
        </p>
      </Section>
      <Section title="5. Terceiros">
        <p>
          Usamos [Supabase] (banco/autenticação) e [provedor de pagamento] para
          processar assinaturas. Cada um trata dados conforme suas próprias
          políticas.
        </p>
      </Section>
    </>
  )
}
