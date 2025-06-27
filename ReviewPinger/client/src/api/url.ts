import api from './api';

// Description: Shorten a long URL
// Endpoint: POST /api/url/shorten
// Request: { url: string }
// Response: { success: boolean, shortUrl: string, longUrl: string, id: string }
export const shortenUrl = async (url: string) => {
  try {
    const response = await api.post('/api/url/shorten', { url });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Expand a shortened URL
// Endpoint: POST /api/url/expand
// Request: { shortUrl: string }
// Response: { success: boolean, longUrl: string, shortUrl: string }
export const expandUrl = async (shortUrl: string) => {
  try {
    const response = await api.post('/api/url/expand', { shortUrl });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};