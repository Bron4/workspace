import api from './api';

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

// Description: Create a new technician
// Endpoint: POST /api/technicians
// Request: { name: string, email: string, phone: string, cityId: string }
// Response: { message: string, technician: { id: string, name: string, email: string, phone: string, cityId: string, cityName: string } }
export const createTechnician = async (data: { name: string; email: string; phone: string; cityId: string }) => {
  try {
    const response = await api.post('/api/technicians', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a technician
// Endpoint: DELETE /api/technicians/:id
// Request: {}
// Response: { message: string }
export const deleteTechnician = async (id: string) => {
  try {
    const response = await api.delete(`/api/technicians/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};