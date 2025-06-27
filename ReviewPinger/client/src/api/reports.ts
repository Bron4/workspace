import api from './api';

// Description: Get city performance report
// Endpoint: GET /api/reports/cities
// Request: { startDate?: string, endDate?: string }
// Response: { cityStats: Array<{ city: string, totalRequests: number, successRate: number, failedRequests: number }> }
export const getCityReport = async (params: { startDate?: string; endDate?: string } = {}) => {
  try {
    const response = await api.get('/api/reports/cities', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Get technician performance report
// Endpoint: GET /api/reports/technicians
// Request: { startDate?: string, endDate?: string }
// Response: { technicianStats: Array<{ technician: string, totalRequests: number, successRate: number, failedRequests: number }> }
export const getTechnicianReport = async (params: { startDate?: string; endDate?: string } = {}) => {
  try {
    const response = await api.get('/api/reports/technicians', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Get dashboard analytics
// Endpoint: GET /api/reports/dashboard
// Request: { period?: string }
// Response: { totalRequests: number, successRate: number, totalTechnicians: number, totalCities: number, recentActivity: Array<{ date: string, requests: number }> }
export const getDashboardAnalytics = async (params: { period?: string } = {}) => {
  try {
    const response = await api.get('/api/reports/dashboard', { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}