import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { LogoIcon } from '../components/ui/LogoIcon'
import { Brain3D } from '../components/ui/Brain3D'
import s from './LandingPage.module.css'

// ─────────────────────────────────────────────────────────────────────────────
// Three.js — Particle field with strong cursor attraction
// ─────────────────────────────────────────────────────────────────────────────
function useThreeScene(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    camera.position.z = 6

    const COUNT = 3200
    const geometry  = new THREE.BufferGeometry()
    const positions  = new Float32Array(COUNT * 3)
    const origPos    = new Float32Array(COUNT * 3) // original positions to return to
    const sizes      = new Float32Array(COUNT)
    const speeds     = new Float32Array(COUNT)
    const phases     = new Float32Array(COUNT)
    const brightness = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      const x  = (Math.random() - 0.5) * 24
      const y  = (Math.random() - 0.5) * 15
      const z  = (Math.random() - 0.5) * 10
      positions[i3] = origPos[i3] = x
      positions[i3+1] = origPos[i3+1] = y
      positions[i3+2] = origPos[i3+2] = z
      sizes[i]      = Math.random() * 2.4 + 0.4
      speeds[i]     = Math.random() * 0.3 + 0.04
      phases[i]     = Math.random() * Math.PI * 2
      brightness[i] = Math.random() * 0.6 + 0.25
    }

    geometry.setAttribute('position',  new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aSize',     new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('aSpeed',    new THREE.BufferAttribute(speeds, 1))
    geometry.setAttribute('aPhase',    new THREE.BufferAttribute(phases, 1))
    geometry.setAttribute('aBright',   new THREE.BufferAttribute(brightness, 1))

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite:  false,
      blending:    THREE.AdditiveBlending,
      uniforms: {
        uTime:  { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aSpeed;
        attribute float aPhase;
        attribute float aBright;
        uniform float uTime;
        uniform vec2  uMouse;
        varying float vBright;
        varying float vDist;

        void main() {
          vBright = aBright;
          vec3 pos = position;

          // Gentle drift upward
          pos.y = mod(pos.y + uTime * aSpeed * 0.14 + aPhase * 0.5, 15.0) - 7.5;
          pos.x += sin(uTime * aSpeed * 0.25 + aPhase) * 0.10;

          // Strong cursor attraction — particles pulled toward mouse
          vec2 diff = uMouse - pos.xy;
          float dist = length(diff);
          float strength = 1.8 / (dist * dist + 0.8);
          pos.x += diff.x * strength * 0.28;
          pos.y += diff.y * strength * 0.28;

          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          vDist = -mvPos.z;
          gl_PointSize = aSize * (300.0 / vDist);
          gl_Position  = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        varying float vBright;
        varying float vDist;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float core = 1.0 - smoothstep(0.0, 0.2, d);
          float halo = 1.0 - smoothstep(0.0, 0.5, d);
          float alpha = (core * 0.92 + halo * 0.32) * vBright;
          // Indigo to teal gradient by brightness
          vec3 colA = vec3(0.55, 0.38, 0.95);
          vec3 colB = vec3(0.25, 0.80, 0.90);
          vec3 col  = mix(colA, colB, vBright * 0.6);
          gl_FragColor = vec4(col, alpha * 0.88);
        }
      `,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // ── Filament lines ──────────────────────────────────────────────────────
    const lineGroup = new THREE.Group()
    for (let i = 0; i < 22; i++) {
      const len = Math.random() * 2 + 0.4
      const geo = new THREE.BufferGeometry()
      const v   = new Float32Array(6)
      v[3] = len
      geo.setAttribute('position', new THREE.BufferAttribute(v, 3))
      const mat = new THREE.LineBasicMaterial({
        color: 0x9b72f8, transparent: true,
        opacity: Math.random() * 0.12 + 0.02,
        blending: THREE.AdditiveBlending,
      })
      const line = new THREE.Line(geo, mat)
      line.position.set(
        (Math.random()-0.5)*20,
        (Math.random()-0.5)*12,
        (Math.random()-0.5)*5 - 2
      )
      line.rotation.z = Math.random() * Math.PI * 2
      line.userData   = { speed: (Math.random()-0.5)*0.004, phase: Math.random()*Math.PI*2 }
      lineGroup.add(line)
    }
    scene.add(lineGroup)

    // ── Mouse in 3D world coords ────────────────────────────────────────────
    const mouse3D = new THREE.Vector2(0, 0)
    const targetMouse = new THREE.Vector2(0, 0)

    const onMouseMove = e => {
      // Convert screen → world (at z=0 plane)
      const rect = canvas.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width)  * 2 - 1
      const ny =-((e.clientY - rect.top)  / rect.height) * 2 + 1
      // Unproject to z=0 plane
      const vec = new THREE.Vector3(nx, ny, 0.5).unproject(camera)
      const dir = vec.sub(camera.position).normalize()
      const t   = -camera.position.z / dir.z
      const wp  = camera.position.clone().add(dir.multiplyScalar(t))
      targetMouse.set(wp.x, wp.y)
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Scroll tracking for camera zoom ────────────────────────────────────
    let scrollPct = 0
    const onScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight
      scrollPct = maxScroll > 0 ? window.scrollY / maxScroll : 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const onResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    }
    window.addEventListener('resize', onResize)

    let raf
    const clock = new THREE.Clock()

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Smooth mouse lerp
      mouse3D.lerp(targetMouse, 0.06)
      material.uniforms.uTime.value   = t
      material.uniforms.uMouse.value.copy(mouse3D)

      lineGroup.children.forEach(l => {
        l.rotation.z += l.userData.speed + Math.sin(t * 0.4 + l.userData.phase) * 0.001
        l.material.opacity = (Math.sin(t * 0.6 + l.userData.phase) * 0.5 + 0.5) * 0.10 + 0.015
      })

      camera.position.x += (mouse3D.x * 0.08 - camera.position.x) * 0.02
      camera.position.y += (mouse3D.y * 0.05 - camera.position.y) * 0.02

      // Scroll fly-through: camera moves forward (decreasing z) and FOV widens
      // At scroll=0: z=6 (far). At scroll=1: z= -4 (deep inside particle field)
      const targetZ = 6 - scrollPct * 10
      camera.position.z += (targetZ - camera.position.z) * 0.045

      // Grow particle sizes as we fly in (perspective makes them bigger automatically,
      // but we also increase the point scale for extra drama)
      const sizeBoost = 1.0 + scrollPct * 1.4
      material.uniforms.uTime.value   = t + scrollPct  // slight phase offset
      // Pass size scale via time: not needed — perspective handles size naturally

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [canvasRef])
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll-based darkness overlay
// ─────────────────────────────────────────────────────────────────────────────
function useScrollDarkness() {
  const [darkness, setDarkness] = useState(0)
  useEffect(() => {
    const h = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      setDarkness(Math.min(pct * 1.4, 0.88))
    }
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return darkness
}

// ─────────────────────────────────────────────────────────────────────────────
// IntersectionObserver reveal
// ─────────────────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, vis]
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────────────────────────
function Counter({ from = 0, to, suffix = '', duration = 2200 }) {
  const [val, setVal] = useState(from)
  const [ref, vis]    = useReveal()
  useEffect(() => {
    if (!vis) return
    const start = performance.now()
    const tick = now => {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 4)
      setVal(Math.round(from + (to - from) * e))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [vis, from, to, duration])
  return <span ref={ref}>{val.toLocaleString('pt-BR')}{suffix}</span>
}

// ─────────────────────────────────────────────────────────────────────────────
// Live clock
// ─────────────────────────────────────────────────────────────────────────────
function LiveClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const h  = String(t.getHours()).padStart(2,'0')
  const m  = String(t.getMinutes()).padStart(2,'0')
  const sc = String(t.getSeconds()).padStart(2,'0')
  return <span className={s.clockTick}>{h}<span className={s.colon}>:</span>{m}<span className={s.colon}>:</span>{sc}</span>
}

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter — FIXED: bright gradient text, never invisible
// ─────────────────────────────────────────────────────────────────────────────
const PHRASES = [
  'evolução contínua.',
  'disciplina que liberta.',
  'hábitos que compõem.',
  'clareza conquistada.',
  'conhecimento acumulado.',
  'tempo que rende mais.',
]

function TypewriterPhrase() {
  const [pi,  setPi]  = useState(0)
  const [txt, setTxt] = useState('')
  const [del, setDel] = useState(false)

  useEffect(() => {
    const phrase = PHRASES[pi]
    let timeout
    if (!del) {
      if (txt.length < phrase.length) timeout = setTimeout(() => setTxt(phrase.slice(0, txt.length + 1)), 68)
      else timeout = setTimeout(() => setDel(true), 2800)
    } else {
      if (txt.length > 0) timeout = setTimeout(() => setTxt(txt.slice(0, -1)), 36)
      else { setDel(false); setPi(p => (p + 1) % PHRASES.length) }
    }
    return () => clearTimeout(timeout)
  }, [txt, del, pi])

  return (
    <span className={s.typeWrap}>
      <span className={s.typePhrase}>{txt || '\u00A0'}</span>
      <span className={s.cursor} />
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Pillars
// ─────────────────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    num: '01',
    icon: <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5"/><path d="M16 9v7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/></svg>,
    title: 'Tempo Recuperado',
    desc:  'Hábitos consolidados automatizam decisões, devolvendo horas que eram desperdiçadas em hesitações repetidas. Automação comportamental é a maior alavanca de produtividade.',
    stat: '2.1h', statLabel: 'economizadas por dia em média',
  },
  {
    num: '02',
    icon: <svg viewBox="0 0 32 32" fill="none"><path d="M6 26L16 6l10 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 20h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    title: 'Evolução Composta',
    desc:  'Melhora de 1% ao dia resulta em 37× melhor ao final de um ano. Crescimento composto não é metáfora — é matemática aplicada ao aprendizado humano.',
    stat: '37×', statLabel: 'de melhora em 1 ano com 1% diário',
  },
  {
    num: '03',
    icon: <svg viewBox="0 0 32 32" fill="none"><path d="M7 25L12 12l4 6 4-10 5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'Conhecimento Rastreado',
    desc:  'O que não é medido não é aprimorado. Registrar seu progresso ativa circuitos de recompensa e reforça o comportamento — neurociência, não motivação.',
    stat: '3.2×', statLabel: 'mais sucesso com rastreamento contínuo',
  },
  {
    num: '04',
    icon: <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 26c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    title: 'Identidade Construída',
    desc:  'Você não conquista metas — torna-se o tipo de pessoa que naturalmente as realiza. Cada hábito é um voto diário da sua identidade intelectual futura.',
    stat: '66', statLabel: 'dias para um hábito se tornar automático',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────────────────────────
const TIMELINE = [
  { day: 'Dia 1',   title: 'A Decisão',       desc: 'Você escolhe deliberadamente quem quer se tornar. O primeiro hábito de estudo é ativado com intenção.' },
  { day: 'Dia 21',  title: 'A Fricção Some',  desc: 'O comportamento começa a exigir menos esforço consciente. Seu cérebro começa a otimizar o caminho neural.' },
  { day: 'Dia 66',  title: 'O Automático',    desc: 'Estudos da UCL confirmam: o hábito agora opera quase sem esforço. Você liberou banda cognitiva para o que importa.' },
  { day: 'Dia 180', title: 'A Identidade',    desc: 'Você não faz o hábito — você é o hábito. A transformação de identidade intelectual está completa.' },
  { day: 'Dia 365', title: 'O Composto',      desc: '37× melhor. Um ano de incrementos diários acumulados. Você literalmente não é mais a mesma pessoa.' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export function LandingPage({ onEnter }) {
  const canvasRef = useRef(null)
  useThreeScene(canvasRef)
  const darkness = useScrollDarkness()

  const [heroRef,     heroVis]     = useReveal(0.05)
  const [pillarsRef,  pillarsVis]  = useReveal(0.05)
  const [timelineRef, timelineVis] = useReveal(0.05)
  const [statsRef,    statsVis]    = useReveal(0.08)
  const [ctaRef,      ctaVis]      = useReveal(0.15)

  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <div className={s.page}>
      <canvas ref={canvasRef} className={s.canvas} />
      <div className={s.grain} aria-hidden />
      <div className={s.glow1} aria-hidden />
      <div className={s.glow2} aria-hidden />

      {/* Progressive scroll darkness overlay */}
      <div
        className={s.scrollDark}
        style={{ opacity: darkness }}
        aria-hidden
      />

      {/* ── Nav ── */}
      <nav className={[s.nav, scrolled ? s.navScrolled : ''].join(' ')}>
        <div className={s.navLogo}>
          <div className={s.navLogoIcon}>
            <LogoIcon size={28} />
          </div>
          <div className={s.navLogoText}>
            <span>HabitLife</span>
            <span className={s.navLogoSub}>Evolução</span>
          </div>
        </div>
        <div className={s.navCenter}><LiveClock /></div>
        <div className={s.navRight}>
          <button className={s.navBtn}  onClick={onEnter}>Entrar</button>
          <button className={s.navCta}  onClick={onEnter}>Começar agora</button>
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <section className={s.hero} ref={heroRef}>
        <div className={[s.heroInner, heroVis ? s.visible : ''].join(' ')}>
          <div className={s.heroBadge}>
            <div className={s.heroBadgeDot} />
            <span>Rastreamento inteligente de hábitos e evolução</span>
          </div>

          <h1 className={s.heroH1}>
            <span className={s.heroLine1}>Cada segundo</span>
            <span className={s.heroLine2}>conta para</span>
            <span className={s.heroLine3}><TypewriterPhrase /></span>
          </h1>

          <p className={s.heroSub}>
            O tempo é o único recurso não renovável. Hábitos de estudo e evolução
            são a tecnologia mais antiga para multiplicar o que você faz com cada hora.
          </p>

          <div className={s.heroCtas}>
            <button className={s.heroCtaPrimary} onClick={onEnter}>
              <span>Começar minha evolução</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button className={s.heroCtaGhost} onClick={() => document.getElementById('pilares')?.scrollIntoView({ behavior: 'smooth' })}>
              Como funciona
            </button>
          </div>

          <div className={s.heroScroll}>
            <div className={s.scrollLine} />
            <span>Role para explorar</span>
          </div>
        </div>

        {/* 3D Brain — local GLB model */}
        <div className={[s.brainWrap, heroVis ? s.visible : ''].join(' ')}>
          <div className={s.brainGlow} aria-hidden />
          <div className={s.brainFrame}>
            <Brain3D className={s.brainCanvas} />
          </div>

        </div>
      </section>

      {/* ════ STATS STRIP ════ */}
      <section className={s.statsStrip} ref={statsRef}>
        <div className={[s.statsInner, statsVis ? s.visible : ''].join(' ')}>
          {[
            { n: 2400,   suf: '+', label: 'pessoas em evolução' },
            { n: 140000, suf: '+', label: 'hábitos rastreados' },
            { n: 37,     suf: '×', label: 'de melhora em 1 ano' },
            { n: 66,     suf: '',  label: 'dias para automatizar' },
          ].map((item, i) => (
            <div key={i} className={s.statItem} style={{'--si':i}}>
              <div className={s.statNum}><Counter to={item.n} suffix={item.suf} duration={2000+i*200}/></div>
              <div className={s.statLbl}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ PILLARS ════ */}
      <section className={s.pillars} id="pilares" ref={pillarsRef}>
        <div className={s.sectionLabel}>Como funciona</div>
        <h2 className={[s.sectionH2, pillarsVis ? s.visible : ''].join(' ')}>
          Os quatro pilares<br/><em>da transformação pessoal</em>
        </h2>
        <p className={[s.sectionSub, pillarsVis ? s.visible : ''].join(' ')}>
          Não vendemos motivação — construímos sistemas. Porque sistemas vencem sentimentos.
        </p>
        <div className={[s.pillarsGrid, pillarsVis ? s.visible : ''].join(' ')}>
          {PILLARS.map((p, i) => (
            <div key={i} className={s.pillarCard} style={{'--pi':i}}>
              <div className={s.pillarNum}>{p.num}</div>
              <div className={s.pillarIcon}>{p.icon}</div>
              <h3 className={s.pillarTitle}>{p.title}</h3>
              <p  className={s.pillarDesc}>{p.desc}</p>
              <div className={s.pillarStat}>
                <span className={s.pillarStatVal}>{p.stat}</span>
                <span className={s.pillarStatLbl}>{p.statLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ TIMELINE ════ */}
      <section className={s.timeline} ref={timelineRef}>
        <div className={s.sectionLabel}>Sua jornada</div>
        <h2 className={[s.sectionH2, timelineVis ? s.visible : ''].join(' ')}>
          O arco do tempo<br/><em>trabalhando por você</em>
        </h2>
        <div className={[s.timelineTrack, timelineVis ? s.visible : ''].join(' ')}>
          <div className={s.timelineLine}/>
          {TIMELINE.map((item, i) => (
            <div key={i} className={s.timelineItem} style={{'--ti':i}}>
              <div className={s.timelineDot}><div className={s.timelineDotInner}/></div>
              <div className={s.timelineContent}>
                <div className={s.timelineDay}>{item.day}</div>
                <div className={s.timelineTitle}>{item.title}</div>
                <div className={s.timelineDesc}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ QUOTE ════ */}
      <section className={s.quoteSection}>
        <div className={s.quoteInner}>
          <div className={s.quoteMarks}>"</div>
          <blockquote className={s.quote}>
            Nós somos o que repetidamente fazemos. A excelência, portanto,
            não é um ato — é um hábito.
          </blockquote>
          <cite className={s.quoteCite}>— Aristóteles, 384–322 a.C.</cite>
          <div className={s.quoteDecor} aria-hidden/>
        </div>
      </section>

      {/* ════ CTA FINAL ════ */}
      <section className={s.ctaSection} ref={ctaRef}>
        <div className={[s.ctaInner, ctaVis ? s.visible : ''].join(' ')}>
          <div className={s.ctaGlow} aria-hidden/>
          
          <h2 className={s.ctaH2}>
            O melhor momento<br/>para começar era ontem.<br/><em>O segundo melhor é agora.</em>
          </h2>
          <p className={s.ctaSub}>
            Seu futuro está sendo construído pelos hábitos de hoje.
            Cada dia sem rastreamento é uma oportunidade de crescimento não registrada.
          </p>
          <button className={s.ctaBtn} onClick={onEnter}>
            <span>Começar minha evolução</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <p className={s.ctaMicro}>Gratuito. Sem cartão. Dados seguros.</p>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={s.footerLogo}>
          <div className={s.navLogoIcon}>
            <LogoIcon size={20} />
          </div>
          <span>HabitLife · Evolução</span>
        </div>
        <p className={s.footerMicro}>© {new Date().getFullYear()} HabitLife. Construído com React + Three.js · Todos os direitos reservados</p>
      </footer>
    </div>
  )
}
