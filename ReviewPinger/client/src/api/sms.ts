import api from './api';

// Description: Get all cities
// Endpoint: GET /api/cities
// Request: {}
// Response: { cities: Array<{ id: string, name: string, googleReviewLink: string }> }
export const getCities = async () => {
  try {
    const response = await api.get('/api/cities');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get all technicians
// Endpoint: GET /api/technicians
// Request: {}
// Response: { technicians: Array<{ id: string, name: string, email: string, phone: string, cityId: string, cityName: string }> }
export const getTechnicians = async () => {
  try {
    const response = await api.get('/api/technicians');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get message template
// Endpoint: GET /api/admin/message-template
// Request: {}
// Response: { template: string }
export const getMessageTemplate = async () => {
  try {
    const response = await api.get('/api/admin/message-template');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get all SMS templates
// Endpoint: GET /api/sms-templates
// Request: {}
// Response: { templates: Array<{ id: string, name: string, content: string, isDefault: boolean, createdAt: string, updatedAt: string }> }
export const getSMSTemplates = async () => {
  try {
    const response = await api.get('/api/sms-templates');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get SMS template by ID
// Endpoint: GET /api/sms-templates/:id
// Request: {}
// Response: { template: { id: string, name: string, content: string, description: string, isDefault: boolean, createdAt: string, updatedAt: string } }
export const getSMSTemplateById = async (id: string) => {
  try {
    const response = await api.get(`/api/sms-templates/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create new SMS template
// Endpoint: POST /api/sms-templates
// Request: { name: string, content: string, description?: string, isDefault?: boolean }
// Response: { success: boolean, message: string, template: { id: string, name: string, content: string, description: string, isDefault: boolean, createdAt: string, updatedAt: string } }
export const createSMSTemplate = async (data: { name: string; content: string; description?: string; isDefault?: boolean }) => {
  try {
    const response = await api.post('/api/sms-templates', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update SMS template
// Endpoint: PUT /api/sms-templates/:id
// Request: { name: string, content: string, description?: string, isDefault?: boolean }
// Response: { success: boolean, message: string, template: { id: string, name: string, content: string, description: string, isDefault: boolean, createdAt: string, updatedAt: string } }
export const updateSMSTemplate = async (id: string, data: { name: string; content: string; description?: string; isDefault?: boolean }) => {
  try {
    const response = await api.put(`/api/sms-templates/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete SMS template
// Endpoint: DELETE /api/sms-templates/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteSMSTemplate = async (id: string) => {
  try {
    const response = await api.delete(`/api/sms-templates/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Send SMS review request
// Endpoint: POST /api/sms/send
// Request: { cityId: string, technicianId: string, customerName: string, customerPhone: string }
// Response: { success: boolean, message: string, messageId: string }
export const sendSMSRequest = async (data: { cityId: string; technicianId: string; customerName: string; customerPhone: string }) => {
  try {
    const response = await api.post('/api/sms/send', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get SMS message history
// Endpoint: GET /api/sms/history
// Request: { page?: number, limit?: number }
// Response: { messages: Array<{ id: string, cityName: string, technicianName: string, customerName: string, customerPhone: string, status: string, sentAt: string }>, totalCount: number, currentPage: number, totalPages: number }
export const getMessageHistory = async (params: { page?: number; limit?: number } = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    const url = `/api/sms/history${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};