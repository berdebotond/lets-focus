import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

interface FocusSceneProps {
  isActive: boolean;
  isAngry?: boolean;
}

export function FocusScene({ isActive, isAngry = false }: FocusSceneProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (isAngry && sphereRef.current) {
      // Angry shake animation
      gsap.to(sphereRef.current.position, {
        x: 0,
        duration: 0.1,
        yoyo: true,
        repeat: 5,
        ease: "power2.inOut",
        keyframes: [
          { x: -0.3 },
          { x: 0.3 },
          { x: -0.3 },
        ]
      });

      // Color flash animation
      gsap.to(sphereRef.current.material, {
        emissiveIntensity: 2,
        duration: 0.2,
        yoyo: true,
        repeat: 3,
      });
    }
  }, [isAngry]);

  useFrame((state, delta) => {
    if (!sphereRef.current || !groupRef.current) return;

    // Base floating animation
    const floatY = Math.sin(state.clock.elapsedTime) * 0.2;
    groupRef.current.position.y = floatY;

    // Breathing effect
    const breatheScale = isActive 
      ? 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      : 1 + Math.sin(state.clock.elapsedTime) * 0.05;
    
    sphereRef.current.scale.set(breatheScale, breatheScale, breatheScale);

    // Rotation
    if (isActive) {
      groupRef.current.rotation.y += delta * 0.8;
      sphereRef.current.rotation.x += delta * 0.4;
    } else {
      groupRef.current.rotation.y += delta * 0.2;
    }

    // Angry state effects
    if (isAngry) {
      sphereRef.current.rotation.z += delta * 2;
    }
  });

  return (
    <>
      <EffectComposer>
        <Bloom 
          intensity={isAngry ? 2 : 1} 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
        />
      </EffectComposer>
      
      <group ref={groupRef}>
        <Trail
          width={1}
          length={4}
          color={isAngry ? "#ff4040" : "#646cff"}
          attenuation={(t) => t * t}
        >
          <Sphere ref={sphereRef} args={[1, 32, 32]}>
            <meshStandardMaterial
              color={isAngry ? "#ff4040" : (isActive ? "#646cff" : "#535bf2")}
              roughness={0.2}
              metalness={0.8}
              emissive={isAngry ? "#ff0000" : "#646cff"}
              emissiveIntensity={isAngry ? 2 : 0.5}
            />
          </Sphere>
        </Trail>
      </group>
    </>
  );
} 