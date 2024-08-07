import React, { useRef, useState, useCallback } from "react";
import { useEffectOnce, useInterval } from "react-use";

const CompassRotationTracker: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [data, setData] = useState<
    Array<{ time: number; rotation: number | null }>
  >([]);
  const [permission, setPermission] = useState<PermissionState>("prompt");

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const permissionState =
          await DeviceOrientationEvent.requestPermission();
        setPermission(permissionState);
      } catch (error) {
        console.error("Error requesting device orientation permission:", error);
      }
    } else {
      setPermission("granted");
    }
  }, []);

  useEffectOnce(() => {
    requestPermission();

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setRotation(event.alpha);
        const currentTime = Date.now();
        setData((prevData) => {
          const newData = {
            time: currentTime - startTime,
            rotation: event.alpha,
          };
          if (prevData.length > 0) {
            const lastRotation = prevData[prevData.length - 1].rotation;
            if (
              lastRotation !== null &&
              Math.abs(newData.rotation - lastRotation) > 300
            ) {
              return [
                ...prevData,
                { time: newData.time, rotation: null },
                newData,
              ];
            }
          }
          return [...prevData, newData];
        });
      }
    };

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleDeviceOrientation);
    }

    return () => {
      if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
        window.removeEventListener(
          "deviceorientation",
          handleDeviceOrientation
        );
      }
    };
  });

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
      ctx.fillText("Rotation (°)", 0, 0);
      ctx.restore();

      // Draw tick marks and values
      ctx.textAlign = "right";
      for (let i = 0; i <= 360; i += 90) {
        const y = height - 30 - (i / 360) * (height - 40);
        ctx.fillText(i.toString(), 25, y + 4);
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
      data.forEach(({ time, rotation }) => {
        if (rotation === null) {
          isFirstPoint = true;
          return;
        }
        const x = 30 + (time / 1000) * ((width - 40) / 60);
        const y = height - 30 - (rotation / 360) * (height - 40);
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
      link.download = "compass-rotation-graph.png";
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Compass Rotation Tracker</h1>
      {permission === "granted" ? (
        <>
          <p className="mb-2">Current Rotation: {rotation.toFixed(2)}°</p>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="border border-gray-300 mb-4"
          />
          <button
            onClick={handleSaveGraph}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Graph
          </button>
        </>
      ) : (
        <button
          onClick={requestPermission}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Request Orientation Permission
        </button>
      )}
    </div>
  );
};

export default CompassRotationTracker;
