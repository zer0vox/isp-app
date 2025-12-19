import type { SpeedTestResult } from '../types';
import { isps } from '../data';

/**
 * Placeholder speed test integration.
 *
 * In production, integrate with Measurement Lab (M-Lab) NDT:
 * - Discover nearest M-Lab server: https://locate.measurementlab.net/v2/nearest/ndt/ndt7
 * - Run NDT7 test via WebSocket/DataChannel to measure throughput.
 * - Compute download/upload Mbps and latency from the test stream.
 *
 * For now, we simulate a realistic speed test result on the client.
 */
export const runSpeedTest = async (cityId?: string): Promise<SpeedTestResult> => {
  // Pick a "likely" ISP for this city based on highest coverage
  let ispName: string | undefined;
  if (cityId) {
    const candidates = isps
      .map((isp) => {
        const coverage = isp.coverage.find((c) => c.cityId === cityId);
        return coverage
          ? {
              ispName: isp.name,
              coverage: coverage.coveragePercentage,
            }
          : null;
      })
      .filter(Boolean) as { ispName: string; coverage: number }[];

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.coverage - a.coverage);
      ispName = candidates[0].ispName;
    }
  }

  // Simulate network test delay
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Generate pseudo-realistic metrics
  const downloadMbps = parseFloat((50 + Math.random() * 250).toFixed(1));
  const uploadMbps = parseFloat((20 + Math.random() * 100).toFixed(1));
  const pingMs = parseFloat((5 + Math.random() * 40).toFixed(1));
  const jitterMs = parseFloat((1 + Math.random() * 10).toFixed(1));

  return {
    downloadMbps,
    uploadMbps,
    pingMs,
    jitterMs,
    timestamp: new Date().toISOString(),
    ispName,
    cityId,
  };
};



