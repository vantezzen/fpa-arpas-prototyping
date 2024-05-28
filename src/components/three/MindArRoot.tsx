import dynamic from "next/dynamic";
import React from "react";
const ARView = dynamic(
  () => import("react-three-mind").then((mod) => mod.ARView),
  { ssr: false }
);
const ARAnchor = dynamic(
  () => import("react-three-mind").then((mod) => mod.ARAnchor),
  { ssr: false }
);

function MindArRoot() {
  return (
    <ARView
      imageTargets="/data/hiro.mind"
      filterMinCF={1}
      filterBeta={10000}
      missTolerance={0}
      warmupTolerance={0}
      flipUserCamera={false}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <ARAnchor target={0}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={"green"} />
        </mesh>
      </ARAnchor>
    </ARView>
  );
}

export default MindArRoot;
