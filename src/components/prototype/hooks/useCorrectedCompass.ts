import { useEffect, useState } from "react";

export default function useCorrectedCompass() {
  const [heading, setHeading] = useState<number>(0);

  useEffect(() => {
    let isSupported = false;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha;
      const beta = event.beta as number;
      const gamma = event.gamma as number;

      // Convert degrees to radians
      // @ts-ignore
      const alphaRad = alpha * (Math.PI / 180);
      const betaRad = beta * (Math.PI / 180);
      const gammaRad = gamma * (Math.PI / 180);

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
      isSupported = true;
    }

    if (!isSupported) {
      alert("Device orientation is not supported on this device");
    }

    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      if (isSupported) {
        window.removeEventListener(
          "deviceorientation",
          handleOrientation,
          true
        );
      }
    };
  }, []);

  return heading;
}
