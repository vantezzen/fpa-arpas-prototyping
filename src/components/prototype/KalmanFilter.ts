export default class KalmanFilter {
  private x: number[]; // State estimate
  private P: number[][]; // Error covariance
  private F: number[][]; // State transition matrix
  private H: number[][]; // Observation matrix
  private R: number[][]; // Measurement noise covariance
  private Q: number[][]; // Process noise covariance

  constructor(dim_x: number, dim_z: number) {
    this.x = new Array(dim_x).fill(0);
    this.P = this.eye(dim_x);
    this.F = this.eye(dim_x);
    this.H = this.zeros(dim_z, dim_x);
    this.R = this.eye(dim_z);
    this.Q = this.eye(dim_x);

    // Initialize observation matrix
    for (let i = 0; i < Math.min(dim_x, dim_z); i++) {
      this.H[i][i] = 1;
    }
  }

  predict(): void {
    // x = Fx
    this.x = this.dot(this.F, this.x);

    // P = FPF' + Q
    this.P = this.add(
      this.dot(this.dot(this.F, this.P), this.transpose(this.F)),
      this.Q
    );
  }

  update(z: number[]): void {
    // y = z - Hx
    const y = this.subtract(z, this.dot(this.H, this.x));

    // S = HPH' + R
    const S = this.add(
      this.dot(this.dot(this.H, this.P), this.transpose(this.H)),
      this.R
    );

    // K = PH'S^-1
    const K = this.dot(
      this.dot(this.P, this.transpose(this.H)),
      this.inverse(S)
    );

    // x = x + Ky
    this.x = this.add(this.x, this.dot(K, y));

    // P = (I - KH)P
    const I = this.eye(this.x.length);
    this.P = this.dot(this.subtract(I, this.dot(K, this.H)), this.P);
  }

  // Matrix operations
  private zeros(rows: number, cols: number): number[][] {
    return Array(rows)
      .fill(0)
      .map(() => Array(cols).fill(0));
  }

  private eye(n: number): number[][] {
    return Array(n)
      .fill(0)
      .map((_, i) =>
        Array(n)
          .fill(0)
          .map((_, j) => (i === j ? 1 : 0))
      );
  }

  private dot(
    a: number[][] | number[],
    b: number[][] | number[]
  ): number[][] | number[] {
    if (!Array.isArray(a[0]) && !Array.isArray(b[0])) {
      // Vector dot product
      return [
        (a as number[]).reduce(
          (sum, ai, i) => sum + ai * (b as number[])[i],
          0
        ),
      ];
    } else if (!Array.isArray(b[0])) {
      // Matrix-vector product
      return (a as number[][]).map((row) =>
        row.reduce((sum, aij, j) => sum + aij * (b as number[])[j], 0)
      );
    } else if (!Array.isArray(a[0])) {
      // Vector-matrix product
      return (b as number[][])[0].map((_, j) =>
        (a as number[]).reduce(
          (sum, ai, i) => sum + ai * (b as number[][])[i][j],
          0
        )
      );
    } else {
      // Matrix-matrix product
      return (a as number[][]).map((row) =>
        (b as number[][])[0].map((_, j) =>
          row.reduce((sum, aik, k) => sum + aik * (b as number[][])[k][j], 0)
        )
      );
    }
  }

  private add(
    a: number[][] | number[],
    b: number[][] | number[]
  ): number[][] | number[] {
    if (!Array.isArray(a[0])) {
      return (a as number[]).map((ai, i) => ai + (b as number[])[i]);
    } else {
      return (a as number[][]).map((row, i) =>
        row.map((aij, j) => aij + (b as number[][])[i][j])
      );
    }
  }

  private subtract(
    a: number[][] | number[],
    b: number[][] | number[]
  ): number[][] | number[] {
    if (!Array.isArray(a[0])) {
      return (a as number[]).map((ai, i) => ai - (b as number[])[i]);
    } else {
      return (a as number[][]).map((row, i) =>
        row.map((aij, j) => aij - (b as number[][])[i][j])
      );
    }
  }

  private transpose(a: number[][]): number[][] {
    return a[0].map((_, i) => a.map((row) => row[i]));
  }

  private inverse(a: number[][]): number[][] {
    const n = a.length;
    const x = this.eye(n);
    const LU = this.getLU(a);

    for (let i = 0; i < n; i++) {
      this.solveLU(LU, x[i]);
    }

    return x;
  }

  private getLU(a: number[][]): number[][] {
    const n = a.length;
    const LU = this.zeros(n, n);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += LU[i][k] * LU[k][j];
        }
        LU[i][j] = a[i][j] - sum;
      }

      for (let j = i + 1; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += LU[j][k] * LU[k][i];
        }
        LU[j][i] = (a[j][i] - sum) / LU[i][i];
      }
    }

    return LU;
  }

  private solveLU(LU: number[][], b: number[]): void {
    const n = LU.length;

    // Forward substitution
    for (let i = 1; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        sum += LU[i][j] * b[j];
      }
      b[i] -= sum;
    }

    // Backward substitution
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += LU[i][j] * b[j];
      }
      b[i] = (b[i] - sum) / LU[i][i];
    }
  }
}
