import { Object3D } from "three";
import { Object3DNode } from "@react-three/fiber";

declare module "react-three-mind" {
  // ARView component
  interface ARViewProps {
    autoplay?: boolean;
    flipUserCamera?: boolean;
    imageTargets: string; // URL for image targets
    maxTrack?: number;
    filterMinCF?: number;
    filterBeta?: number;
    warmupTolerance?: number;
    missTolerance?: number;
    // Additional props for the Canvas (if any)
  }
  export const ARView: React.FC<ARViewProps>;

  // ARAnchor component
  interface ARAnchorProps {
    target: number; // Index of the tracked target
    onAnchorFound?: () => void;
    onAnchorLost?: () => void;
    // Additional props for the anchor group (if any)
  }
  export const ARAnchor: React.FC<ARAnchorProps>;

  // ARFaceMesh component
  interface ARFaceMeshProps {
    onFaceFound?: () => void;
    onFaceLost?: () => void;
    // Additional props for the face mesh (if any)
  }
  export const ARFaceMesh: React.FC<ARFaceMeshProps>;
}
