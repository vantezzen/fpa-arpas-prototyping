import {
  VRButton,
  ARButton,
  XR,
  Controllers,
  Hands,
  RayGrab,
  Interactive,
  useXR,
} from "@react-three/xr";
import { Canvas } from "@react-three/fiber";
import { Text, Gltf, Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";

import React, { Suspense, useState } from "react";

function Box({ color, size, scale, children, ...rest }: any) {
  return (
    <mesh scale={scale} {...rest}>
      <boxGeometry args={size} />
      <meshPhongMaterial color={color} />
      {children}
    </mesh>
  );
}

function Button({ onClick }: { onClick: () => void }) {
  return (
    <Interactive
      onHover={() => {
        onClick();
      }}
    >
      <Gltf
        src="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-spruce/model.gltf"
        scale={[0.05, 0.05, 0.05]}
        position={[1, 0, -1]}
      />
    </Interactive>
  );
}

function ThreeRoot({ onConfetti }: { onConfetti: () => void }) {
  return (
    <>
      <ARButton />
      <Canvas
        style={{ height: "100vh", width: "100vw" }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <XR>
          <ambientLight />

          <Controllers />
          <Hands />

          <Button onClick={onConfetti} />

          <Clouds material={THREE.MeshBasicMaterial}>
            <Cloud
              segments={40}
              bounds={[40, 2, 40]}
              volume={10}
              position={[0, 10, 0]}
              color="white"
            />
          </Clouds>
        </XR>
      </Canvas>
    </>
  );
}

export default ThreeRoot;
