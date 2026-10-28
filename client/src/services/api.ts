import {
  AutomotiveProject,
  Component,
  ComponentCategory,
  Supplier,
  User,
  VehicleConfiguration,
  VehicleModel,
  VehicleVariant,
  EngineeringReview,
} from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('autoengine_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  auth: {
    login: async (email: string, password: string, rememberMe: boolean = false) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      return res.json();
    },
    register: async (userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      fullName?: string;
      roleName?: string;
      rememberMe?: boolean;
    }) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return res.json();
    },
    forgotPassword: async (email: string) => {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return res.json();
    },
    resetPassword: async (token: string, newPassword: string) => {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      return res.json();
    },
    switchPersona: async (role: string) => {
      const res = await fetch(`${API_BASE}/auth/switch-persona`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      return res.json();
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
      return res.json();
    },
  },

  // Projects
  projects: {
    getAll: async (): Promise<{ success: boolean; data: AutomotiveProject[] }> => {
      const res = await fetch(`${API_BASE}/projects`, { headers: getHeaders() });
      return res.json();
    },
    getById: async (id: string): Promise<{ success: boolean; data: AutomotiveProject }> => {
      const res = await fetch(`${API_BASE}/projects/${id}`, { headers: getHeaders() });
      return res.json();
    },
    updateMilestone: async (milestoneId: string, isCompleted: boolean) => {
      const res = await fetch(`${API_BASE}/projects/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isCompleted }),
      });
      return res.json();
    },
    calculateCompletion: async (projectId: string) => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/calculate-completion`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return res.json();
    },
  },

  // Vehicles
  vehicles: {
    getModels: async (): Promise<{ success: boolean; data: VehicleModel[] }> => {
      const res = await fetch(`${API_BASE}/vehicles/models`, { headers: getHeaders() });
      return res.json();
    },
    getModelByCode: async (code: string): Promise<{ success: boolean; data: VehicleModel }> => {
      const res = await fetch(`${API_BASE}/vehicles/models/${code}`, { headers: getHeaders() });
      return res.json();
    },
    getVariantById: async (id: string): Promise<{ success: boolean; data: VehicleVariant }> => {
      const res = await fetch(`${API_BASE}/vehicles/variants/${id}`, { headers: getHeaders() });
      return res.json();
    },
  },

  // Components
  components: {
    getAll: async (params?: { category?: string; search?: string; status?: string }): Promise<{ success: boolean; data: Component[] }> => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.status) query.append('status', params.status);
      const res = await fetch(`${API_BASE}/components?${query.toString()}`, { headers: getHeaders() });
      return res.json();
    },
    getCategories: async (): Promise<{ success: boolean; data: ComponentCategory[] }> => {
      const res = await fetch(`${API_BASE}/components/categories`, { headers: getHeaders() });
      return res.json();
    },
    getSuppliers: async (): Promise<{ success: boolean; data: Supplier[] }> => {
      const res = await fetch(`${API_BASE}/components/suppliers`, { headers: getHeaders() });
      return res.json();
    },
    getById: async (id: string): Promise<{ success: boolean; data: Component }> => {
      const res = await fetch(`${API_BASE}/components/${id}`, { headers: getHeaders() });
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/components`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },

  // Configurator
  configurator: {
    save: async (data: { variantId: string; name: string; components: any[]; paintColor?: string }) => {
      const res = await fetch(`${API_BASE}/configurator/save`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getAll: async (): Promise<{ success: boolean; data: VehicleConfiguration[] }> => {
      const res = await fetch(`${API_BASE}/configurator`, { headers: getHeaders() });
      return res.json();
    },
    getById: async (id: string): Promise<{ success: boolean; data: VehicleConfiguration }> => {
      const res = await fetch(`${API_BASE}/configurator/${id}`, { headers: getHeaders() });
      return res.json();
    },
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
      const res = await fetch(`${API_BASE}/configurator/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return res.json();
    },
    duplicate: async (id: string): Promise<{ success: boolean; data: VehicleConfiguration }> => {
      const res = await fetch(`${API_BASE}/configurator/${id}/duplicate`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return res.json();
    },
  },

  // Engineering Reviews
  reviews: {
    getAll: async (projectId?: string): Promise<{ success: boolean; data: EngineeringReview[] }> => {
      const url = projectId ? `${API_BASE}/reviews?projectId=${projectId}` : `${API_BASE}/reviews`;
      const res = await fetch(url, { headers: getHeaders() });
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },

  // Database Systems & BCSE307L Showcase
  database: {
    getOverview: async () => {
      const res = await fetch(`${API_BASE}/database/overview`, { headers: getHeaders() });
      return res.json();
    },
    getViewData: async () => {
      const res = await fetch(`${API_BASE}/database/view/vehicle-components`, { headers: getHeaders() });
      return res.json();
    },
    runStoredProcedure: async (projectId?: string) => {
      const res = await fetch(`${API_BASE}/database/stored-procedure/calculate-completion`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ projectId }),
      });
      return res.json();
    },
    runTriggerDemo: async () => {
      const res = await fetch(`${API_BASE}/database/trigger/test-audit`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return res.json();
    },
    getAggregates: async () => {
      const res = await fetch(`${API_BASE}/database/aggregates`, { headers: getHeaders() });
      return res.json();
    },
    getAuditLogs: async () => {
      const res = await fetch(`${API_BASE}/database/audit-logs`, { headers: getHeaders() });
      return res.json();
    },
  },

  // Orders & Purchasing
  orders: {
    create: async (orderData: any) => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      return res.json();
    },
    getAll: async () => {
      const res = await fetch(`${API_BASE}/orders`, { headers: getHeaders() });
      return res.json();
    },
    getById: async (id: string) => {
      const res = await fetch(`${API_BASE}/orders/${id}`, { headers: getHeaders() });
      return res.json();
    },
    track: async (query: string) => {
      const res = await fetch(`${API_BASE}/orders/track?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
      return res.json();
    },
    updateStatus: async (id: string, data: { status?: string; estimatedDelivery?: string; notes?: string }) => {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
};

export default api;
