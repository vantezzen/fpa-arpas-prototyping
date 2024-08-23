import { useFrame, useThree } from "@react-three/fiber";
import { useState } from "react";
import { Euler, Quaternion } from "three";

export default function useCameraYaw() {
  const { camera } = useThree();
  const [cameraQuaternion] = useState(() => new Quaternion());

  useFrame(() => {
    camera.getWorldQuaternion(cameraQuaternion);
  });

  const cameraEuler = new Euler().setFromQuaternion(cameraQuaternion, "YXZ");
  const cameraYaw = ((cameraEuler.y * 180) / Math.PI + 360) % 360;

  return cameraYaw;
}
