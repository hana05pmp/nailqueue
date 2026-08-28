export interface QueueingMetrics {
  arrivalRate: number;
  serviceRate: number;
  servers: number;
  utilization: number;
  lq: number;
  l: number;
  wqHours: number;
  wHours: number;
  stable: boolean;
  capacity: number;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

/** M/M/1 metrics. Rates are customers per hour and servers must be 1. */
export function calculateMM1(arrivalRate: number, serviceRate: number): QueueingMetrics {
  const lambda = Math.max(0, arrivalRate);
  const mu = Math.max(0, serviceRate);
  const stable = mu > lambda && mu > 0;

  if (!stable) {
    return {
      arrivalRate: lambda,
      serviceRate: mu,
      servers: 1,
      utilization: mu > 0 ? lambda / mu : 0,
      lq: Infinity,
      l: Infinity,
      wqHours: Infinity,
      wHours: Infinity,
      stable: false,
      capacity: mu,
    };
  }

  const rho = lambda / mu;
  const lq = (rho * rho) / (1 - rho);
  const l = rho / (1 - rho);
  const wqHours = lambda > 0 ? lq / lambda : 0;
  const wHours = lambda > 0 ? l / lambda : 1 / mu;

  return {
    arrivalRate: lambda,
    serviceRate: mu,
    servers: 1,
    utilization: rho,
    lq,
    l,
    wqHours,
    wHours,
    stable: true,
    capacity: mu,
  };
}

/** M/M/s metrics using the Erlang-C model. Rates are customers per hour. */
export function calculateMMs(arrivalRate: number, serviceRate: number, servers: number): QueueingMetrics {
  const lambda = Math.max(0, arrivalRate);
  const mu = Math.max(0, serviceRate);
  const s = Math.max(1, Math.floor(servers));
  const capacity = s * mu;
  const utilization = mu > 0 ? lambda / capacity : 0;
  const stable = mu > 0 && utilization < 1;

  if (!stable) {
    return {
      arrivalRate: lambda,
      serviceRate: mu,
      servers: s,
      utilization,
      lq: Infinity,
      l: Infinity,
      wqHours: Infinity,
      wHours: Infinity,
      stable: false,
      capacity,
    };
  }

  if (lambda === 0) {
    return {
      arrivalRate: 0,
      serviceRate: mu,
      servers: s,
      utilization: 0,
      lq: 0,
      l: 0,
      wqHours: 0,
      wHours: 1 / mu,
      stable: true,
      capacity,
    };
  }

  const a = lambda / mu;
  let sum = 0;
  for (let n = 0; n < s; n += 1) sum += Math.pow(a, n) / factorial(n);
  const last = Math.pow(a, s) / (factorial(s) * (1 - utilization));
  const p0 = 1 / (sum + last);
  const lq = (p0 * Math.pow(a, s) * utilization) / (factorial(s) * Math.pow(1 - utilization, 2));
  const l = lq + a;
  const wqHours = lq / lambda;
  const wHours = wqHours + 1 / mu;

  return {
    arrivalRate: lambda,
    serviceRate: mu,
    servers: s,
    utilization,
    lq,
    l,
    wqHours,
    wHours,
    stable: true,
    capacity,
  };
}

export function minutes(hours: number): number {
  return hours * 60;
}

export function formatMetric(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "∞";
  return value.toFixed(decimals);
}
