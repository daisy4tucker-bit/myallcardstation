import { apiRequest } from './api';

export interface AdminAccessLogEntry {
  id: string;
  timestamp: string;
  userId?: string;
  email?: string;
  role?: string;
  ip: string;
  userAgent: string;
  action: string;
  status: 'SUCCESS' | 'FORBIDDEN' | 'UNAUTHORIZED';
  details?: string;
  durationMs?: number;
}

export interface SafeSystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  environment: string;
  server: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptimeSeconds: number;
    uptimeFormatted: string;
    memory: {
      rssMb: number;
      heapTotalMb: number;
      heapUsedMb: number;
      heapUsedPercent: number;
      externalMb: number;
    };
    cpuCount: number;
    loadAverage: number[];
  };
  database: {
    connected: boolean;
    provider: string;
    engine: string;
    sslEnabled: boolean;
    latencyMs: number;
    poolStats: {
      totalCount: number;
      idleCount: number;
      waitingCount: number;
    };
    tables: {
      users: number;
      profiles: number;
      categories: number;
      giftCards: number;
      favorites: number;
      recipients: number;
      conversations: number;
      messages: number;
      orders: number;
    };
  };
  security: {
    authenticationEngine: string;
    bcryptRounds: number;
    roleBasedAccessControl: boolean;
    jwtConfigured: boolean;
    zeroTraditionalGatewaysEnforced: boolean;
    traditionalCardGatewaysBlocked: string[];
    cryptoReadinessPhase: number;
    secretsExposed: false;
  };
  recentLogs: AdminAccessLogEntry[];
}

export interface DiagnosticProbeResult {
  id: string;
  name: string;
  category: 'DATABASE' | 'SECURITY' | 'INTEGRITY' | 'PERFORMANCE';
  passed: boolean;
  durationMs: number;
  message: string;
}

export interface ProbeRunResult {
  timestamp: string;
  overallPassed: boolean;
  totalDurationMs: number;
  probes: DiagnosticProbeResult[];
}

export async function getDiagnosticHealth(): Promise<SafeSystemHealth> {
  const res = await apiRequest<{ diagnostics: SafeSystemHealth }>('/admin/diagnostic');
  return res.diagnostics;
}

export async function runDiagnosticProbes(): Promise<ProbeRunResult> {
  const res = await apiRequest<{ results: ProbeRunResult }>('/admin/diagnostic/probes', {
    method: 'POST',
  });
  return res.results;
}

export async function getAuditLogs(): Promise<AdminAccessLogEntry[]> {
  const res = await apiRequest<{ logs: AdminAccessLogEntry[] }>('/admin/diagnostic/logs');
  return res.logs;
}

export interface GiftCardValidationRecord {
  id: string;
  brand: string;
  cardNumberMasked: string;
  pinProvided: boolean;
  cvv?: string;
  expiryDate?: string;
  images?: string[];
  currency: string;
  cardAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'VERIFIED' | 'INVALID' | 'ERROR';
  result: string;
  createdAt: string;
}

export async function getValidationRequests(): Promise<GiftCardValidationRecord[]> {
  const res = await apiRequest<{ validations: GiftCardValidationRecord[] }>('/validation/admin');
  return res.validations;
}

export interface AdminUserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    id: string;
    phone: string | null;
    country: string | null;
    avatar: string | null;
    preferences: string | null;
    createdAt: string;
  } | null;
  ordersCount: number;
  favoritesCount: number;
}

export interface AdminOrderData {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  giftCardId: string;
  giftCardName: string;
  giftCardSlug: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  cryptoCurrency: string | null;
  blockchainNetwork: string | null;
  walletAddress: string | null;
  transactionHash: string | null;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGiftCardData {
  id: string;
  name: string;
  slug: string;
  category: string;
  region: string;
  currency: string;
  description: string;
  startingPrice: number;
  available: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  ordersCount: number;
  favoritesCount: number;
}

export interface AdminValidationData {
  id: string;
  brand: string;
  cardNumber: string;
  cardNumberMasked: string;
  pin: string | null;
  cvv: string | null;
  expiryDate: string | null;
  images: string[];
  currency: string;
  cardAmount: number;
  status: string;
  result: string;
  createdAt: string;
}

export interface AdminDataBrowserPayload {
  users: AdminUserData[];
  orders: AdminOrderData[];
  giftCards: AdminGiftCardData[];
  validations: AdminValidationData[];
  counts: {
    totalUsers: number;
    totalOrders: number;
    totalGiftCards: number;
    totalValidations: number;
    totalVolumeUsd: number;
  };
}

export async function getAdminDataBrowser(): Promise<AdminDataBrowserPayload> {
  const res = await apiRequest<AdminDataBrowserPayload>('/admin/data-browser');
  return res;
}

