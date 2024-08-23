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
import PermissionGate from "./PermissionGate";
import usePositionCalculator from "./hooks/usePositionCalculator";

function ExampleObject() {
  const calculatePosition = usePositionCalculator();
  return (
    <Gltf
      src="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/tree-spruce/model.gltf"
      position={calculatePosition(52.499019, 13.470723)}
      // scale={object.scale}
    />
  );
}

function Prototype() {
  return (
    <DraftStorageProvider>
      <ObjectSelector />

      <ARButton />
      <PermissionGate>
        <Canvas
          style={{ height: "100vh", width: "100vw" }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <XR>
            <ambientLight />

            <Controllers />
            <Hands />

            <ExampleObject />
            {/* <PlaceObject />
            <Objects /> */}
          </XR>
        </Canvas>
      </PermissionGate>
    </DraftStorageProvider>
  );
}

export default Prototype;
