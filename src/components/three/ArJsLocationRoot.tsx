"use client";
import React from "react";
import { ARCanvas, ARMarker } from "@artcom/react-three-arjs";
import { WebGLRenderer } from "three";
import { useWindowResize } from "@/lib/utils";
import "../arjs.css";

function Root() {
  return (
    <ARCanvas
      gl={{
        antialias: false,
        powerPreference: "default",
        physicallyCorrectLights: true,
      }}
      onCreated={({ gl }) => {
        gl.setSize(window.innerWidth, window.innerHeight);
        // gl.setSize(640, 480);
      }}
      // @ts-ignore
      cameraParametersUrl={"/data/camera_para.dat"}
    >
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <ARMarker
        type={"pattern"}
        patternUrl={"/data/hiro.patt"}
        onMarkerFound={() => {
          console.log("Marker Found");
        }}
        params={{ smooth: true }}
        // @ts-ignore
        debug
      >
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={"green"} />
        </mesh>
      </ARMarker>
    </ARCanvas>
  );
}

export default Root;
