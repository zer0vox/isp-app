import type { IspStatus } from '../types';
import { isps } from '../data';

/**
 * Placeholder ISP status integration.
 *
 * In production, integrate with:
 * - ISP-hosted Statuspage (e.g., Atlassian Statuspage, Freshstatus)
 * - Custom status APIs exposed by each ISP
 * - RSS/JSON feeds of incidents and maintenance windows
 *
 * This function currently returns mock status data shaped like a real API.
 */
export const fetchIspStatusForCity = async (cityId: string): Promise<IspStatus[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const now = new Date();

  const statuses: IspStatus[] = isps
    .map((isp) => {
      const coverage = isp.coverage.find((c) => c.cityId === cityId);
      if (!coverage) return null;

      // Simple heuristic: lower coverage cities may have more issues (for demo)
      let status: IspStatus['status'] = 'operational';
      let message = 'All systems operational';
      let incidents: IspStatus['incidents'] | undefined;

      if (coverage.coveragePercentage < 60) {
        status = 'degraded';
        message = 'Service may be limited in some neighborhoods.';
        incidents = [
          {
            id: `${isp.id}-maint`,
            title: 'Planned maintenance',
            severity: 'medium',
            startedAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
          },
        ];
      }

      if (coverage.coveragePercentage < 40) {
        status = 'outage';
        message = 'Partial outage reported. Technicians are investigating.';
        incidents = [
          {
            id: `${isp.id}-outage`,
            title: 'Regional connectivity issue',
            severity: 'high',
            startedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          },
        ];
      }

      return {
        ispId: isp.id,
        ispName: isp.name,
        status,
        message,
        lastUpdated: now.toISOString(),
        incidents,
      } as IspStatus;
    })
    .filter(Boolean) as IspStatus[];

  return statuses;
};



