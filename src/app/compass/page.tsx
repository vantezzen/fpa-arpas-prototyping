"use client";
import React, { useState, useEffect } from "react";

interface CompassProps {
  size?: number;
}

const TiltCompensatedCompass: React.FC<CompassProps> = ({ size = 250 }) => {
  const [heading, setHeading] = useState<number>(0);
  const [alpha, setAlpha] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    let isSupported = false;

    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          const permissionState =
            await DeviceOrientationEvent.requestPermission();
          setHasPermission(permissionState === "granted");
        } catch (error) {
          console.error(
            "Error requesting device orientation permission:",
            error
          );
          setHasPermission(false);
        }
      } else {
        // For non-iOS devices or older browsers that don't require permission
        setHasPermission(true);
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha;
      const beta = event.beta as number;
      const gamma = event.gamma as number;

      // Convert degrees to radians
      const alphaRad = alpha * (Math.PI / 180);
      const betaRad = beta * (Math.PI / 180);
      const gammaRad = gamma * (Math.PI / 180);

      setAlpha(360 - alpha);

      // Calculate equation components
      const cA = Math.cos(alphaRad);
      const sA = Math.sin(alphaRad);
      const cB = Math.cos(betaRad);
      const sB = Math.sin(betaRad);
      const cG = Math.cos(gammaRad);
      const sG = Math.sin(gammaRad);

      // Calculate A, B, C rotation components
      const rA = -cA * sG - sA * sB * cG;
      const rB = -sA * sG + cA * sB * cG;

      // Calculate compass heading
      let compassHeading = Math.atan(rA / rB);

      // Convert from half of unit circle to full unit circle
      if (rB < 0) {
        compassHeading += Math.PI;
      } else if (rA < 0) {
        compassHeading += 2 * Math.PI;
      }

      // Convert to degrees
      compassHeading *= 180 / Math.PI;

      setHeading(compassHeading);
    };

    if (window.DeviceOrientationEvent) {
      requestPermission();
      isSupported = true;
    }

    if (!isSupported) {
      alert("Device orientation is not supported on this device");
    }

    if (hasPermission) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      if (isSupported && hasPermission) {
        window.removeEventListener(
          "deviceorientation",
          handleOrientation,
          true
        );
      }
    };
  }, [hasPermission]);

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            if (
              typeof DeviceOrientationEvent.requestPermission === "function"
            ) {
              DeviceOrientationEvent.requestPermission()
                .then((permissionState) => {
                  if (permissionState === "granted") {
                    setHasPermission(true);
                  }
                })
                .catch(console.error);
            }
          }}
        >
          Request Compass Permission
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div
        className="rounded-full bg-white shadow-lg flex items-center justify-center"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transform: `rotate(${360 - heading}deg)`,
        }}
      >
        <div
          className="bg-red-500 absolute"
          style={{
            width: "2px",
            height: `${size / 2}px`,
            top: "0",
          }}
        />
        <div className="text-2xl font-bold">{Math.round(heading)}°</div>
      </div>
      <div
        className="rounded-full bg-white shadow-lg flex items-center justify-center"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transform: `rotate(${360 - alpha}deg)`,
        }}
      >
        <div
          className="bg-red-500 absolute"
          style={{
            width: "2px",
            height: `${size / 2}px`,
            top: "0",
          }}
        />
        <div className="text-2xl font-bold">{Math.round(alpha)}°</div>
      </div>
    </div>
  );
};

export default TiltCompensatedCompass;
