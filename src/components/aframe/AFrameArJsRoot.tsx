import React from "react";
import Loader from "./Loader";

function AFrameArJsRoot() {
  return (
    <>
      <Loader />
      <a-scene
        vr-mode-ui="enabled: false;"
        renderer="logarithmicDepthBuffer: true;"
        // @ts-ignore
        embedded
        arjs="debugUIEnabled: true;"
      >
        {/* @ts-ignore */}
        <a-marker preset="hiro">
          <a-box
            position="0 0.5 0"
            material="opacity: 0.5; side: double;color:blue;"
          >
            <a-torus-knot
              radius="0.26"
              radius-tubular="0.05"
              animation="property: rotation; to:360 0 0; dur: 5000; easing: linear; loop: true"
            ></a-torus-knot>
          </a-box>
          {/* @ts-ignore */}
        </a-marker>
        {/* @ts-ignore */}
        <a-entity camera></a-entity>
      </a-scene>
    </>
  );
}

export default AFrameArJsRoot;
