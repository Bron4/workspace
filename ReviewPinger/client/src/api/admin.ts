import api from './api';

// Description: Get all city configurations with Google review links
// Endpoint: GET /api/admin/cities
// Request: {}
// Response: { cities: Array<{ id: string, name: string, googleReviewLink: string, isActive: boolean, createdAt: string }> }
export const getCityConfigurations = async () => {
  console.log('Fetching city configurations')
  try {
    const response = await api.get('/api/admin/cities');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Create a new city with Google review link
// Endpoint: POST /api/admin/cities
// Request: { name: string, googleReviewLink: string }
// Response: { success: boolean, message: string, city: { id: string, name: string, googleReviewLink: string, isActive: boolean, createdAt: string } }
export const createCity = async (data: { name: string; googleReviewLink: string }) => {
  console.log('Creating new city:', data)
  try {
    const response = await api.post('/api/admin/cities', data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Update city name and Google review link
// Endpoint: PUT /api/admin/cities/:id
// Request: { name?: string, googleReviewLink?: string }
// Response: { success: boolean, message: string, city: { id: string, name: string, googleReviewLink: string, isActive: boolean, createdAt: string } }
export const updateCityConfiguration = async (cityId: string, data: { name?: string; googleReviewLink?: string }) => {
  console.log('Updating city configuration:', cityId, data)
  try {
    const response = await api.put(`/api/admin/cities/${cityId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Delete a city
// Endpoint: DELETE /api/admin/cities/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteCity = async (cityId: string) => {
  console.log('Deleting city:', cityId)
  try {
    const response = await api.delete(`/api/admin/cities/${cityId}`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Get SMS message template
// Endpoint: GET /api/admin/message-template
// Request: {}
// Response: { template: string }
export const getMessageTemplate = async () => {
  console.log('Fetching message template')
  try {
    const response = await api.get('/api/admin/message-template');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Update SMS message template
// Endpoint: PUT /api/admin/message-template
// Request: { template: string }
// Response: { success: boolean, message: string }
export const updateMessageTemplate = async (data: { template: string }) => {
  console.log('Updating message template:', data)
  try {
    const response = await api.put('/api/admin/message-template', data);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}