import { useMemo } from 'react'
import { Card, CardHeader } from '../components/ui/Card'
import { MONTHS, WEEKDAYS_SHORT } from '../constants'
import { dateKey } from '../utils/date'
import { getLevelFromXP, getXPData, getFocusLog } from '../hooks/useTasks'
import s from './StatsPage.module.css'

// ── Heatmap — 52 weeks × 7 days like GitHub ─────────────────────────────────
function Heatmap({ tasks }) {
  const today   = new Date()
  const dayOfWeek = today.getDay()
  const weeks   = 26  // ~6 months
  const cells   = []

  for (let w = weeks - 1; w >= 0; w--) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const daysAgo = w * 7 + (dayOfWeek - d)
      const dt = new Date(today); dt.setDate(today.getDate() - daysAgo)
      if (dt > today) { week.push(null); continue }
      const k    = dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate())
      const dayT = tasks.filter(t => t.date === k)
      const dayD = dayT.filter(t => t.done).length
      const pct  = dayT.length ? dayD / dayT.length : -1
      week.push({ k, pct, count: dayD, date: dt.toLocaleDateString('pt-BR') })
    }
    cells.push(week)
  }

  const getColor = pct => {
    if (pct < 0) return 'var(--surface-2)'
    if (pct === 0) return 'rgba(109,40,217,0.08)'
    if (pct < 0.33) return 'rgba(109,40,217,0.25)'
    if (pct < 0.66) return 'rgba(109,40,217,0.55)'
    if (pct < 1)   return 'rgba(109,40,217,0.80)'
    return 'var(--accent)'
  }

  return (
    <div className={s.heatmapWrap}>
      <div className={s.heatmapDays}>
        {['D','S','T','Q','Q','S','S'].map((d,i) => (
          <div key={i} className={s.heatmapDayLabel}>{d}</div>
        ))}
      </div>
      <div className={s.heatmapGrid}>
        {cells.map((week, wi) => (
          <div key={wi} className={s.heatmapWeek}>
            {week.map((cell, di) => (
              <div key={di}
                className={s.heatCell}
                style={{ background: cell ? getColor(cell.pct) : 'transparent' }}
                title={cell ? `${cell.date}: ${cell.count} tarefas concluídas` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      <div className={s.heatLegend}>
        <span>Menos</span>
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <div key={p} className={s.heatLegendCell} style={{ background: getColor(p) }} />
        ))}
        <span>Mais</span>
      </div>
    </div>
  )
}

export function StatsPage({ tasks }) {
  const now   = new Date()
  const total = tasks.length
  const done  = tasks.filter(t => t.done).length
  const rate  = total ? Math.round(done / total * 100) : 0

  // Streak
  let streak = 0
  const chk = new Date()
  for (let i = 0; i < 365; i++) {
    const k  = dateKey(chk.getFullYear(), chk.getMonth(), chk.getDate())
    const dt = tasks.filter(t => t.date === k)
    if (dt.length && dt.every(t => t.done)) { streak++; chk.setDate(chk.getDate() - 1) }
    else if (i === 0) chk.setDate(chk.getDate() - 1)
    else break
  }

  // XP
  const xpData = getXPData()
  const { level, progress, needed } = getLevelFromXP(xpData.xp)

  // Week bars
  const weekBars = WEEKDAYS_SHORT.map((d, i) => {
    const diff = i - now.getDay()
    const dt   = new Date(now); dt.setDate(now.getDate() + diff)
    const k    = dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate())
    const dayT = tasks.filter(t => t.date === k)
    const dayD = dayT.filter(t => t.done).length
    return { d, isToday: i === now.getDay(), pct: dayT.length ? Math.round(dayD / dayT.length * 100) : 0, has: dayT.length > 0 }
  })

  // Monthly comparison
  const { thisMonthDone, lastMonthDone, monthDiff, monthDiffPct } = useMemo(() => {
    const curM = now.getMonth(), curY = now.getFullYear()
    const lastM = curM === 0 ? 11 : curM - 1
    const lastY = curM === 0 ? curY - 1 : curY
    const thisMonthDone = tasks.filter(t => {
      const d = new Date(t.date)
      return t.done && d.getFullYear() === curY && d.getMonth() === curM
    }).length
    const lastMonthDone = tasks.filter(t => {
      const d = new Date(t.date)
      return t.done && d.getFullYear() === lastY && d.getMonth() === lastM
    }).length
    const diff = thisMonthDone - lastMonthDone
    const pct  = lastMonthDone > 0 ? Math.round(diff / lastMonthDone * 100) : (thisMonthDone > 0 ? 100 : 0)
    return { thisMonthDone, lastMonthDone, monthDiff: diff, monthDiffPct: pct }
  }, [tasks, now])

  // Focus log stats
  const focusLog = getFocusLog()
  const focusBycat = focusLog.reduce((acc, e) => {
    acc[e.cat] = (acc[e.cat] || 0) + e.duration; return acc
  }, {})
  const totalFocusMins = Object.values(focusBycat).reduce((a, b) => a + b, 0) / 60

  // Monthly bars
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const monthBars   = Array.from({ length: daysInMonth }, (_, i) => {
    const k    = dateKey(now.getFullYear(), now.getMonth(), i + 1)
    const dayT = tasks.filter(t => t.date === k)
    const dayD = dayT.filter(t => t.done).length
    return { d: i + 1, isToday: i + 1 === now.getDate(), pct: dayT.length ? Math.round(dayD / dayT.length * 100) : 0, has: dayT.length > 0 }
  })

  // Category stats
  const catData = [
    { k: 'activity', lbl: 'Hábito', c: 'var(--orange)' },
    { k: 'study',    lbl: 'Estudo',    c: 'var(--blue)'   },
    { k: 'leisure',  lbl: 'Revisão',   c: 'var(--green)'  },
  ].map(row => {
    const catTotal = tasks.filter(t => t.cat === row.k).length
    const catDone  = tasks.filter(t => t.cat === row.k && t.done).length
    const pct      = catTotal ? Math.round(catDone / catTotal * 100) : 0
    return { ...row, catTotal, catDone, pct }
  })

  return (
    <div className={s.page}>
      {/* Top row — 3 headline metrics */}
      <div className={s.top3}>
        <Card>
          <div className={s.metricVal}>{rate}%</div>
          <div className={s.metricLbl}>Taxa de conclusão</div>
          <div className={s.weekBars}>
            {weekBars.map((b, i) => (
              <div key={i} className={s.barCol}>
                <div className={[s.bar, b.isToday ? s.today : b.has ? s.has : ''].join(' ')} style={{ height: `${Math.max(b.pct, 4)}%` }} />
                <div className={[s.barLbl, b.isToday ? s.todayLbl : ''].join(' ')}>{b.d}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className={s.metricVal}>{streak}</div>
          <div className={s.metricLbl}>Streak atual</div>
          <div className={s.streakRow}>
            <div className={s.streakComp}>
              <span className={s.streakCompLbl}>Recorde pessoal</span>
              <span className={s.streakCompVal}>{xpData.bestStreak} dias 🏆</span>
            </div>
          </div>
          <div className={s.xpMini}>
            <div className={s.xpMiniTop}>
              <span>Nível {level}</span><span>{xpData.xp} XP</span>
            </div>
            <div className={s.xpMiniTrack}>
              <div className={s.xpMiniFill} style={{ width: `${needed > 0 ? Math.round(progress/needed*100) : 100}%` }} />
            </div>
          </div>
        </Card>

        <Card>
          <div className={s.metricVal}>{monthDiff >= 0 ? '+' : ''}{monthDiffPct}%</div>
          <div className={s.metricLbl}>vs mês passado</div>
          <div className={s.monthComp}>
            <div className={s.monthCompRow}>
              <span className={s.monthCompLbl}>Este mês</span>
              <span className={s.monthCompVal} style={{ color: 'var(--accent)' }}>{thisMonthDone}</span>
            </div>
            <div className={s.monthCompRow}>
              <span className={s.monthCompLbl}>Mês passado</span>
              <span className={s.monthCompVal}>{lastMonthDone}</span>
            </div>
            {monthDiff !== 0 && (
              <div className={s.monthMsg} style={{ color: monthDiff > 0 ? 'var(--green)' : 'var(--red)' }}>
                {monthDiff > 0 ? `✓ +${monthDiff} tarefas a mais!` : `⚠ ${Math.abs(monthDiff)} tarefas a menos`}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* GitHub-style Heatmap */}
      <Card>
        <CardHeader title="Mapa de Calor — Últimos 6 meses" />
        <Heatmap tasks={tasks} />
      </Card>

      {/* Monthly bars */}
      <Card>
        <CardHeader title={`Progresso — ${MONTHS[now.getMonth()]}`} badge={`${rate}%`} />
        <div className={s.monthBars}>
          {monthBars.map((b, i) => (
            <div key={i} className={s.mBarCol}>
              <div className={s.mBar} style={{
                opacity: b.isToday ? 1 : b.has ? 0.55 : 0.14,
                height: `${Math.max(b.pct, b.has ? 8 : 2)}%`
              }} />
              <div className={s.mBarLbl} style={{ color: b.isToday ? 'var(--accent)' : 'var(--text-3)' }}>{b.d}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Row: totals + focus time */}
      <div className={s.row3}>
        {[
          { lbl: 'Total criadas', val: total,       bg: 'var(--blue-soft)',   c: 'var(--blue)',   icon: '📋' },
          { lbl: 'Concluídas',   val: done,          bg: 'var(--green-soft)',  c: 'var(--green)',  icon: '✅' },
          { lbl: 'Foco (min)',   val: Math.round(totalFocusMins), bg: 'var(--yellow-soft)', c: 'var(--yellow)', icon: '🍅' },
        ].map((s2, i) => (
          <Card key={i} style={{ textAlign: 'center' }}>
            <div className={s.s3Ico} style={{ background: s2.bg, color: s2.c }}>{s2.icon}</div>
            <div className={s.s3Val}>{s2.val}</div>
            <div className={s.s3Lbl}>{s2.lbl}</div>
          </Card>
        ))}
      </div>

      {/* Category bars with % */}
      <Card>
        <CardHeader title="Por categoria — taxa de conclusão" />
        <div className={s.catBars}>
          {catData.map(row => (
            <div key={row.k} className={s.catRow}>
              <div className={s.catMeta}>
                <span className={s.catLbl}>{row.lbl}</span>
                <div className={s.catRight}>
                  <span style={{ fontSize: 12, color: row.c, fontWeight: 600 }}>{row.pct}%</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 6 }}>{row.catDone}/{row.catTotal}</span>
                </div>
              </div>
              <div className={s.catTrack}>
                <div className={s.catFill} style={{ background: row.c, width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Focus by category */}
      {focusLog.length > 0 && (
        <Card>
          <CardHeader title="🍅 Tempo de foco por categoria" />
          <div className={s.catBars}>
            {Object.entries(focusBycat).map(([cat, secs]) => {
              const mins  = Math.round(secs / 60)
              const pct2  = totalFocusMins > 0 ? Math.round((secs / 60) / totalFocusMins * 100) : 0
              const colors = { study: 'var(--blue)', activity: 'var(--orange)', leisure: 'var(--green)' }
              return (
                <div key={cat} className={s.catRow}>
                  <div className={s.catMeta}>
                    <span className={s.catLbl}>{cat}</span>
                    <span style={{ fontSize: 12, color: colors[cat] || 'var(--accent)', fontWeight: 600 }}>{mins} min</span>
                  </div>
                  <div className={s.catTrack}>
                    <div className={s.catFill} style={{ background: colors[cat] || 'var(--accent)', width: `${pct2}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
