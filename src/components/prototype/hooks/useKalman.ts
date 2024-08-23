import { useState, useEffect, useRef } from "react";

interface KalmanState {
  estimate: number;
  errorCovariance: number;
}

const useKalman = (value: number): number => {
  const [estimate, setEstimate] = useState<number>(value);
  const lastUpdateTime = useRef<number>(Date.now());
  const state = useRef<KalmanState>({ estimate: value, errorCovariance: 1 });

  // Kalman filter parameters
  const measurementNoise = 0.1;
  const processNoise = 0.01;

  useEffect(() => {
    const currentTime = Date.now();
    const dt = (currentTime - lastUpdateTime.current) / 1000; // Time difference in seconds
    lastUpdateTime.current = currentTime;

    // Predict step
    const predictedEstimate = state.current.estimate;
    const predictedErrorCovariance =
      state.current.errorCovariance + processNoise * dt;

    // Update step
    const kalmanGain =
      predictedErrorCovariance / (predictedErrorCovariance + measurementNoise);
    const newEstimate =
      predictedEstimate + kalmanGain * (value - predictedEstimate);
    const newErrorCovariance = (1 - kalmanGain) * predictedErrorCovariance;

    // Update state
    state.current = {
      estimate: newEstimate,
      errorCovariance: newErrorCovariance,
    };
    setEstimate(newEstimate);
  }, [value]);

  return estimate;
};

export default useKalman;
