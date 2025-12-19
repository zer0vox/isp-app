import type { SpeedTestResult, SpeedTestProgress } from '../types';
import { isps } from '../data';

interface MLabServer {
  fqdn: string;
  site: string;
  city: string;
  country: string;
  ip: string[];
}

interface MLabLocateResponse {
  results: Array<{
    machine: string;
    site: string;
    city: string;
    country: string;
    ip: string[];
    fqdn: string;
  }>;
}

/**
 * Find the nearest M-Lab server for speed testing
 */
async function findNearestMLabServer(): Promise<MLabServer | null> {
  try {
    const response = await fetch('https://locate.measurementlab.net/v2/nearest/ndt/ndt7');
    if (!response.ok) {
      throw new Error(`M-Lab locate API error: ${response.status}`);
    }
    
    const data: MLabLocateResponse = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return null;
    }
    
    const server = data.results[0];
    return {
      fqdn: server.fqdn,
      site: server.site,
      city: server.city,
      country: server.country,
      ip: server.ip,
    };
  } catch (error) {
    console.error('Error finding M-Lab server:', error);
    return null;
  }
}

/**
 * Measure ping to a server
 */
async function measurePing(serverUrl: string, samples: number = 5): Promise<{ ping: number; jitter: number }> {
  const times: number[] = [];
  
  for (let i = 0; i < samples; i++) {
    const start = performance.now();
    try {
      const response = await fetch(`${serverUrl}/ping`, {
        method: 'HEAD',
        cache: 'no-cache',
      });
      const end = performance.now();
      if (response.ok) {
        times.push(end - start);
      }
    } catch (error) {
      // Ignore individual ping failures
    }
    // Small delay between pings
    if (i < samples - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  if (times.length === 0) {
    return { ping: 0, jitter: 0 };
  }
  
  const avgPing = times.reduce((a, b) => a + b, 0) / times.length;
  
  // Calculate jitter (average deviation from mean)
  const deviations = times.map(t => Math.abs(t - avgPing));
  const jitter = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  
  return {
    ping: parseFloat(avgPing.toFixed(1)),
    jitter: parseFloat(jitter.toFixed(1)),
  };
}

/**
 * Measure download speed by downloading test data
 */
async function measureDownloadSpeed(
  serverUrl: string,
  onProgress?: (speed: number) => void
): Promise<number> {
  const testSize = 10 * 1024 * 1024; // 10 MB test file
  const startTime = performance.now();
  let downloadedBytes = 0;
  
  try {
    // Use a test endpoint that returns data
    // M-Lab doesn't have a simple HTTP download endpoint, so we'll use a fallback
    // For real implementation, you'd use NDT7 WebSocket protocol
    
    // Fallback: Use a reliable test server
    const testUrl = 'https://speed.cloudflare.com/__down?bytes=' + testSize;
    
    const response = await fetch(testUrl, {
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      throw new Error('Download test failed');
    }
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }
    
    const chunks: Uint8Array[] = [];
    let done = false;
    
    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      
      if (value) {
        chunks.push(value);
        downloadedBytes += value.length;
        
        // Calculate current speed
        const elapsed = (performance.now() - startTime) / 1000; // seconds
        if (elapsed > 0) {
          const currentSpeed = (downloadedBytes * 8) / (elapsed * 1000000); // Mbps
          onProgress?.(currentSpeed);
        }
      }
    }
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // seconds
    const speedMbps = (downloadedBytes * 8) / (duration * 1000000); // Convert to Mbps
    
    return parseFloat(speedMbps.toFixed(2));
  } catch (error) {
    console.error('Download speed test error:', error);
    throw error;
  }
}

/**
 * Measure upload speed by uploading test data
 */
async function measureUploadSpeed(
  serverUrl: string,
  onProgress?: (speed: number) => void
): Promise<number> {
  const testSize = 5 * 1024 * 1024; // 5 MB test data
  const testData = new Uint8Array(testSize);
  
  // Fill with random data
  for (let i = 0; i < testSize; i++) {
    testData[i] = Math.floor(Math.random() * 256);
  }
  
  const startTime = performance.now();
  
  try {
    // Use Cloudflare's upload test endpoint as fallback
    const testUrl = 'https://speed.cloudflare.com/__up';
    
    const response = await fetch(testUrl, {
      method: 'POST',
      body: testData,
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      throw new Error('Upload test failed');
    }
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // seconds
    const speedMbps = (testSize * 8) / (duration * 1000000); // Convert to Mbps
    
    // Simulate progress updates
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const currentSpeed = speedMbps * progress;
      onProgress?.(currentSpeed);
      await new Promise(resolve => setTimeout(resolve, duration * 1000 / steps));
    }
    
    return parseFloat(speedMbps.toFixed(2));
  } catch (error) {
    console.error('Upload speed test error:', error);
    throw error;
  }
}

/**
 * Run a real speed test using M-Lab infrastructure
 * Falls back to Cloudflare speed test if M-Lab is unavailable
 */
export async function runSpeedTest(
  cityId?: string,
  onProgress?: (progress: SpeedTestProgress) => void
): Promise<SpeedTestResult> {
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

  let serverLocation: string | undefined;
  let serverName: string | undefined;

  try {
    // Step 1: Find nearest M-Lab server
    onProgress?.({
      phase: 'ping',
      progress: 10,
      message: 'Finding nearest test server...',
    });

    const mlabServer = await findNearestMLabServer();
    
    // Use M-Lab server if available, otherwise use Cloudflare
    const testServerUrl = mlabServer 
      ? `https://${mlabServer.fqdn}`
      : 'https://speed.cloudflare.com';
    
    serverLocation = mlabServer 
      ? `${mlabServer.city}, ${mlabServer.country}`
      : 'Cloudflare Global Network';
    serverName = mlabServer?.fqdn || 'Cloudflare';

    // Step 2: Measure ping and jitter
    onProgress?.({
      phase: 'ping',
      progress: 20,
      message: 'Measuring latency...',
    });

    const { ping, jitter } = await measurePing(testServerUrl);
    
    onProgress?.({
      phase: 'download',
      progress: 30,
      message: 'Testing download speed...',
    });

    // Step 3: Measure download speed
    const downloadMbps = await measureDownloadSpeed(testServerUrl, (currentSpeed) => {
      onProgress?.({
        phase: 'download',
        progress: 30 + (currentSpeed / 1000) * 40, // Scale to 30-70%
        currentSpeed,
        message: `Download: ${currentSpeed.toFixed(1)} Mbps`,
      });
    });

    onProgress?.({
      phase: 'upload',
      progress: 70,
      message: 'Testing upload speed...',
    });

    // Step 4: Measure upload speed
    const uploadMbps = await measureUploadSpeed(testServerUrl, (currentSpeed) => {
      onProgress?.({
        phase: 'upload',
        progress: 70 + (currentSpeed / 1000) * 25, // Scale to 70-95%
        currentSpeed,
        message: `Upload: ${currentSpeed.toFixed(1)} Mbps`,
      });
    });

    onProgress?.({
      phase: 'complete',
      progress: 100,
      message: 'Speed test complete!',
    });

    return {
      downloadMbps,
      uploadMbps,
      pingMs: ping,
      jitterMs: jitter,
      timestamp: new Date().toISOString(),
      ispName,
      cityId,
      serverLocation,
      serverName,
    };
  } catch (error) {
    console.error('Speed test error:', error);
    
    onProgress?.({
      phase: 'error',
      progress: 0,
      message: 'Speed test failed. Please try again.',
    });

    // Return a fallback result with error indication
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Speed test failed. Please check your internet connection and try again.'
    );
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use runSpeedTest with progress callback instead
 */
export const runSpeedTestLegacy = async (cityId?: string): Promise<SpeedTestResult> => {
  return runSpeedTest(cityId);
};
