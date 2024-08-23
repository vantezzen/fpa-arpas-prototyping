import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useGeolocation } from "react-use";
import { Euler, Quaternion, Vector3 } from "three";
import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

interface ARGPSContextType {
  latitude: number | null;
  longitude: number | null;
  compass: number;
}

const ARGPSContext = createContext<ARGPSContextType | null>(null);

export const useARGPS = (): ARGPSContextType => {
  const context = useContext(ARGPSContext);
  if (!context) {
    throw new Error("useARGPS must be used within an ARGPSProvider");
  }
  return context;
};

interface ARGPSProviderProps {
  children: ReactNode;
}

export const ARGPSProvider: React.FC<ARGPSProviderProps> = ({ children }) => {
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);
  const [compass, setCompass] = useState<number>(0);
  const geolocation = useGeolocation();

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });
        await navigator.permissions.query({
          name: "accelerometer" as PermissionName,
        });
        await navigator.permissions.query({
          name: "magnetometer" as PermissionName,
        });
        setHasPermissions(true);
      } catch (error) {
        console.error("Error requesting permissions:", error);
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    if (hasPermissions) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        // @ts-ignore
        if (event.webkitCompassHeading) {
          // For iOS devices
          // @ts-ignore
          setCompass(event.webkitCompassHeading);
        } else if (event.alpha !== null) {
          // For Android devices
          setCompass(360 - event.alpha);
        }
      };

      window.addEventListener("deviceorientationabsolute", handleOrientation);
      return () => {
        window.removeEventListener(
          "deviceorientationabsolute",
          handleOrientation
        );
      };
    }
  }, [hasPermissions]);

  const value: ARGPSContextType = {
    latitude: geolocation.latitude ?? null,
    longitude: geolocation.longitude ?? null,
    compass,
  };

  if (!hasPermissions) {
    return (
      <Text color="black" anchorX="center" anchorY="middle">
        Waiting for permissions...
      </Text>
    );
  }

  return (
    <ARGPSContext.Provider value={value}>{children}</ARGPSContext.Provider>
  );
};

export const usePositionCalculator = (): ((
  targetLat: number,
  targetLon: number
) => Vector3) => {
  const { latitude: userLat, longitude: userLon, compass } = useARGPS();
  const { camera } = useThree();
  const [cameraQuaternion] = useState(() => new Quaternion());

  useFrame(() => {
    camera.getWorldQuaternion(cameraQuaternion);
  });

  const calculatePosition = (targetLat: number, targetLon: number): Vector3 => {
    if (userLat === null || userLon === null) {
      console.error("User location not available");
      return new Vector3(0, 0, 0);
    }

    const R = 6371000; // Earth's radius in meters

    const φ1 = (userLat * Math.PI) / 180;
    const φ2 = (targetLat * Math.PI) / 180;
    const Δφ = ((targetLat - userLat) * Math.PI) / 180;
    const Δλ = ((targetLon - userLon) * Math.PI) / 180;

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

    const cameraEuler = new Euler().setFromQuaternion(cameraQuaternion, "YXZ");
    const cameraYaw = ((cameraEuler.y * 180) / Math.PI + 360) % 360;

    // Calculate the relative rotation between heading and camera yaw
    const relativeRotation = (360 - compass - cameraYaw + 360) % 360;

    // Apply the relative rotation to the bearing
    const virtualBearing = (bearing - relativeRotation + 360) % 360;
    const virtualBearingRad = (virtualBearing * Math.PI) / 180;
    const xPosition = distance * Math.cos(virtualBearingRad);
    const zPosition = distance * Math.sin(virtualBearingRad);

    console.log("Calculated position:", {
      // userLat,
      // userLon,
      // targetLat,
      // targetLon,
      distance,
      bearing,
      compass,
      virtualBearing,
      // xPosition,
      // zPosition,
    });

    return new Vector3(xPosition, 0, zPosition);
  };

  return calculatePosition;
};
