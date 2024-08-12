import { useThree } from "@react-three/fiber";
import {
  createContext,
  use,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useEffectOnce, useUpdate } from "react-use";
import { Euler, Quaternion, Vector3 } from "three";
import KalmanFilter from "./KalmanFilter";

type SensorPoint = {
  time: Date;
  gps: {
    latitude: number;
    longitude: number;
  };
  compass: {
    rotation: number;
  };
  virtual: {
    position: Vector3;
    rotation: Euler;
  };
};
type SensorData = {
  points: SensorPoint[];
};

const DEFAULT_DATA: SensorData = {
  points: [],
};

export const sensorFusionContext = createContext<{
  sensorData: SensorData;
  setSensorData: (draft: SensorData) => void;
}>({
  sensorData: DEFAULT_DATA,
  setSensorData: () => {},
});

export function SensorDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sensorData, setSensorData] = useState<SensorData>(DEFAULT_DATA);
  const state = useThree();

  useEffectOnce(() => {
    let watchId: number;
    let rotation = 0;

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        rotation = event.alpha;
      }
    };

    window.addEventListener("deviceorientation", handleDeviceOrientation);

    const startTracking = () => {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const newPoint: SensorPoint = {
            time: new Date(),
            gps: {
              latitude,
              longitude,
            },
            compass: {
              rotation,
            },
            virtual: {
              position: state.camera.position,
              rotation: state.camera.rotation,
            },
          };

          setSensorData((prev) => ({
            points: [...prev.points, newPoint],
          }));
        },
        (error) => {
          console.error("Error getting GPS position:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    };

    startTracking();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }

      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  });

  return (
    <sensorFusionContext.Provider
      value={{
        sensorData,
        setSensorData,
      }}
    >
      {children}
    </sensorFusionContext.Provider>
  );
}

export function useSensorFusionContext() {
  return useContext(sensorFusionContext);
}

export function usePositionConverter() {
  const [initialized, setInitialized] = useState(false);
  const kfRef = useRef(new KalmanFilter(6, 6)); // 3 for position, 3 for orientation
  const initialGPSRef = useRef<[number, number] | null>(null);
  const initialVirtualRef = useRef<Vector3 | null>(null);
  const orientationOffsetRef = useRef<Quaternion | null>(null);
  const update = useUpdate();

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const toDegrees = (radians: number) => (radians * 180) / Math.PI;

  const getOffsetFromInitialGPS = useCallback(
    (latitude: number, longitude: number): [number, number] => {
      if (!initialGPSRef.current) return [0, 0];
      const R = 6371000; // Earth's radius in meters
      const dLat = toRadians(latitude - initialGPSRef.current[0]);
      const dLon = toRadians(longitude - initialGPSRef.current[1]);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(initialGPSRef.current[0])) *
          Math.cos(toRadians(latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      const bearing = Math.atan2(
        Math.sin(dLon) * Math.cos(toRadians(latitude)),
        Math.cos(toRadians(initialGPSRef.current[0])) *
          Math.sin(toRadians(latitude)) -
          Math.sin(toRadians(initialGPSRef.current[0])) *
            Math.cos(toRadians(latitude)) *
            Math.cos(dLon)
      );
      return [distance * Math.sin(bearing), distance * Math.cos(bearing)];
    },
    []
  );

  const updateKalmanFilter = useCallback(
    (
      gpsPosition: [number, number],
      virtualPosition: Vector3,
      compassRotation: number
    ) => {
      console.log("Updating Kalman filter", {
        gpsPosition,
        virtualPosition,
        compassRotation,
      });

      if (!initialized) {
        initialGPSRef.current = gpsPosition;
        initialVirtualRef.current = virtualPosition.clone();
        orientationOffsetRef.current = new Quaternion().setFromEuler(
          new Euler(0, compassRotation, 0)
        );
        setInitialized(true);
        return;
      }

      const [offsetX, offsetY] = getOffsetFromInitialGPS(
        gpsPosition[0],
        gpsPosition[1]
      );
      const gpsX = offsetX;
      const gpsY = offsetY;
      const virtualX = virtualPosition.x - initialVirtualRef.current!.x;
      const virtualY = virtualPosition.z - initialVirtualRef.current!.z; // Note: Y in GPS is Z in Three.js

      kfRef.current.predict();
      kfRef.current.update([
        gpsX,
        gpsY,
        virtualX,
        virtualY,
        compassRotation,
        virtualPosition.y,
      ]);
    },
    [initialized, getOffsetFromInitialGPS]
  );

  const sensorData = useSensorFusionContext();
  useEffect(() => {
    const latestPoint =
      sensorData.sensorData.points[sensorData.sensorData.points.length - 1];
    if (!latestPoint) return;

    updateKalmanFilter(
      [latestPoint.gps.latitude, latestPoint.gps.longitude],
      latestPoint.virtual.position,
      latestPoint.compass.rotation
    );
    update();
  }, [sensorData.sensorData, updateKalmanFilter]);

  const convertPosition = useCallback(
    (latitude: number, longitude: number, elevation: number = 0) => {
      if (!initialized) {
        console.warn(
          "Position converter not initialized. Call updateKalmanFilter first."
        );
        return new Vector3();
      }

      const [offsetX, offsetY] = getOffsetFromInitialGPS(latitude, longitude);
      const position = new Vector3(offsetX, elevation, offsetY);

      // Apply Kalman filter correction
      const state = kfRef.current.x;
      position.x += state[2] - state[0]; // Correction based on virtual vs GPS X
      position.z += state[3] - state[1]; // Correction based on virtual vs GPS Y
      position.y = state[5]; // Use filtered elevation

      // Apply orientation offset
      position.applyQuaternion(orientationOffsetRef.current!);

      // Add initial virtual position
      position.add(initialVirtualRef.current!);

      console.log("Converted position", {
        latitude,
        longitude,
        elevation,
        position,
      });

      return position;
    },
    [initialized, getOffsetFromInitialGPS]
  );

  return { updateKalmanFilter, convertPosition };
}
