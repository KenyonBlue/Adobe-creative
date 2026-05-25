import {
  CampaignBrief,
  CampaignReport,
  CampaignRunResponse,
  UploadedAsset,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function runCampaign(brief: CampaignBrief): Promise<CampaignRunResponse> {
  return request<CampaignRunResponse>('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brief),
  });
}

export async function uploadAssets(files: File[]): Promise<{ uploaded: UploadedAsset[] }> {
  const formData = new FormData();
  files.forEach((file) => formData.append('assets', file));

  const response = await fetch(`${API_BASE}/api/assets/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Upload failed');
  }

  return response.json();
}

export function getOutputUrl(relativePath: string): string {
  return `${API_BASE}/api/outputs/${relativePath}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export type { CampaignReport };
