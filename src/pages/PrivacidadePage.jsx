import s from './LegalPage.module.css'

export function PrivacidadePage({ onBack }) {
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

          <h1 className={s.docTitle}>Política de Privacidade</h1>
          <p className={s.docLead}>
            Sua privacidade é fundamental para nós. Esta política explica como coletamos,
            usamos e protegemos suas informações quando você usa o HabitLife.
          </p>

          <div className={s.highlight}>
            <div className={s.highlightIcon}>🔒</div>
            <div>
              <strong>Compromisso de privacidade:</strong> Nunca vendemos seus dados. Suas informações são usadas exclusivamente para fornecer e melhorar o Serviço.
            </div>
          </div>

          <Section num="1" title="Informações que Coletamos">
            <p><strong>Dados fornecidos por você:</strong></p>
            <ul>
              <li>Nome e endereço de email (para criação de conta)</li>
              <li>Tarefas, hábitos e conteúdo que você cria</li>
              <li>Preferências e configurações do aplicativo</li>
            </ul>
            <p><strong>Dados coletados automaticamente:</strong></p>
            <ul>
              <li>Informações de uso do aplicativo (páginas visitadas, funcionalidades utilizadas)</li>
              <li>Dados técnicos (tipo de dispositivo, sistema operacional, navegador)</li>
              <li>Endereço IP e localização aproximada</li>
              <li>Logs de acesso e erros</li>
            </ul>
          </Section>

          <Section num="2" title="Como Usamos suas Informações">
            <p>Utilizamos suas informações para:</p>
            <ul>
              <li>Fornecer, manter e melhorar o Serviço</li>
              <li>Sincronizar seus dados entre dispositivos</li>
              <li>Enviar notificações e lembretes que você configurou</li>
              <li>Enviar atualizações importantes sobre o Serviço</li>
              <li>Detectar e prevenir fraudes e abusos</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </Section>

          <Section num="3" title="Base Legal (LGPD)">
            <p>Processamos seus dados pessoais com base nos seguintes fundamentos legais previstos na Lei Geral de Proteção de Dados (Lei 13.709/2018):</p>
            <ul>
              <li><strong>Execução de contrato:</strong> para fornecer o Serviço que você solicitou</li>
              <li><strong>Consentimento:</strong> para comunicações de marketing (você pode revogar a qualquer momento)</li>
              <li><strong>Interesse legítimo:</strong> para segurança e melhoria do Serviço</li>
              <li><strong>Obrigação legal:</strong> quando exigido por lei</li>
            </ul>
          </Section>

          <Section num="4" title="Compartilhamento de Dados">
            <p>Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:</p>
            <ul>
              <li><strong>Infraestrutura de nuvem:</strong> utilizamos serviços de armazenamento seguros para processar dados conforme as melhores práticas do setor.</li>
              <li><strong>Autoridades legais:</strong> quando exigido por lei ou ordem judicial</li>
              <li><strong>Proteção de direitos:</strong> para proteger nossos direitos, propriedade ou segurança</li>
            </ul>
          </Section>

          <Section num="5" title="Segurança dos Dados">
            <p>Implementamos medidas técnicas e organizacionais para proteger suas informações:</p>
            <ul>
              <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
              <li>Criptografia de senhas com bcrypt</li>
              <li>Autenticação segura com criptografia de ponta</li>
              <li>Acesso restrito aos dados por políticas de Row Level Security (RLS)</li>
              <li>Backups regulares e redundância de dados</li>
            </ul>
          </Section>

          <Section num="6" title="Retenção de Dados">
            <p>Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir sua conta, seus dados pessoais serão removidos em até 30 dias, exceto quando necessário para cumprimento de obrigações legais.</p>
          </Section>

          <Section num="7" title="Seus Direitos (LGPD)">
            <p>Conforme a LGPD, você tem direito a:</p>
            <ul>
              <li><strong>Acesso:</strong> solicitar uma cópia dos seus dados pessoais</li>
              <li><strong>Retificação:</strong> corrigir dados incorretos ou incompletos</li>
              <li><strong>Exclusão:</strong> solicitar a exclusão dos seus dados</li>
              <li><strong>Portabilidade:</strong> exportar seus dados em formato estruturado</li>
              <li><strong>Oposição:</strong> opor-se ao processamento em determinadas situações</li>
              <li><strong>Revogação:</strong> retirar consentimento a qualquer momento</li>
            </ul>
            <p>Para exercer esses direitos, entre em contato: <strong>privacidade@habitlife.app</strong></p>
          </Section>

          <Section num="8" title="Cookies e Armazenamento Local">
            <p>Utilizamos cookies de sessão essenciais para autenticação e localStorage para preferências de interface (tema, configurações visuais). Não utilizamos cookies de rastreamento ou publicidade.</p>
          </Section>

          <Section num="9" title="Crianças">
            <p>O Serviço não é destinado a menores de 13 anos. Não coletamos intencionalmente dados de crianças. Se você acredita que coletamos dados de uma criança, entre em contato imediatamente.</p>
          </Section>

          <Section num="10" title="Alterações a esta Política">
            <p>Podemos atualizar esta política periodicamente. Notificaremos você por email sobre mudanças significativas. O uso contínuo do Serviço após as alterações constitui aceitação da nova política.</p>
          </Section>

          <Section num="11" title="Contato e DPO">
            <p>Para questões de privacidade ou para exercer seus direitos:</p>
            <ul>
              <li>Email: <strong>privacidade@habitlife.app</strong></li>
              <li>Encarregado de Dados (DPO): disponível pelo mesmo email</li>
            </ul>
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
