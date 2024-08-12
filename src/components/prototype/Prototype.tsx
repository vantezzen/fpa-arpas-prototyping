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

import React from "react";
import { DraftStorageProvider } from "./storage";
import ObjectSelector from "./objectEdit/ObjectSelector";
import PlaceObject from "./objectEdit/PlaceObject";
import Objects from "./Objects";
import { SensorDataProvider } from "./sensorFusion";

function Prototype() {
  return (
    <DraftStorageProvider>
      <ObjectSelector />

      <ARButton />
      <Canvas
        style={{ height: "100vh", width: "100vw" }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <XR>
          <SensorDataProvider>
            <ambientLight />

            <Controllers />
            <Hands />

            <PlaceObject />
            <Objects />
          </SensorDataProvider>
        </XR>
      </Canvas>
    </DraftStorageProvider>
  );
}

export default Prototype;
