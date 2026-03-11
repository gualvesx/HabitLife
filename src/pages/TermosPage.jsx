import s from './LegalPage.module.css'

export function TermosPage({ onBack }) {
  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerInner}>
          <div className={s.logo}>
            <div className={s.logoIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <span>HabitLife</span>
          </div>
          <button className={s.backBtn} onClick={onBack}>← Voltar</button>
        </div>
      </div>

      <div className={s.content}>
        <div className={s.doc}>
          <div className={s.docMeta}>
            <span className={s.docBadge}>Documento legal</span>
            <span className={s.docDate}>Última atualização: 8 de março de 2025</span>
          </div>

          <h1 className={s.docTitle}>Termos de Uso</h1>
          <p className={s.docLead}>
            Bem-vindo ao HabitLife. Ao utilizar nossos serviços, você concorda com os termos descritos abaixo.
            Leia atentamente antes de criar sua conta.
          </p>

          <Section num="1" title="Aceitação dos Termos">
            <p>Ao acessar ou usar o HabitLife ("Serviço"), você confirma que tem pelo menos 13 anos de idade e que leu, entendeu e concorda em ficar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar o Serviço.</p>
          </Section>

          <Section num="2" title="Descrição do Serviço">
            <p>O HabitLife é uma plataforma de rastreamento de hábitos, estudo e evolução pessoal que permite aos usuários:</p>
            <ul>
              <li>Criar e gerenciar tarefas e hábitos diários</li>
              <li>Acompanhar progresso e sequências de estudo</li>
              <li>Visualizar estatísticas de desempenho</li>
              <li>Organizar compromissos em calendário</li>
              <li>Utilizar timer de foco (técnica Pomodoro)</li>
            </ul>
          </Section>

          <Section num="3" title="Conta de Usuário">
            <p>Para utilizar o Serviço, você precisará criar uma conta fornecendo um endereço de email válido e uma senha. Você é responsável por:</p>
            <ul>
              <li>Manter a confidencialidade das suas credenciais de acesso</li>
              <li>Todas as atividades realizadas sob sua conta</li>
              <li>Notificar-nos imediatamente em caso de uso não autorizado</li>
              <li>Fornecer informações precisas e atualizadas</li>
            </ul>
            <p>Reservamo-nos o direito de encerrar contas que violem estes termos.</p>
          </Section>

          <Section num="4" title="Uso Aceitável">
            <p>Você concorda em não utilizar o Serviço para:</p>
            <ul>
              <li>Fins ilegais ou não autorizados</li>
              <li>Transmitir vírus, malware ou código malicioso</li>
              <li>Tentar acessar sistemas ou dados não autorizados</li>
              <li>Interferir na integridade ou desempenho do Serviço</li>
              <li>Coletar dados de outros usuários sem consentimento</li>
            </ul>
          </Section>

          <Section num="5" title="Propriedade Intelectual">
            <p>O Serviço e seu conteúdo original, recursos e funcionalidades são propriedade do HabitLife e são protegidos por direitos autorais, marcas registradas e outras leis de propriedade intelectual. Você não pode reproduzir, distribuir ou criar obras derivadas sem autorização expressa.</p>
            <p>Conteúdo criado por você (tarefas, notas, etc.) permanece de sua propriedade. Ao usar o Serviço, você nos concede licença para armazenar e processar esse conteúdo unicamente para fornecer o Serviço.</p>
          </Section>

          <Section num="6" title="Limitação de Responsabilidade">
            <p>O HabitLife é fornecido "como está", sem garantias de qualquer tipo. Em nenhum caso seremos responsáveis por danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou impossibilidade de uso do Serviço.</p>
          </Section>

          <Section num="7" title="Modificações dos Termos">
            <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Você será notificado por email sobre alterações significativas. O uso contínuo do Serviço após as modificações constitui aceitação dos novos termos.</p>
          </Section>

          <Section num="8" title="Rescisão">
            <p>Você pode encerrar sua conta a qualquer momento nas configurações do aplicativo. Podemos suspender ou encerrar seu acesso por violação destes termos, com ou sem aviso prévio.</p>
          </Section>

          <Section num="9" title="Lei Aplicável">
            <p>Estes Termos serão regidos pelas leis do Brasil. Qualquer disputa será submetida à jurisdição dos tribunais competentes brasileiros.</p>
          </Section>

          <Section num="10" title="Contato">
            <p>Dúvidas sobre estes Termos? Entre em contato: <strong>legal@habitlife.app</strong></p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ num, title, children }) {
  return (
    <section>
      <h2><span>{num}.</span> {title}</h2>
      {children}
    </section>
  )
}
