import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Raw GitHub URL — served directly as binary, no redirect issues
// blob/ links return HTML; raw.githubusercontent.com serves the actual file
const RAW_URL = 'https://raw.githubusercontent.com/gualvesx/HabitLife/main/public/amethyst_cortex.glb'

export function Brain3D({ className, style }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1

    const scene = new THREE.Scene()
    const w = canvas.clientWidth || 460
    const h = canvas.clientHeight || 460
    renderer.setSize(w, h, false)
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100)
    camera.position.set(0, 0.15, 4.2)

    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const key  = new THREE.DirectionalLight(0xddd6fe, 3.5); key.position.set(5, 8, 5);   scene.add(key)
    const back = new THREE.DirectionalLight(0x4c1d95, 2.2); back.position.set(-5,-3,-4); scene.add(back)
    const rim  = new THREE.PointLight(0xa78bfa, 4, 12);     rim.position.set(2, 4, -3);  scene.add(rim)
    const fill = new THREE.PointLight(0x7c3aed, 2.5, 10);   fill.position.set(-4, 1, 3); scene.add(fill)

    let model = null, animId = null
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0

    const onMouse = e => {
      const r = canvas.getBoundingClientRect()
      mouseX = ((e.clientX - r.left) / r.width  - 0.5) * 1.8
      mouseY = -((e.clientY - r.top) / r.height - 0.5) * 1.2
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    ;(async () => {
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        const loader = new GLTFLoader()

        // 1st attempt: local public/ (works when running locally or Vercel deploys the file)
        // 2nd attempt: raw GitHub (works when public/ file is missing from deploy)
        const urls = ['/amethyst_cortex.glb', RAW_URL]
        let buf = null

        for (const url of urls) {
          try {
            const res = await fetch(url)
            if (!res.ok) continue
            const candidate = await res.arrayBuffer()
            // Validate GLB magic bytes: 0x676C5446 = "glTF"
            const view = new Uint8Array(candidate, 0, 4)
            if (view[0]===0x67 && view[1]===0x6C && view[2]===0x54 && view[3]===0x46) {
              buf = candidate
              break
            }
          } catch { /* try next */ }
        }

        if (!buf) throw new Error('All sources failed or returned non-GLB data')

        const gltf = await new Promise((res2, rej2) => loader.parse(buf, '', res2, rej2))

        model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const cen = box.getCenter(new THREE.Vector3())
        const sz  = box.getSize(new THREE.Vector3()).length()
        model.position.sub(cen)
        model.scale.setScalar(3.2 / sz)
        model.traverse(obj => {
          if (obj.isMesh && obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
            mats.forEach(m => {
              m.roughness = Math.max(0.08, (m.roughness ?? 0.5) * 0.55)
              m.metalness = Math.min(0.92, (m.metalness ?? 0.1) + 0.35)
              m.needsUpdate = true
            })
          }
        })
        scene.add(model)
      } catch (err) {
        console.error('Brain3D: failed to load GLB —', err.message)
      }
    })()

    let t = 0
    const render = () => {
      animId = requestAnimationFrame(render)
      t += 0.005
      targetX += (mouseX - targetX) * 0.035
      targetY += (mouseY - targetY) * 0.035
      rim.intensity = 3.5 + Math.sin(t * 1.8) * 0.8
      if (model) {
        model.rotation.y = t * 0.28 + targetX * 0.45
        model.rotation.x = Math.sin(t * 0.22) * 0.08 + targetY * 0.18
        model.position.y = Math.sin(t * 0.6) * 0.06
      }
      renderer.render(scene, camera)
    }
    render()

    const handleResize = () => {
      const el = canvas.parentElement; if (!el) return
      const nw = el.clientWidth, nh = el.clientHeight; if (!nw || !nh) return
      renderer.setSize(nw, nh, false)
      camera.aspect = nw / nh; camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(handleResize)
    ro.observe(canvas.parentElement || canvas); handleResize()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      ro.disconnect(); renderer.dispose()
    }
  }, [])

  return (
    <canvas ref={canvasRef} className={className}
      style={{ width: '100%', height: '100%', display: 'block', ...style }} />
  )
}
