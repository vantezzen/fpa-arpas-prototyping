declare module "@artcom/react-three-arjs" {
  import { WebGLRenderer } from "three";
  import { CanvasProps } from "@react-three/fiber/dist/declarations/src/web/Canvas";
  declare const ARCanvas = ({
    children,
    camera,
    gl,
    onCreated,
    ...props
  }: {
    children: ReactNode;
    camera?: { position: number[] };
    gl?: {
      antialias: boolean;
      powerPreference: string;
      physicallyCorrectLights: boolean;
    };
    onCameraStreamReady?: () => void;
    onCameraStreamError?: () => void;
    onCreated?: ({ gl }: { gl: WebGLRenderer }) => void;
  } & CanvasProps) => JSX.Element;
  declare const ARMarker = ({
    children,
    params,
    type,
    patternUrl,
  }: {
    children: ReactNode;
    params?: { smooth: boolean };
    type: "barcode" | "hiro" | "pattern";
    patternUrl: string;
    onMarkerFound?: () => void;
  }) => JSX.Element;
}
