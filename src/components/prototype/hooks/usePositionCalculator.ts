import { useFrame, useThree } from "@react-three/fiber";
import useCorrectedCompass from "./useCorrectedCompass";
import useInterpolatedPosition from "./useInterpolatedPosition";
import { useState } from "react";
import { Euler, Quaternion, Vector3 } from "three";
import { useGeolocation } from "react-use";
import useMean from "./useMean";
import useCameraYaw from "./useCameraYaw";

export default function usePositionCalculator() {
  const { latitude, longitude } = useInterpolatedPosition();
  const compass = useCorrectedCompass();
  const cameraYaw = useCameraYaw();

  // Calculate the relative rotation between heading and camera yaw
  const relativeRotation = (360 - compass - cameraYaw + 360) % 360;
  const meanRelativeRotation = useMean(relativeRotation, 50);

  return (targetLat: number, targetLon: number) => {
    if (!latitude || !longitude) {
      console.warn("User position not available");
      return new Vector3();
    }

    const { xPosition, zPosition } = synchronizeCoordinateSystems(
      targetLat,
      targetLon,
      latitude,
      longitude,
      meanRelativeRotation
    );
    return new Vector3(xPosition, 0, zPosition);
  };
}

function synchronizeCoordinateSystems(
  targetLat: number,
  targetLon: number,
  latitude: number,
  longitude: number,
  meanRelativeRotation: number
) {
  const R = 6371e3; // metres
  const φ1 = latitude * (Math.PI / 180); // φ, λ in radians
  const φ2 = targetLat * (Math.PI / 180);
  const Δφ = (targetLat - latitude) * (Math.PI / 180);
  const Δλ = (targetLon - longitude) * (Math.PI / 180);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180) / Math.PI + 360) % 360;

  // Apply the relative rotation to the bearing
  const virtualBearing = (bearing - meanRelativeRotation + 360) % 360;
  const virtualBearingRad = (virtualBearing * Math.PI) / 180;
  const xPosition = distance * Math.cos(virtualBearingRad + Math.PI);
  const zPosition = distance * Math.sin(virtualBearingRad);

  console.log(
    "Calculated position:",
    {
      latitude,
      longitude,
    },
    {
      targetLat,
      targetLon,
    },
    {
      meanRelativeRotation,
    },
    {
      distance,
      bearing,
      virtualBearing,
    },
    {
      xPosition,
      zPosition,
    }
  );

  return { xPosition, zPosition };
}
