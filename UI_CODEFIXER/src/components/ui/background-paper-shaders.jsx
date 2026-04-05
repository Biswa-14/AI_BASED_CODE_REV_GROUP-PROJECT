"use client";

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec3 pos = position;
    pos.y += sin(pos.x * 4.0 + time * 0.95) * 0.15 * intensity;
    pos.x += cos(pos.y * 3.6 + time * 0.7) * 0.1 * intensity;
    pos.z += sin((pos.x + pos.y) * 2.4 + time * 0.55) * 0.05 * intensity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float opacity;
  varying vec2 vUv;

  float wave(vec2 uv, float speed, float scale) {
    return sin(uv.x * scale + time * speed) * cos(uv.y * (scale * 0.75) - time * (speed * 0.7));
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float n1 = wave(vUv, 0.85, 9.0);
    float n2 = wave(vUv + 0.18, 0.55, 15.0) * 0.6;
    float n3 = wave(vUv - 0.25, 1.15, 7.0) * 0.35;
    float noise = (n1 + n2 + n3) * 0.5 + 0.5;

    float bands = smoothstep(0.2, 0.95, noise);
    float radial = 1.0 - smoothstep(0.08, 0.95, length(uv) * 1.45);
    vec3 base = mix(color1, color2, bands);
    vec3 highlight = mix(base, vec3(1.0), pow(bands, 4.0) * 0.22 * intensity);
    float alpha = radial * opacity * (0.65 + bands * 0.55);

    gl_FragColor = vec4(highlight, alpha);
  }
`;

function ShaderPlane({
  position,
  scale = 1,
  rotation = [0, 0, 0],
  color1 = '#11111a',
  color2 = '#7c3aed',
  opacity = 0.3,
  speed = 1,
}) {
  const mesh = useRef(null);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      intensity: { value: 1 },
      color1: { value: new THREE.Color(color1) },
      color2: { value: new THREE.Color(color2) },
      opacity: { value: opacity },
    }),
    [color1, color2, opacity],
  );

  useFrame((state) => {
    if (!mesh.current) return;
    uniforms.time.value = state.clock.elapsedTime * speed;
    uniforms.intensity.value = 1 + Math.sin(state.clock.elapsedTime * 0.85) * 0.18;
    mesh.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.12) * 0.12;
  });

  return (
    <mesh ref={mesh} position={position} scale={scale} rotation={rotation}>
      <planeGeometry args={[3.2, 3.2, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function EnergyRing({ radius = 0.55, position = [0, 0, 0], color = '#8b5cf6', speed = 1 }) {
  const mesh = useRef(null);
  const material = useRef(null);

  useFrame((state) => {
    if (!mesh.current || !material.current) return;
    mesh.current.rotation.z = state.clock.elapsedTime * 0.12 * speed;
    material.current.opacity = 0.16 + Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
  });

  return (
    <mesh ref={mesh} position={position}>
      <ringGeometry args={[radius * 0.72, radius, 64]} />
      <meshBasicMaterial
        ref={material}
        color={color}
        transparent
        opacity={0.18}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function BackgroundPaperShaders() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 3], fov: 40 }}
      >
        <color attach="background" args={['#06070d']} />
        <ShaderPlane
          position={[0, 0.05, -0.8]}
          scale={3.2}
          color1="#08090f"
          color2="#2c1c61"
          opacity={0.72}
          speed={0.55}
        />
        <ShaderPlane
          position={[-0.9, 0.45, -0.25]}
          scale={1.95}
          rotation={[0, 0, -0.38]}
          color1="#141523"
          color2="#6854ff"
          opacity={0.32}
          speed={0.85}
        />
        <ShaderPlane
          position={[1.05, -0.4, -0.4]}
          scale={1.8}
          rotation={[0, 0, 0.3]}
          color1="#0d1220"
          color2="#ede9fe"
          opacity={0.2}
          speed={0.6}
        />
        <ShaderPlane
          position={[0.25, -0.85, -0.1]}
          scale={2.2}
          rotation={[0, 0, 0.08]}
          color1="#120f1f"
          color2="#9f8bff"
          opacity={0.16}
          speed={0.95}
        />
        <EnergyRing position={[-1.1, 0.8, -0.1]} color="#6d28d9" speed={0.9} />
        <EnergyRing position={[1.05, -0.75, -0.2]} color="#a78bfa" speed={1.2} />
      </Canvas>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.16),_transparent_32%),radial-gradient(circle_at_80%_30%,_rgba(255,255,255,0.08),_transparent_22%),radial-gradient(circle_at_20%_70%,_rgba(99,102,241,0.12),_transparent_26%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(5,6,10,0.02),_rgba(5,6,10,0.62)_58%,_rgba(5,6,10,0.94))]" />
      <div className="absolute inset-0 mesh-grid opacity-14" />
      <div className="absolute inset-0 vignette-mask" />
    </div>
  );
}
