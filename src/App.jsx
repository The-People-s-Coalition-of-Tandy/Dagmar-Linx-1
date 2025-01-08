import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber'
import { FloatingStickers } from './components/FloatingStickers'
import { Links } from './components/Links'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import styled from 'styled-components'
import { EffectComposer, DotScreen } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useRef, forwardRef, useState, useEffect, useMemo, memo, useCallback, Suspense } from 'react'
import { OrbitControls } from '@react-three/drei'
import { LinearFilter } from 'three'
import { Vector3 } from 'three'
import { easing } from 'maath'

const CanvasContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000000;
`

const Jupiter = memo(forwardRef(({ position, onReady }, ref) => {
  const texture = useLoader(TextureLoader, `${import.meta.env.BASE_URL}jupiter/Jupiter_diff.jpg`, (progress) => {
    // Update loading progress
    const progressBar = document.getElementById('progress-bar-fill')
    const progressText = document.getElementById('loading-progress')
    if (progressBar && progressText) {
      const percent = Math.round(progress.loaded / progress.total * 100)
      progressBar.style.width = `${percent}%`
      progressText.textContent = `${percent}%`
    }
  })
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  useEffect(() => {
    texture.minFilter = LinearFilter
    texture.generateMipmaps = false
    texture.needsUpdate = true
    
    if (meshRef.current) {
      onReady({ object: meshRef.current, mesh: meshRef.current })
    }
    return () => {
      texture.dispose()
    }
  }, [texture, onReady])

  return (
    <>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          emissive="#a0a0a0"
          emissiveIntensity={0.1}
        />
      </mesh>
      <OrbitControls 
        enablePan={false}
        minDistance={7}
        maxDistance={15}
        rotateSpeed={0.5}
        enableDamping
        dampingFactor={0.05}
        enableZoom={false}
      />
    </>
  )
}))

const CameraController = memo(function CameraController() {
  const { camera } = useThree()
  const targetPosition = useRef(new Vector3(0, 0, 10))
  const targetLookAt = useRef(new Vector3(0, 0, -5))
  const timeoutRef = useRef(null)
  const currentLookAt = useMemo(() => new Vector3(), [])
  const [isMobile] = useState(() => window.innerWidth <= 768)

  const generateNewTarget = useCallback(() => {
    if (isMobile) return // Don't generate new targets on mobile
    
    targetPosition.current.set(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 8,
      8 + (Math.random() - 0.5) * 4
    )
    
    targetLookAt.current.set(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      -5 + (Math.random() - 0.5) * 1
    )
  }, [isMobile])

  useEffect(() => {
    if (isMobile) {
      // Set fixed position for mobile
      camera.position.set(0, 0, 12)
      camera.lookAt(0, 0, -5)
      return
    }

    const scheduleNextMove = () => {
      timeoutRef.current = setTimeout(() => {
        generateNewTarget()
        scheduleNextMove()
      }, 7000)
    }
    
    scheduleNextMove()
    return () => clearTimeout(timeoutRef.current)
  }, [generateNewTarget, camera, isMobile])

  useFrame((state, delta) => {
    // if (isMobile) return // Skip camera animation on mobile
    
    easing.damp3(camera.position, targetPosition.current, 1.5, delta)
    easing.damp3(currentLookAt, targetLookAt.current, 1.5, delta)
    camera.lookAt(currentLookAt)
  })

  return null
})

function App() {
  const jupiterRef = useRef()
  const [jupiterData, setJupiterData] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    const debouncedResize = debounce(checkMobile, 250)
    checkMobile()
    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      debouncedResize.cancel()
    }
  }, [])

  const handleJupiterReady = useCallback((data) => {
    setJupiterData(data)
    // Remove the initial loader when Jupiter is ready
    const loader = document.getElementById('initial-loader')
    if (loader) {
      loader.style.opacity = '0'
      loader.style.transition = 'opacity 0.3s ease'
      setTimeout(() => loader.remove(), 300)
    }
  }, [])

  const canvasConfig = useMemo(() => ({
    gl: { 
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
      logarithmicDepthBuffer: false,
      precision: "lowp"
    },
    camera: { 
      position: [0, 0, isMobile ? 12 : 10], 
      fov: isMobile ? 60 : 50 
    },
    style: { background: '#000000' }
  }), [isMobile])

  return (
    <CanvasContainer>
      <Canvas {...canvasConfig}>
        <Suspense fallback={null}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <FloatingStickers />
          <Jupiter 
            ref={jupiterRef} 
            position={[0, 0, -5]} 
            onReady={handleJupiterReady}
          />
          <CameraController />
          <EffectComposer multisampling={0} frameBufferType={THREE.HalfFloatType}>
            <DotScreen
              blendFunction={BlendFunction.NORMAL}
              scale={0.9}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <Links />
    </CanvasContainer>
  )
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout
  const debouncedFn = function(...args) {
    const later = () => {
      timeout = null
      func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
  debouncedFn.cancel = () => {
    clearTimeout(timeout)
  }
  return debouncedFn
}

export default memo(App)