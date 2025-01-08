import { Canvas } from '@react-three/fiber'
import { FloatingStickers } from './components/FloatingStickers'
import { Links } from './components/Links'
import styled from 'styled-components'
import { EffectComposer, GodRays } from '@react-three/postprocessing'
import { BlendFunction, KernelSize, Resizer } from 'postprocessing'
import { useRef, forwardRef, useState, useEffect } from 'react'

const CanvasContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #1a1a1a;
`

const Sun = forwardRef(({ position }, ref) => {
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#ffff80" />
    </mesh>
  )
})

function App() {
  const sunRef = useRef()
  const [sunReady, setSunReady] = useState(false)

  useEffect(() => {
    if (sunRef.current) {
      setSunReady(true)
    }
  }, [])

  return (
    <CanvasContainer>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ background: '#000000' }}
      >
        <color attach="background" args={['#000000']} />
        <FloatingStickers />
        <Sun ref={sunRef} position={[3, 3, -5]} />
        {sunReady && (
          <EffectComposer>
            <GodRays
              sun={sunRef.current}
              blendFunction={BlendFunction.Screen}
              samples={100}
              density={0.97}
              decay={0.97}
              weight={0.6}
              exposure={0.3}
              clampMax={1}
              width={Resizer.AUTO_SIZE}
              height={Resizer.AUTO_SIZE}
              kernelSize={KernelSize.LARGE}
              blur={true}
            />
          </EffectComposer>
        )}
      </Canvas>
      <Links />
    </CanvasContainer>
  )
}

export default App