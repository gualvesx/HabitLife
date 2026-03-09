import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import s from './ConfirmEmail.module.css'

export function ConfirmEmail({ email, onBack }) {
  const [resent,   setResent]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [countdown, setCountdown] = useState(0)

  // Countdown timer after resend
  useEffect(() => {
    if (countdown <= 0) return
    const id = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  const handleResend = async () => {
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.resend({ type: 'signup', email })
    setLoading(false)
    if (err) { setError('Erro ao reenviar. Tente novamente.'); return }
    setResent(true)
    setCountdown(60)
  }

  return (
    <div className={s.page}>
      {/* Animated envelope */}
      <div className={s.envelope} aria-hidden>
        <div className={s.envBody}>
          <div className={s.envFlap} />
          <div className={s.envLines}>
            <div className={s.envLine} style={{'--w':'55%'}} />
            <div className={s.envLine} style={{'--w':'40%'}} />
          </div>
        </div>
        <div className={s.envDots}>
          {[0,1,2].map(i => <div key={i} className={s.envDot} style={{'--di': i}} />)}
        </div>
      </div>

      <div className={s.content}>
        <div className={s.badge}>
          <div className={s.badgeDot} />
          <span>Verifique seu email</span>
        </div>

        <h1 className={s.h1}>Quase lá!</h1>
        <p className={s.desc}>
          Enviamos um link de confirmação para
        </p>
        <div className={s.emailBox}>{email}</div>
        <p className={s.subdesc}>
          Clique no link do email para ativar sua conta.
          Verifique também a pasta de spam se não encontrar.
        </p>

        {error && <div className={s.error}>{error}</div>}

        {resent && (
          <div className={s.success}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Email reenviado com sucesso!
          </div>
        )}

        <div className={s.actions}>
          <button
            className={s.resendBtn}
            onClick={handleResend}
            disabled={loading || countdown > 0}
          >
            {loading ? (
              <span className={s.spinner} />
            ) : countdown > 0 ? (
              `Reenviar em ${countdown}s`
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                Reenviar email
              </>
            )}
          </button>

          <button className={s.backBtn} onClick={onBack}>
            ← Usar outro email
          </button>
        </div>

        <div className={s.tips}>
          <div className={s.tipsTitle}>Não recebeu?</div>
          <ul className={s.tipsList}>
            <li>Verifique a pasta de <strong>spam</strong> ou <strong>lixo eletrônico</strong></li>
            <li>O email pode levar até <strong>5 minutos</strong> para chegar</li>
            <li>Certifique-se que o email está correto</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
