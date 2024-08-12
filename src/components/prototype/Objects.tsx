import React from "react";
import { useDraftStorage } from "./storage";
import { Gltf } from "@react-three/drei";
import { usePositionConverter } from "./sensorFusion";

function Objects() {
  const { draft, setDraft } = useDraftStorage();
  const { convertPosition } = usePositionConverter();

  return (
    <>
      {draft.objects.map((object, index) => (
        <Gltf
          key={index}
          src={object.url}
          position={convertPosition(...object.position)}
          // scale={object.scale}
          rotation={object.rotation}
        />
      ))}
    </>
  );
}

export default Objects;
