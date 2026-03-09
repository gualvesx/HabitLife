import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function Brain3D({ className, style }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene  = new THREE.Scene()
    const w = canvas.clientWidth || 460
    const h = canvas.clientHeight || 460
    renderer.setSize(w, h, false)
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100)
    camera.position.set(0, 0, 4.5)

    // Lighting — purple mood
    const amb  = new THREE.AmbientLight(0xffffff, 0.5)
    const dir  = new THREE.DirectionalLight(0xc4b5fd, 2.5); dir.position.set(4, 5, 4)
    const back = new THREE.DirectionalLight(0x4c1d95, 1.8); back.position.set(-4, -2, -3)
    const rim  = new THREE.PointLight(0xa78bfa, 2, 10); rim.position.set(0, 3, -2)
    const fill = new THREE.PointLight(0x7c3aed, 1, 8); fill.position.set(-3, 0, 2)
    scene.add(amb, dir, back, rim, fill)

    let model = null, animId = null
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0

    const onMouse = e => {
      const r = canvas.getBoundingClientRect()
      mouseX = ((e.clientX - r.left) / r.width  - 0.5) * 1.6
      mouseY = -((e.clientY - r.top) / r.height - 0.5) * 1.2
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    // Load the GLB using fetch + parse
    ;(async () => {
      try {
        // Dynamic import of three jsm loader
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
        const gltf = await new Promise((res, rej) =>
          new GLTFLoader().load('/amethyst_cortex.glb', res, null, rej)
        )
        model = gltf.scene

        // Center + scale
        const box = new THREE.Box3().setFromObject(model)
        const cen = box.getCenter(new THREE.Vector3())
        const sz  = box.getSize(new THREE.Vector3()).length()
        model.position.sub(cen)
        model.scale.setScalar(3.0 / sz)

        // Enhance material
        model.traverse(obj => {
          if (obj.isMesh && obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
            mats.forEach(m => {
              m.roughness = Math.max(0.1, (m.roughness || 0.5) * 0.6)
              m.metalness = Math.min(0.9, (m.metalness || 0.1) + 0.3)
              m.needsUpdate = true
            })
          }
        })
        scene.add(model)
      } catch (err) {
        console.warn('GLB load failed, using fallback:', err)
        // Fallback: stylized brain-like procedural mesh
        const group = new THREE.Group()

        // Main hemisphere
        const geoL = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI)
        const geoR = new THREE.SphereGeometry(1, 32, 32, Math.PI, Math.PI)
        const mat  = new THREE.MeshStandardMaterial({ color: 0x9b72f8, roughness: 0.25, metalness: 0.55 })

        const meshL = new THREE.Mesh(geoL, mat); meshL.position.x = -0.05
        const meshR = new THREE.Mesh(geoR, mat.clone()); meshR.position.x = 0.05
        group.add(meshL, meshR)

        // Wrinkle curves via torus rings
        for (let i = 0; i < 6; i++) {
          const torus = new THREE.Mesh(
            new THREE.TorusGeometry(0.6 + i * 0.07, 0.03, 8, 32),
            new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.3, metalness: 0.6 })
          )
          torus.rotation.x = Math.PI / 2 + i * 0.3
          torus.rotation.z = i * 0.5
          group.add(torus)
        }
        group.scale.setScalar(1.1)
        model = group
        scene.add(model)
      }
    })()

    let t = 0
    const render = () => {
      animId = requestAnimationFrame(render)
      t += 0.006
      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.04
      targetY += (mouseY - targetY) * 0.04
      if (model) {
        model.rotation.y = t * 0.35 + targetX * 0.4
        model.rotation.x = Math.sin(t * 0.25) * 0.1 + targetY * 0.2
        // Gentle bob
        model.position.y = Math.sin(t * 0.7) * 0.04
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
