import { useEffect, useRef, useState } from "react";

export default function useMean(value: number, meanSize = 10): number {
  const [mean, setMean] = useState<number>(value);
  const values = useRef<number[]>(Array(meanSize).fill(value));

  useEffect(() => {
    values.current.push(value);
    values.current.shift();
    setMean(values.current.reduce((a, b) => a + b, 0) / meanSize);
  }, [value]);

  return mean;
}
