'use client'

import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, Center, Html } from '@react-three/drei'
import { easing } from 'maath'
import * as THREE from 'three'

function RestaurantScene() {
  const sceneRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!sceneRef.current) return

    const scene = sceneRef.current
    scene.clear()

    // Create floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: '#d4a574',
      metalness: 0.1,
      roughness: 0.8,
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Create walls
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: '#faf9f7',
      metalness: 0,
      roughness: 0.9,
    })

    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(20, 10)
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial)
    backWall.position.z = -10
    backWall.position.y = 5
    backWall.receiveShadow = true
    scene.add(backWall)

    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(20, 10)
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial)
    leftWall.rotation.y = Math.PI / 2
    leftWall.position.x = -10
    leftWall.position.y = 5
    leftWall.receiveShadow = true
    scene.add(leftWall)

    // Create tables and chairs
    const tableCount = 5
    for (let i = 0; i < tableCount; i++) {
      // Table
      const tableTopGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 32)
      const tableTopMaterial = new THREE.MeshStandardMaterial({
        color: '#8b4513',
        metalness: 0.3,
        roughness: 0.6,
      })
      const tableTop = new THREE.Mesh(tableTopGeometry, tableTopMaterial)
      tableTop.position.set(-6 + i * 3, 0.75, -3)
      tableTop.castShadow = true
      tableTop.receiveShadow = true
      scene.add(tableTop)

      // Table leg
      const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 16)
      const legMaterial = new THREE.MeshStandardMaterial({ color: '#5a2d0c', metalness: 0.2 })
      const leg = new THREE.Mesh(legGeometry, legMaterial)
      leg.position.set(-6 + i * 3, 0.35, -3)
      leg.castShadow = true
      scene.add(leg)

      // Chairs around table
      for (let j = 0; j < 2; j++) {
        const chairGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.4)
        const chairMaterial = new THREE.MeshStandardMaterial({
          color: '#22c55e',
          metalness: 0.2,
          roughness: 0.5,
        })
        const chair = new THREE.Mesh(chairGeometry, chairMaterial)
        const angle = (j / 2) * Math.PI
        chair.position.set(
          -6 + i * 3 + Math.cos(angle) * 1.2,
          0.4,
          -3 + Math.sin(angle) * 1.2,
        )
        chair.castShadow = true
        scene.add(chair)
      }
    }

    // Create counter area
    const counterGeometry = new THREE.BoxGeometry(4, 1, 1)
    const counterMaterial = new THREE.MeshStandardMaterial({
      color: '#2a2420',
      metalness: 0.4,
      roughness: 0.4,
    })
    const counter = new THREE.Mesh(counterGeometry, counterMaterial)
    counter.position.set(0, 0.5, 6)
    counter.castShadow = true
    scene.add(counter)

    // Create window
    const windowGeometry = new THREE.PlaneGeometry(6, 4)
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: '#87ceeb',
      metalness: 1,
      roughness: 0.1,
    })
    const window_ = new THREE.Mesh(windowGeometry, windowMaterial)
    window_.position.set(0, 4, -10.01)
    scene.add(window_)

    // Create hanging lights
    for (let i = 0; i < 4; i++) {
      const lightGeometry = new THREE.SphereGeometry(0.3, 32, 32)
      const lightMaterial = new THREE.MeshStandardMaterial({ color: '#ffd700', metalness: 0.5 })
      const light = new THREE.Mesh(lightGeometry, lightMaterial)
      light.position.set(-6 + i * 4, 8, 0)
      light.castShadow = true
      scene.add(light)

      // Point light
      const pointLight = new THREE.PointLight('#ffd700', 1, 10)
      pointLight.position.set(-6 + i * 4, 8, 0)
      pointLight.castShadow = true
      scene.add(pointLight)
    }
  }, [])

  useFrame(({ gl, scene, camera }) => {
    if (!sceneRef.current) return
    easing.dampE(sceneRef.current.rotation, [0, sceneRef.current.rotation.y + 0.0005, 0], 0.25, 0.001)
  })

  return <group ref={sceneRef} />
}

function LoadingFallback() {
  return (
    <Center>
      <Html center>
        <div className="text-white text-2xl">Loading restaurant...</div>
      </Html>
    </Center>
  )
}

export function Restaurant3DViewer() {
  return (
    <div className="w-full h-screen rounded-lg overflow-hidden bg-gradient-to-b from-blue-100 to-blue-50">
      <Canvas
        shadows
        camera={{ position: [0, 4, 15], fov: 50 }}
        gl={{ antialias: true }}
      >
        <PerspectiveCamera makeDefault position={[0, 4, 15]} fov={50} />
        <Suspense fallback={<LoadingFallback />}>
          <RestaurantScene />
          <Environment preset="city" />
        </Suspense>

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={0.8}
          shadow-mapSize={4096}
          castShadow
        />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={1}
          minDistance={5}
          maxDistance={40}
        />
      </Canvas>
    </div>
  )
}
