import api from './api';

// Description: Login user functionality
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { _id: string, email: string, role: string, accessToken: string, refreshToken: string, createdAt: string, lastLoginAt: string, isActive: boolean }
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Register user functionality
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string, role: string }
// Response: { _id: string, email: string, role: string, createdAt: string, lastLoginAt: string, isActive: boolean }
export const register = async (email: string, password: string, role: string = 'technician') => {
  try {
    const response = await api.post('/api/auth/register', { email, password, role });
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Get current user information
// Endpoint: GET /api/auth/me
// Request: {}
// Response: { _id: string, email: string, role: string, createdAt: string, lastLoginAt: string, isActive: boolean }
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Logout
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    return await api.post('/api/auth/logout');
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};