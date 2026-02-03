'use client'

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, Center, Float, Text3D } from '@react-three/drei'
import { easing } from 'maath'
import * as THREE from 'three'

interface Product3DViewerProps {
  productName: string
  productId: string
  modelUrl?: string
  color?: string
  scale?: number
}

function Model({ modelUrl, color = '#dc2626', productName }: { modelUrl?: string; color?: string; productName: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)

  // Create a simple procedural food model if no URL provided
  useEffect(() => {
    const group = new THREE.Group()

    // Create a simple plate-like base
    const plateGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 32)
    const plateMaterial = new THREE.MeshStandardMaterial({ color: '#f5f3f0', metalness: 0.3, roughness: 0.4 })
    const plate = new THREE.Mesh(plateGeometry, plateMaterial)
    plate.receiveShadow = true
    group.add(plate)

    // Create a simple food item (cone for pizza slice or dome for pasta)
    const foodGeometry = new THREE.ConeGeometry(0.6, 0.8, 32)
    const foodMaterial = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.7 })
    const food = new THREE.Mesh(foodGeometry, foodMaterial)
    food.position.y = 0.5
    food.castShadow = true
    food.receiveShadow = true
    group.add(food)

    // Add some garnish elements
    const garnishGeometry = new THREE.SphereGeometry(0.15, 16, 16)
    const garnishMaterial = new THREE.MeshStandardMaterial({ color: '#22c55e', metalness: 0.1, roughness: 0.6 })
    for (let i = 0; i < 3; i++) {
      const garnish = new THREE.Mesh(garnishGeometry, garnishMaterial)
      garnish.position.set(Math.cos((i / 3) * Math.PI * 2) * 0.4, 0.8, Math.sin((i / 3) * Math.PI * 2) * 0.4)
      garnish.castShadow = true
      group.add(garnish)
    }

    setModel(group)
  }, [color])

  useFrame(({ gl, scene, camera }) => {
    if (!meshRef.current || !model) return
    easing.dampE(meshRef.current.rotation, [0, meshRef.current.rotation.y + 0.003, 0], 0.25, 0.001)
  })

  return model ? <primitive ref={meshRef} object={model} scale={1} /> : null
}

function LoadingFallback() {
  return (
    <Center>
      <Text3D font="/fonts/Geist_Bold.json" size={0.5} position={[0, 0, 0]}>
        Loading...
        <meshStandardMaterial color="#22c55e" />
      </Text3D>
    </Center>
  )
}

export function Product3DViewer({ productName, productId, modelUrl, color = '#dc2626', scale = 1 }: Product3DViewerProps) {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-primary bg-gradient-to-b from-accent to-background">
      <Canvas
        shadows
        camera={{ position: [0, 1, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={50} />
        <Suspense fallback={<LoadingFallback />}>
          <Center>
            <Float speed={1.5} rotationIntensity={0.3} floatingRange={[-0.1, 0.1]}>
              <Model modelUrl={modelUrl} color={color} productName={productName} />
            </Float>
          </Center>
          <Environment preset="studio" />
        </Suspense>

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          shadow-mapSize={2048}
          castShadow
        />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={4}
          zoomSpeed={0.5}
          panSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}
