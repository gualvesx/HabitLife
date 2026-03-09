import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Google Drive direct download — will attempt first, fallback if CORS blocks
const GLB_URL = 'https://drive.google.com/uc?export=download&id=1IvoLR2CEsmqqTVgQLKB9OIyyeBtRFB60'

// ── Procedural Brain ────────────────────────────────────────────────────────
// Beautiful cortex-like brain built entirely from Three.js geometry
function buildProceduralBrain(scene) {
  const group = new THREE.Group()

  // ── Materials ──
  const matBrain = new THREE.MeshStandardMaterial({
    color: 0x7c3aed,
    roughness: 0.45,
    metalness: 0.35,
    envMapIntensity: 1.2,
  })
  const matGyre = new THREE.MeshStandardMaterial({
    color: 0x9b72f8,
    roughness: 0.3,
    metalness: 0.5,
  })
  const matDeep = new THREE.MeshStandardMaterial({
    color: 0x4c1d95,
    roughness: 0.6,
    metalness: 0.2,
  })

  // ── Base hemispheres ──
  const baseGeo = new THREE.SphereGeometry(1, 64, 64)

  // Deform sphere vertices to look more brain-like
  const pos = baseGeo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const theta = Math.atan2(z, x)
    const phi   = Math.acos(Math.max(-1, Math.min(1, y)))

    // Add lobes / folds
    const fold =
      0.06 * Math.sin(6 * theta + 2 * phi) * Math.cos(4 * phi) +
      0.04 * Math.sin(10 * theta) * Math.sin(6 * phi) +
      0.03 * Math.cos(8 * theta + phi) +
      0.025 * Math.sin(14 * theta + 3 * phi)

    // Flatten bottom slightly (like a real brain)
    const flattenY = y < -0.5 ? (y + 0.5) * 0.6 - 0.5 : y

    const r = 1 + fold
    pos.setXYZ(i, x * r, flattenY * r * 0.88, z * r)
  }
  baseGeo.computeVertexNormals()

  // Left hemisphere
  const hemiL = new THREE.Mesh(baseGeo, matBrain)
  hemiL.position.set(-0.08, 0, 0)
  hemiL.scale.set(0.98, 1, 1)
  group.add(hemiL)

  // Right hemisphere (mirror)
  const hemiR = new THREE.Mesh(baseGeo, matBrain.clone())
  hemiR.position.set(0.08, 0, 0)
  hemiR.scale.set(-0.98, 1, 1)
  group.add(hemiR)

  // ── Gyri (ridges) — looping torus tubes across the surface ──
  const gyriDefs = [
    // [radiusX, radiusY, tilt, offsetX, offsetY, offsetZ, scaleX, scaleZ]
    { r: 0.82, tube: 0.055, seg: 28, tilt: [Math.PI/2, 0, 0.2],   pos: [-0.05, 0.25, 0],   mat: matGyre },
    { r: 0.75, tube: 0.050, seg: 26, tilt: [Math.PI/2, 0, -0.3],  pos: [0.05,  0.15, 0.1], mat: matGyre },
    { r: 0.70, tube: 0.048, seg: 24, tilt: [Math.PI/2.2, 0.3, 0], pos: [-0.1, -0.05, 0.2], mat: matGyre },
    { r: 0.65, tube: 0.045, seg: 22, tilt: [Math.PI/2.5, -0.2,0.4],pos:[0,  0.4,  0.05], mat: matGyre },
    { r: 0.72, tube: 0.042, seg: 20, tilt: [1.1, 0.5, -0.3],      pos: [0.05, -0.2, 0.1],  mat: matGyre },
    { r: 0.68, tube: 0.040, seg: 18, tilt: [1.3, -0.4, 0.6],      pos: [-0.08, 0.1, -0.3], mat: matGyre },
    { r: 0.60, tube: 0.038, seg: 18, tilt: [0.8,  0.8, 0.2],      pos: [0.1, -0.35, -0.15],mat: matDeep },
    { r: 0.55, tube: 0.035, seg: 16, tilt: [1.6, -0.3, -0.5],     pos: [-0.12, 0.5, -0.1], mat: matGyre },
    { r: 0.78, tube: 0.046, seg: 22, tilt: [Math.PI/2, 0.7, 0],   pos: [0,   0, 0.3],      mat: matGyre },
    { r: 0.62, tube: 0.040, seg: 16, tilt: [0.9, -0.6, 0.3],      pos: [0.15, 0.2, -0.2],  mat: matDeep },
    { r: 0.58, tube: 0.036, seg: 14, tilt: [1.4,  0.4,-0.7],      pos: [-0.2,-0.1, 0.25],  mat: matGyre },
    { r: 0.50, tube: 0.032, seg: 14, tilt: [0.7, -0.9, 0.5],      pos: [0.08, 0.55, 0.15], mat: matDeep },
  ]

  gyriDefs.forEach(d => {
    const geo  = new THREE.TorusGeometry(d.r, d.tube, 8, d.seg)
    const mesh = new THREE.Mesh(geo, d.mat)
    mesh.rotation.set(...d.tilt)
    mesh.position.set(...d.pos)
    group.add(mesh)
  })

  // ── Medial longitudinal fissure (groove between hemispheres) ──
  const fissureGeo = new THREE.CylinderGeometry(0.05, 0.06, 1.6, 16)
  const fissure    = new THREE.Mesh(fissureGeo, matDeep)
  fissure.rotation.z = Math.PI / 2
  fissure.position.set(0, 0.1, 0)
  group.add(fissure)

  // ── Brain stem ──
  const stemGeo  = new THREE.CylinderGeometry(0.22, 0.14, 0.55, 20)
  const stem     = new THREE.Mesh(stemGeo, matDeep)
  stem.position.set(0, -0.92, 0.05)
  stem.rotation.x = -0.12
  group.add(stem)

  // ── Cerebellum (back lower) ──
  const cbGeo  = new THREE.SphereGeometry(0.42, 32, 24)
  const cb     = new THREE.Mesh(cbGeo, matBrain.clone())
  cb.position.set(0, -0.62, -0.58)
  cb.scale.set(1.15, 0.7, 0.75)
  group.add(cb)

  // Cerebellum folds
  for (let i = 0; i < 5; i++) {
    const fGeo  = new THREE.TorusGeometry(0.28, 0.025, 8, 20)
    const fMesh = new THREE.Mesh(fGeo, matGyre)
    fMesh.position.set(0, -0.6 - i * 0.05, -0.55)
    fMesh.rotation.x = Math.PI / 2 + i * 0.12
    fMesh.scale.set(1.2, 0.6, 1)
    group.add(fMesh)
  }

  // ── Glowing neural dots scattered on surface ──
  const dotMat = new THREE.MeshStandardMaterial({
    color: 0xd8b4fe,
    emissive: 0xa78bfa,
    emissiveIntensity: 1.2,
    roughness: 0.1,
    metalness: 0.8,
  })
  const dotPositions = [
    [0.6, 0.55, 0.5], [-0.7, 0.4, 0.3], [0.3, 0.8, 0.35],
    [-0.4, -0.1, 0.85], [0.8, -0.2, 0.3], [-0.6, 0.7, -0.3],
    [0.5, -0.55, 0.6], [-0.3, 0.6, -0.65], [0.7, 0.1, -0.55],
  ]
  dotPositions.forEach(([x, y, z]) => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), dotMat)
    dot.position.set(x, y, z)
    group.add(dot)
  })

  group.rotation.x = -0.1
  group.scale.setScalar(0.9)
  scene.add(group)
  return group
}

export function Brain3D({ className, style }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.shadowMap.enabled = false
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1

    const scene  = new THREE.Scene()
    const w = canvas.clientWidth || 460
    const h = canvas.clientHeight || 460
    renderer.setSize(w, h, false)
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 100)
    camera.position.set(0, 0.15, 4.2)

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))

    const key = new THREE.DirectionalLight(0xddd6fe, 3.5)
    key.position.set(5, 8, 5)
    scene.add(key)

    const back = new THREE.DirectionalLight(0x4c1d95, 2.2)
    back.position.set(-5, -3, -4)
    scene.add(back)

    const rim = new THREE.PointLight(0xa78bfa, 4, 12)
    rim.position.set(2, 4, -3)
    scene.add(rim)

    const fill = new THREE.PointLight(0x7c3aed, 2.5, 10)
    fill.position.set(-4, 1, 3)
    scene.add(fill)

    const bot = new THREE.PointLight(0xc4b5fd, 1.5, 8)
    bot.position.set(0, -4, 2)
    scene.add(bot)

    let model = null, animId = null
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0

    const onMouse = e => {
      const r = canvas.getBoundingClientRect()
      mouseX = ((e.clientX - r.left) / r.width  - 0.5) * 1.8
      mouseY = -((e.clientY - r.top) / r.height - 0.5) * 1.2
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    // Try to load GLB first, fall back to procedural
    ;(async () => {
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        const gltf = await new Promise((res, rej) => {
          const loader = new GLTFLoader()
          loader.load(GLB_URL, res, undefined, rej)
        })
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
      } catch {
        // GLB unavailable (CORS/network) — use beautiful procedural brain
        model = buildProceduralBrain(scene)
      }
    })()

    let t = 0
    const render = () => {
      animId = requestAnimationFrame(render)
      t += 0.005

      targetX += (mouseX - targetX) * 0.035
      targetY += (mouseY - targetY) * 0.035

      // Pulse rim light
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
      const el = canvas.parentElement
      if (!el) return
      const nw = el.clientWidth, nh = el.clientHeight
      if (!nw || !nh) return
      renderer.setSize(nw, nh, false)
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(handleResize)
    ro.observe(canvas.parentElement || canvas)
    handleResize()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      ro.disconnect()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', ...style }}
    />
  )
}
