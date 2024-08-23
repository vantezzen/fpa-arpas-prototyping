import { useGeolocation } from "react-use";
import useKalman from "./useKalman";

export default function useInterpolatedPosition() {
  const position = useGeolocation();

  const lat = useKalman(position.latitude || 0);
  const lon = useKalman(position.longitude || 0);

  return {
    latitude: lat,
    longitude: lon,
  };
}
