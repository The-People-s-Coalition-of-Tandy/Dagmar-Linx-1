import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'

// Update to use 35 stickers
const stickerUrls = Array(35).fill(null).map((_, i) => `./stickers/slice${(i % 35) + 1}.png`)

// Create a shared texture loader
const textureLoader = new THREE.TextureLoader()

function FrontSticker({ position, rotation, speed, scale, texture }) {
  const meshRef = useRef()
  const initialPosition = useRef([...position])
  const currentSpeed = useRef({...speed})
  
  useFrame(() => {
    if (!meshRef.current) return

    // Apply movement using the ref's speed
    meshRef.current.position.x += currentSpeed.current.position[0]
    meshRef.current.position.y += currentSpeed.current.position[1]
    meshRef.current.position.z += currentSpeed.current.position[2]
    meshRef.current.rotation.z += currentSpeed.current.rotation

    // Check boundaries relative to initial position
    const maxOffset = 2
    
    const xOffset = meshRef.current.position.x - initialPosition.current[0]
    const yOffset = meshRef.current.position.y - initialPosition.current[1]
    const zOffset = meshRef.current.position.z - initialPosition.current[2]

    if (Math.abs(xOffset) > maxOffset) {
      currentSpeed.current.position[0] *= -1
      meshRef.current.position.x = initialPosition.current[0] + (maxOffset * Math.sign(xOffset))
    }
    if (Math.abs(yOffset) > maxOffset) {
      currentSpeed.current.position[1] *= -1
      meshRef.current.position.y = initialPosition.current[1] + (maxOffset * Math.sign(yOffset))
    }
    if (Math.abs(zOffset) > maxOffset) {
      currentSpeed.current.position[2] *= -1
      meshRef.current.position.z = initialPosition.current[2] + (maxOffset * Math.sign(zOffset))
    }

    // Rotation bounds
    const maxRotation = rotation[2] + Math.PI
    const minRotation = rotation[2] - Math.PI
    if (meshRef.current.rotation.z > maxRotation || meshRef.current.rotation.z < minRotation) {
      currentSpeed.current.rotation *= -1
    }
  })

  return (
    <Instance
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  )
}

function FloatingSticker({ position, rotation, speed, scale, texture }) {
  const meshRef = useRef()
  const initialPosition = useRef([...position])
  const currentSpeed = useRef({...speed})
  const animationProgress = useRef(0)
  
  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Smooth scale animation
    animationProgress.current = Math.min(1, animationProgress.current + delta)
    const currentScale = THREE.MathUtils.lerp(0.001, scale, animationProgress.current)
    meshRef.current.scale.set(currentScale, currentScale, currentScale)

    // Apply movement using the ref's speed
    meshRef.current.position.x += currentSpeed.current.position[0]
    meshRef.current.position.y += currentSpeed.current.position[1]
    meshRef.current.position.z += currentSpeed.current.position[2]
    meshRef.current.rotation.z += currentSpeed.current.rotation

    // Check boundaries relative to initial position
    const maxOffset = 2
    
    const xOffset = meshRef.current.position.x - initialPosition.current[0]
    const yOffset = meshRef.current.position.y - initialPosition.current[1]
    const zOffset = meshRef.current.position.z - initialPosition.current[2]

    if (Math.abs(xOffset) > maxOffset) {
      currentSpeed.current.position[0] *= -1
      meshRef.current.position.x = initialPosition.current[0] + (maxOffset * Math.sign(xOffset))
    }
    if (Math.abs(yOffset) > maxOffset) {
      currentSpeed.current.position[1] *= -1
      meshRef.current.position.y = initialPosition.current[1] + (maxOffset * Math.sign(yOffset))
    }
    if (Math.abs(zOffset) > maxOffset) {
      currentSpeed.current.position[2] *= -1
      meshRef.current.position.z = initialPosition.current[2] + (maxOffset * Math.sign(zOffset))
    }

    // Rotation bounds
    const maxRotation = rotation[2] + Math.PI
    const minRotation = rotation[2] - Math.PI
    if (meshRef.current.rotation.z > maxRotation || meshRef.current.rotation.z < minRotation) {
      currentSpeed.current.rotation *= -1
    }
  })

  return (
    <Instance
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={0.001}
    />
  )
}

export function FloatingStickers() {
  const { viewport } = useThree()
  const [loadedTextures, setLoadedTextures] = useState([])
  const [showFloating, setShowFloating] = useState(false)
  const animationProgress = useRef(0)
  
  // Use refs to maintain stable positions
  const frontStickersRef = useRef(null)
  const floatingStickersRef = useRef(null)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFloating(true)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])
  
  const frontStickers = useMemo(() => {
    if (!frontStickersRef.current) {
      frontStickersRef.current = Array(35).fill(null).map((_, i) => {
        let x, y, scale, z
        
        const maxWidth = Math.min(8, viewport.width / 2 - 1)
        const maxHeight = Math.min(4, viewport.height / 2 - 1)
        const minDistanceFromCenter = 4
        
        // Set z-index with more extreme values to ensure proper layering
        if (i === 4 || i === 26) { // Special slices (will be swapped later)
          z = 0  // Much higher z value to ensure they're always in front
        } else {
          z = Math.random() * 0.5 - 1  // Push other stickers further back
        }

        if (i < 9) { // Top row
          const topIndex = i - 4
          x = topIndex * (maxWidth / 4)
          y = maxHeight
          y = Math.max(y, minDistanceFromCenter)
          scale = 0.6 + Math.random() * 0.15
        } else if (i < 18) { // Right side
          const column = Math.floor((i - 9) / 4)
          const rowInColumn = (i - 9) % 4
          x = Math.max(minDistanceFromCenter, maxWidth - (column * 2.0))
          y = maxHeight - (rowInColumn * (maxHeight / 2))
          scale = 0.6 + Math.random() * 0.15
        } else if (i < 27) { // Bottom row
          x = -maxWidth + ((i - 18) * (maxWidth / 4))
          y = -maxHeight
          y = Math.min(y, -minDistanceFromCenter)
          if (i === 26) {
            scale = 1.3
          } else {
            scale = 0.6 + Math.random() * 0.15
          }
        } else { // Left side
          const column = Math.floor((i - 27) / 4)
          const rowInColumn = (i - 27) % 4
          x = Math.min(-minDistanceFromCenter, -maxWidth + (column * 2.0))
          y = -maxHeight + (rowInColumn * (maxHeight / 2))
          scale = 0.6 + Math.random() * 0.15
        }

        const distanceFromCenter = Math.sqrt(x * x + y * y)
        if (distanceFromCenter < minDistanceFromCenter) {
          const angle = Math.atan2(y, x)
          x = Math.cos(angle) * minDistanceFromCenter
          y = Math.sin(angle) * minDistanceFromCenter
        }

        return {
          position: [
            x + (Math.random() - 0.5) * 0.3,
            y + (Math.random() - 0.5) * 0.3,
            z
          ],
          rotation: [0, 0, (Math.random() - 0.5) * 0.2],
          speed: {
            position: [(Math.random() - 0.5) * 0.0005, (Math.random() - 0.5) * 0.0005, 0],
            rotation: (Math.random() - 0.5) * 0.0002
          },
          scale
        }
      })

      // Reorder stickers while preserving z-positions
      const reordered = [...frontStickersRef.current]
      
      // Swap positions while maintaining extreme z values
      const tempCenter = reordered[4]
      reordered[4] = reordered[2]
      reordered[2] = tempCenter
      const tempLogo = reordered[26]
      reordered[26] = reordered[33]
      reordered[33] = tempLogo
      
      
      frontStickersRef.current = reordered
    }
    return frontStickersRef.current
  }, [viewport])

  // Initialize floating stickers only once using useMemo
  const floatingStickers = useMemo(() => {
    if (!floatingStickersRef.current) {
      floatingStickersRef.current = Array(175).fill(null).map((_, i) => {
        const x = (Math.random() - 0.5) * 16
        const y = (Math.random() - 0.5) * 10
        const z = (Math.random() - 0.5) * 8 - 4

        const distanceFromCenter = Math.sqrt(x * x + y * y + z * z)
        const scaleFactor = Math.max(0.2, 1 - (distanceFromCenter * 0.1))

        return {
          position: [x, y, z],
          rotation: [0, 0, Math.random() * Math.PI * 2],
          speed: {
            position: [
              (Math.random() - 0.5) * 0.002,
              (Math.random() - 0.5) * 0.002,
              (Math.random() - 0.5) * 0.0015
            ],
            rotation: (Math.random() - 0.5) * 0.001
          },
          scale: (0.2 + Math.random() * 0.15) * scaleFactor,
          textureIndex: i % 35
        }
      })
    }
    return floatingStickersRef.current
  }, [])

  useEffect(() => {
    Promise.all(
      stickerUrls.map(url => 
        new Promise((resolve, reject) => {
          textureLoader.load(
            url,
            texture => {
              // Enable texture compression and mipmapping
              texture.generateMipmaps = true
              texture.minFilter = THREE.LinearMipMapLinearFilter
              texture.magFilter = THREE.LinearFilter
              texture.anisotropy = 4
              texture.needsUpdate = true
              resolve(texture)
            },
            undefined,
            error => {
              console.error(`Failed to load texture: ${url}`, error)
              reject(new Error(`Failed to load texture: ${url}`))
            }
          )
        }).catch(() => null)
      )
    ).then(textures => {
      setLoadedTextures(textures.filter(Boolean))
    })

    // Cleanup textures on unmount
    return () => {
      loadedTextures.forEach(texture => {
        if (texture) {
          texture.dispose()
        }
      })
    }
  }, [])

  return (
    <>
      <ambientLight intensity={1} />
      {loadedTextures.map((texture, i) => (
        <Instances key={`instances-${i}`} range={35}>
          <planeGeometry args={[texture.image.width / texture.image.height, 1]} />
          <meshBasicMaterial 
            map={texture} 
            transparent
            alphaTest={0.5}
            side={THREE.DoubleSide}
          />
          {frontStickers && <FrontSticker key={`front-${i}`} {...frontStickers[i]} texture={texture} />}
          {showFloating && floatingStickers && floatingStickers
            .filter(sticker => sticker.textureIndex === i)
            .map((sticker, instanceIndex) => (
              <FloatingSticker 
                key={`float-${i}-${instanceIndex}`} 
                {...sticker}
                texture={texture}
              />
            ))}
        </Instances>
      ))}
    </>
  )
} 