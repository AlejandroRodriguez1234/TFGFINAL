import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface WaterBlobProps {
  fillPct: number
}

function WaterBlob({ fillPct }: WaterBlobProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.rotation.y = t * 0.4
    meshRef.current.rotation.z = Math.sin(t * 0.6) * 0.15
    meshRef.current.position.y = Math.sin(t * 1.2) * 0.05
  })

  const fill = Math.max(0.1, Math.min(1, fillPct / 100))
  // Interpolate color: low water = red/orange, high = cyan/blue
  const color = fill < 0.4
    ? new THREE.Color(0.9, 0.4, 0.1)
    : fill < 0.7
    ? new THREE.Color(0.1, 0.7, 0.9)
    : new THREE.Color(0.0, 0.8, 1.0)

  return (
    <Sphere ref={meshRef} args={[0.7, 64, 64]}>
      <MeshDistortMaterial
        color={color}
        distort={0.35}
        speed={2.5}
        transparent
        opacity={0.85}
        roughness={0.05}
        metalness={0.1}
      />
    </Sphere>
  )
}

export default function WaterDrop3D({ fillPct = 0, size = 80 }: { fillPct?: number; size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="shrink-0">
      <Canvas camera={{ position: [0, 0, 2.2], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 3, 2]} intensity={1.2} />
        <pointLight position={[-2, -1, 1]} intensity={0.4} color="#22d3ee" />
        <WaterBlob fillPct={fillPct} />
      </Canvas>
    </div>
  )
}
