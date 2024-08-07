import React, { useRef, useState, useCallback, useEffect } from "react";
import { useInterval } from "react-use";

interface GPSData {
  time: number;
  distance: number | null;
  latitude: number;
  longitude: number;
}

const GPSPositionTracker: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [startTime] = useState<number>(Date.now());
  const [data, setData] = useState<GPSData[]>([]);
  const [lastDistance, setLastDistance] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentPositionRef = useRef<{ lat: number; lon: number } | null>(null);
  const dataRef = useRef<GPSData[]>([]);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  useEffect(() => {
    let watchId: number;

    const startTracking = () => {
      setIsTracking(true);
      setError(null);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentTime = Date.now();
          let distance: number | null = null;

          console.log("New position:", latitude, longitude);

          if (currentPositionRef.current) {
            distance = calculateDistance(
              currentPositionRef.current.lat,
              currentPositionRef.current.lon,
              latitude,
              longitude
            );
            console.log("Calculated distance:", distance);
          } else {
            console.log("First position recorded");
          }

          const newData: GPSData = {
            time: currentTime - startTime,
            distance,
            latitude,
            longitude,
          };

          dataRef.current = [...dataRef.current, newData];
          setData((prev) => [...prev, newData]);

          if (distance !== null) {
            setLastDistance(distance);
          }

          currentPositionRef.current = { lat: latitude, lon: longitude };
        },
        (error) => {
          console.error("Error getting GPS position:", error);
          setError(`GPS error: ${error.message}`);
          setIsTracking(false);
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
    };
  }, [startTime]);

  const drawGraph = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);

      // Draw axes
      ctx.beginPath();
      ctx.moveTo(30, 10);
      ctx.lineTo(30, height - 30);
      ctx.lineTo(width - 10, height - 30);
      ctx.stroke();

      // Draw axis labels
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Time (s)", width / 2, height - 10);
      ctx.save();
      ctx.translate(15, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Distance (m)", 0, 0);
      ctx.restore();

      // Draw tick marks and values
      ctx.textAlign = "right";
      const maxDistance = Math.max(...data.map((d) => d.distance || 0), 10);
      for (let i = 0; i <= maxDistance; i += maxDistance / 4) {
        const y = height - 30 - (i / maxDistance) * (height - 40);
        ctx.fillText(i.toFixed(1), 25, y + 4);
        ctx.beginPath();
        ctx.moveTo(26, y);
        ctx.lineTo(30, y);
        ctx.stroke();
      }

      for (let i = 0; i <= 60; i += 15) {
        const x = 30 + (i / 60) * (width - 40);
        ctx.fillText(i.toString(), x, height - 15);
        ctx.beginPath();
        ctx.moveTo(x, height - 30);
        ctx.lineTo(x, height - 26);
        ctx.stroke();
      }

      // Plot data
      ctx.beginPath();
      let isFirstPoint = true;
      data.forEach(({ time, distance }) => {
        if (distance === null) return;
        const x = 30 + (time / 1000) * ((width - 40) / 60);
        const y = height - 30 - (distance / maxDistance) * (height - 40);
        if (isFirstPoint) {
          ctx.moveTo(x, y);
          isFirstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    },
    [data]
  );

  useInterval(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawGraph(ctx, canvas.width, canvas.height);
      }
    }
  }, 100);

  const handleSaveGraph = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "gps-position-change-graph.png";
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">GPS Position Change Tracker</h1>
      <p className="mb-2">
        Last Distance Change: {lastDistance.toFixed(2)} meters
      </p>
      <p className="mb-2">Data points: {data.length}</p>
      <p className="mb-2">Status: {isTracking ? "Tracking" : "Not tracking"}</p>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="border border-gray-300 mb-4"
      />
      <button
        onClick={handleSaveGraph}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Save Graph
      </button>

      <div className="w-full max-w-2xl overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Time (s)</th>
              <th className="px-4 py-2 border-b">Distance (m)</th>
              <th className="px-4 py-2 border-b">Latitude</th>
              <th className="px-4 py-2 border-b">Longitude</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                <td className="px-4 py-2 border-b">
                  {(point.time / 1000).toFixed(2)}
                </td>
                <td className="px-4 py-2 border-b">
                  {point.distance !== null ? point.distance.toFixed(2) : "N/A"}
                </td>
                <td className="px-4 py-2 border-b">
                  {point.latitude.toFixed(6)}
                </td>
                <td className="px-4 py-2 border-b">
                  {point.longitude.toFixed(6)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GPSPositionTracker;
