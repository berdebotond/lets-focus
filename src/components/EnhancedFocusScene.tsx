import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Stars, Trail, Float, Torus, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';

interface EnhancedFocusSceneProps {
  isActive: boolean;
  isAngry?: boolean;
  progress: number; // 0 to 1
}

// Define space journey stages
const JOURNEY_STAGES = [
  { distance: 50, speed: 0.5, starSpeed: 0.1, atmosphereSize: 0.2, streakLength: 0.1 },
  { distance: 40, speed: 1.0, starSpeed: 0.3, atmosphereSize: 0.3, streakLength: 0.3 },
  { distance: 30, speed: 1.5, starSpeed: 0.5, atmosphereSize: 0.4, streakLength: 0.5 },
  { distance: 20, speed: 2.0, starSpeed: 0.8, atmosphereSize: 0.5, streakLength: 0.7 },
  { distance: 10, speed: 2.5, starSpeed: 1.0, atmosphereSize: 0.6, streakLength: 1.0 }
];

export function EnhancedFocusScene({ isActive, isAngry = false, progress }: EnhancedFocusSceneProps) {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const starFieldRef = useRef<THREE.Points>(null);
  const streakFieldRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Add new refs for animations
  const lastActiveRef = useRef(isActive);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  // Calculate current journey stage
  const currentStage = Math.floor(progress * (JOURNEY_STAGES.length - 1));
  const nextStage = Math.min(currentStage + 1, JOURNEY_STAGES.length - 1);
  const stageProgress = (progress * (JOURNEY_STAGES.length - 1)) % 1;

  // Interpolate between stages
  const interpolateStages = (current: number, next: number, progress: number) => {
    return current + (next - current) * progress;
  };

  // Create dynamic star field with streaks
  const createStarField = () => {
    const stars = new Float32Array(3000 * 3);
    const streaks = new Float32Array(1000 * 3);
    
    // Regular stars
    for (let i = 0; i < stars.length; i += 3) {
      stars[i] = (Math.random() - 0.5) * 100; // x
      stars[i + 1] = (Math.random() - 0.5) * 100; // y
      stars[i + 2] = (Math.random() - 0.5) * 100; // z
    }

    // Streaks for motion effect
    for (let i = 0; i < streaks.length; i += 3) {
      streaks[i] = (Math.random() - 0.5) * 50; // x
      streaks[i + 1] = (Math.random() - 0.5) * 50; // y
      streaks[i + 2] = (Math.random() - 0.5) * 100; // z longer on z-axis for streaking
    }

    return { stars, streaks };
  };

  // Create star fields on mount
  const { stars, streaks } = useMemo(() => createStarField(), []);

  useEffect(() => {
    if (!planetRef.current || !atmosphereRef.current || !groupRef.current) return;

    // Clear any existing animations
    if (animationRef.current) {
      animationRef.current.kill();
    }

    if (isAngry) {
      // Create a new timeline for angry animation
      const tl = gsap.timeline({ repeat: 2 });
      
      // Angry shake animation
      tl.to(planetRef.current.position, {
        x: 0.3,
        duration: 0.1,
        ease: "power2.inOut",
      })
      .to(planetRef.current.position, {
        x: -0.3,
        duration: 0.1,
        ease: "power2.inOut",
      })
      .to(planetRef.current.position, {
        x: 0,
        duration: 0.1,
        ease: "power2.inOut",
      });

      // Angry color pulse
      tl.to(planetRef.current.material, {
        emissiveIntensity: 1,
        duration: 0.2,
        ease: "power2.inOut",
      }, 0)
      .to(planetRef.current.material, {
        emissiveIntensity: 0.2,
        duration: 0.2,
        ease: "power2.inOut",
      });

      // Atmosphere pulse
      tl.to(atmosphereRef.current.scale, {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 0.2,
        ease: "power2.inOut",
      }, 0)
      .to(atmosphereRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.2,
        ease: "power2.inOut",
      });

      animationRef.current = tl;
    }

    // Handle stop animation when timer becomes inactive
    if (lastActiveRef.current && !isActive) {
      const tl = gsap.timeline();

      // Completion burst effect
      tl.to(atmosphereRef.current.scale, {
        x: 2,
        y: 2,
        z: 2,
        duration: 0.5,
        ease: "power2.out",
      })
      .to(atmosphereRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      });

      // Planet celebration spin
      tl.to(groupRef.current.rotation, {
        y: groupRef.current.rotation.y + Math.PI * 2,
        duration: 1,
        ease: "power2.inOut",
      }, 0);

      // Color transition
      tl.to(planetRef.current.material, {
        emissiveIntensity: 0.8,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      }, 0);

      animationRef.current = tl;
    }

    lastActiveRef.current = isActive;
  }, [isActive, isAngry]);

  useFrame((state, delta) => {
    if (!planetRef.current || !atmosphereRef.current || !cloudsRef.current || !starFieldRef.current || !streakFieldRef.current) return;

    const time = state.clock.elapsedTime;

    // Calculate current stage properties
    const currentDistance = interpolateStages(
      JOURNEY_STAGES[currentStage].distance,
      JOURNEY_STAGES[nextStage].distance,
      stageProgress
    );
    
    const currentSpeed = interpolateStages(
      JOURNEY_STAGES[currentStage].speed,
      JOURNEY_STAGES[nextStage].speed,
      stageProgress
    );

    const currentStreakLength = interpolateStages(
      JOURNEY_STAGES[currentStage].streakLength,
      JOURNEY_STAGES[nextStage].streakLength,
      stageProgress
    );

    // Update planet position (getting closer)
    planetRef.current.position.z = -currentDistance;
    atmosphereRef.current.position.z = -currentDistance;
    cloudsRef.current.position.z = -currentDistance;

    // Planet rotation
    planetRef.current.rotation.y += delta * 0.1;
    cloudsRef.current.rotation.y += delta * 0.15;

    // Star field movement
    const starSpeed = interpolateStages(
      JOURNEY_STAGES[currentStage].starSpeed,
      JOURNEY_STAGES[nextStage].starSpeed,
      stageProgress
    );

    // Move star fields
    starFieldRef.current.position.z += delta * (isActive ? starSpeed * 10 : 0);
    streakFieldRef.current.position.z += delta * (isActive ? starSpeed * 15 : 0);

    // Reset positions when they go too far
    if (starFieldRef.current.position.z > 20) starFieldRef.current.position.z = -80;
    if (streakFieldRef.current.position.z > 20) streakFieldRef.current.position.z = -80;

    // Update streak scale based on speed
    if (streakFieldRef.current.material instanceof THREE.PointsMaterial) {
      streakFieldRef.current.material.size = 0.1 + currentStreakLength;
    }

    // Atmosphere effects
    const atmosphereSize = interpolateStages(
      JOURNEY_STAGES[currentStage].atmosphereSize,
      JOURNEY_STAGES[nextStage].atmosphereSize,
      stageProgress
    );

    atmosphereRef.current.scale.set(1 + atmosphereSize, 1 + atmosphereSize, 1 + atmosphereSize);
    if (atmosphereRef.current.material instanceof THREE.MeshBasicMaterial) {
      atmosphereRef.current.material.opacity = 0.3 + atmosphereSize * 0.3;
    }

    // Enhance angry state effects
    if (isAngry) {
      planetRef.current.rotation.z += delta * 2;
      const pulseScale = 1 + Math.sin(time * 15) * 0.05;
      atmosphereRef.current.scale.x *= pulseScale;
      atmosphereRef.current.scale.y *= pulseScale;
      atmosphereRef.current.scale.z *= pulseScale;

      if (planetRef.current.material instanceof THREE.MeshStandardMaterial) {
        planetRef.current.material.emissiveIntensity = 0.5 + Math.sin(time * 15) * 0.3;
      }
    }
  });

  return (
    <>
      <EffectComposer>
        <Bloom 
          intensity={isAngry ? 2.5 : 1 + progress} 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={isAngry ? new THREE.Vector2(0.02, 0.02) : new THREE.Vector2(0.002 * progress, 0.002 * progress)}
        />
        <Vignette
          darkness={isAngry ? 0.7 : 0.7 - progress * 0.3}
          offset={0.5}
        />
      </EffectComposer>

      {/* Star field for space travel effect */}
      <points ref={starFieldRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={stars}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#ffffff"
          transparent
          opacity={0.8}
          sizeAttenuation
        />
      </points>

      {/* Streak field for motion effect */}
      <points ref={streakFieldRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={333}
            array={streaks}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          color="#8080ff"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Background stars */}
      <Stars 
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={progress}
        fade
        speed={isActive ? 2 : 0.5}
      />
      
      <group ref={groupRef}>
        {/* Planet */}
        <Sphere ref={planetRef} args={[3, 64, 64]} position={[0, 0, -50]}>
          <meshStandardMaterial
            color={isAngry ? "#ff4040" : "#4169e1"}
            roughness={0.7}
            metalness={0.3}
            emissive={isAngry ? "#ff0000" : "#1e90ff"}
            emissiveIntensity={isAngry ? 0.5 : 0.2}
          />
        </Sphere>

        {/* Atmosphere */}
        <Sphere ref={atmosphereRef} args={[3.2, 32, 32]} position={[0, 0, -50]}>
          <meshBasicMaterial
            color="#87ceeb"
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </Sphere>

        {/* Clouds */}
        <Sphere ref={cloudsRef} args={[3.1, 32, 32]} position={[0, 0, -50]}>
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </Sphere>
      </group>
    </>
  );
} 