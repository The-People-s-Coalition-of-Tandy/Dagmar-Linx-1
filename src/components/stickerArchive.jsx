import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Plane } from '@react-three/drei'
import * as THREE from 'three'

const stickerUrls = Array(20).fill(null).map((_, i) => `./stickers/${i + 1}.png`)

// Create a grid-like arrangement around the edges
const stickers = Array(20).fill(null).map((_, i) => {
  // Calculate grid position
  let x, y
  
  if (i < 5) { // Top row
    x = -6 + (i * 3)
    y = 4
  } else if (i < 10) { // Right side
    x = 6
    y = 4 - ((i - 5) * 2)
  } else if (i < 15) { // Bottom row
    x = 6 - ((i - 10) * 3)
    y = -4
  } else { // Left side
    x = -6
    y = -4 + ((i - 15) * 2)
  }

  return {
    position: [
      x,
      y,
      -1 + Math.random() * 0.5 // Slight z-variation for depth
    ],
    rotation: [
      0,
      0,
      (Math.random() - 0.5) * 0.2 // Slight random rotation for natural feel
    ],
    speed: {
      position: [(Math.random() - 0.5) * 0.0005, (Math.random() - 0.5) * 0.0005, 0], // Very subtle movement
      rotation: (Math.random() - 0.5) * 0.0002 // Very subtle rotation
    },
    scale: 0.6 + Math.random() * 0.2
  }
})

function Sticker({ position, rotation, speed, scale, texture }) {
  const meshRef = useRef()
  
  const aspectRatio = texture.image.width / texture.image.height
  const width = aspectRatio
  const height = 1

  useFrame(() => {
    // Extremely subtle floating movement
    meshRef.current.position.x += speed.position[0]
    meshRef.current.position.y += speed.position[1]
    meshRef.current.rotation.z += speed.rotation

    // Keep movement within very tight bounds
    const maxOffset = 0.05 // Reduced maximum movement
    if (Math.abs(meshRef.current.position.x - position[0]) > maxOffset) {
      speed.position[0] *= -1
    }
    if (Math.abs(meshRef.current.position.y - position[1]) > maxOffset) {
      speed.position[1] *= -1
    }

    // Keep rotation within bounds
    const maxRotation = rotation[2] + 0.1
    const minRotation = rotation[2] - 0.1
    if (meshRef.current.rotation.z > maxRotation || meshRef.current.rotation.z < minRotation) {
      speed.rotation *= -1
    }
  })

  return (
    <Plane
      ref={meshRef}
      args={[width, height]}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshBasicMaterial 
        attach="material" 
        map={texture} 
        transparent
        alphaTest={0.5}
        side={THREE.DoubleSide}
      />
    </Plane>
  )
}

export function FloatingStickers() {
  const [loadedTextures, setLoadedTextures] = useState([])

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()
    
    Promise.all(
      stickerUrls.map(url => 
        new Promise((resolve, reject) => {
          textureLoader.load(
            url,
            texture => {
              console.log(`Successfully loaded texture: ${url}`);
              resolve(texture);
            },
            undefined,
            error => {
              console.error(`Failed to load texture: ${url}`, error);
              reject(new Error(`Failed to load texture: ${url}`));
            }
          )
        }).catch(() => null)
      )
    ).then(textures => {
      setLoadedTextures(textures.filter(Boolean))
    })
  }, [])

  return (
    <>
      <ambientLight intensity={1} />
      {loadedTextures.map((texture, i) => (
        texture && <Sticker 
          key={i} 
          {...stickers[i]} 
          texture={texture}
        />
      ))}
    </>
  )
} 