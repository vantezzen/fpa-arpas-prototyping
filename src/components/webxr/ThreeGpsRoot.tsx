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
import { Text, Gltf, Clouds, Cloud, Grid, Box } from "@react-three/drei";
import * as THREE from "three";
import { useGeolocation, useMotion } from "react-use";

import React, { Suspense, useState } from "react";
import { MotionSensorState } from "react-use/lib/useMotion";
import { useLatLngToWorldCoordinates } from "./gpsHooks";

function World() {
  const latLngToWordCoordinates = useLatLngToWorldCoordinates();

  return (
    <>
      <ambientLight />

      <Grid infiniteGrid />

      <Box position={[1, 0, 0]} scale={[0.1, 0.1, 0.1]} material-color="red" />
      <Box
        position={[0, 0, 1]}
        scale={[0.1, 0.1, 0.1]}
        material-color="green"
      />
      <Box
        position={[-1, 0, 0]}
        scale={[0.1, 0.1, 0.1]}
        material-color="blue"
      />

      {/* <Gltf
            src="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-spruce/model.gltf"
            scale={[0.05, 0.05, 0.05]}
            position={latLngToWordCoordinates(37.7749, -122.4194)}
          /> */}
      <Gltf
        src="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-spruce/model.gltf"
        scale={[0.05, 0.05, 0.05]}
        position={latLngToWordCoordinates(52.499532, 13.470125)}
      />
    </>
  );
}

function ThreeGpsRoot() {
  return (
    <>
      <ARButton />
      <Canvas
        style={{ height: "100vh", width: "100vw" }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <XR>
          <World />
        </XR>
      </Canvas>
    </>
  );
}

export default ThreeGpsRoot;
