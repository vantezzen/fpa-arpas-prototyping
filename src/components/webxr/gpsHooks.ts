import { useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { useEffect, useState } from "react";
import { useGeolocation } from "react-use";
import * as THREE from "three";

// Helper function to convert degrees to radians
const toRadians = (degrees: number) => degrees * (Math.PI / 180);

// Helper function to calculate distance in meters using Haversine formula
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper function to calculate initial bearing between two points
const initialBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return (θ * 180) / Math.PI; // convert to degrees
};

function useBearingCache(
  smoothingLength = 10,
  smoothingSeconds = 1
): (bearing: number) => number {
  const [cache, setCache] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const smoothedBearing =
    cache.reduce((acc, curr) => acc + curr, 0) / cache.length;

  return (bearing: number) => {
    if (isLocked) {
      return smoothedBearing;
    }

    setCache((prev) => [...prev, bearing].slice(-smoothingLength));
    setIsLocked(true);

    setTimeout(() => {
      setIsLocked(false);
    }, smoothingSeconds * 1000);

    return smoothedBearing;
  };
}

export function useHeading() {
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = event.alpha || 0;
      if ((event as any).webkitCompassHeading) {
        // Safari's "alpha" is arbitrary, so we use "webkitCompassHeading" instead
        heading = -1 * (event as any).webkitCompassHeading || 0;
        return;
      }

      setHeading(heading);
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  return heading;
}

export function useLatLngToWorldCoordinates(): (
  objectLatitude: number,
  objectLongitude: number
) => [number, number, number] {
  const { latitude: userLatitude, longitude: userLongitude } = useGeolocation({
    enableHighAccuracy: true,
  });
  const userHeading = useHeading();
  const smooth = useBearingCache();
  const { camera } = useThree();
  const { session } = useXR();

  return (objectLatitude: number, objectLongitude: number) => {
    if (
      userLatitude === null ||
      userLongitude === null ||
      userHeading === null ||
      session === null
    ) {
      return [0, 0, 0];
    }

    const distance = haversineDistance(
      userLatitude,
      userLongitude,
      objectLatitude,
      objectLongitude
    );

    const bearing = initialBearing(
      userLatitude,
      userLongitude,
      objectLatitude,
      objectLongitude
    );

    const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const cameraHeading =
      (Math.atan2(cameraDirection.x, cameraDirection.z) * 180) / Math.PI;
    const headingDifference = (userHeading - cameraHeading + 360) % 360;
    const adjustedBearing = smooth((bearing - headingDifference + 360) % 360);

    //     console.log(`Rotation
    // User: ${userHeading}
    // Camera: ${cameraHeading}
    // Difference: ${headingDifference}
    // Bearing: ${bearing}
    // Adjusted: ${adjustedBearing}`);

    // const bearingInRadians = toRadians(bearing);
    const bearingInRadians = toRadians(adjustedBearing);

    const scalingFactor = 7;
    const x = (distance * Math.sin(bearingInRadians)) / scalingFactor;
    const z = (distance * Math.cos(bearingInRadians)) / scalingFactor;

    return [x, 0, z];
  };
}
