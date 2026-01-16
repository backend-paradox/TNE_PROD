import axiosInstance from '../../app/axios';
import { API_ENDPOINTS } from '../../utils/constants';

// Search hotels
export const searchHotelsAPI = async (params) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SEARCH_HOTELS, { params });
  return response.data.data;
};

// Search flights
export const searchFlightsAPI = async (params) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SEARCH_FLIGHTS, { params });
  return response.data.data;
};

// Search buses
export const searchBusesAPI = async (params) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SEARCH_BUSES, { params });
  return response.data.data;
};

// Search events
export const searchEventsAPI = async (params) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SEARCH_EVENTS, { params });
  return response.data.data;
};

// Universal search
export const universalSearchAPI = async (query) => {
  const response = await axiosInstance.get(API_ENDPOINTS.SEARCH_ALL, {
    params: { query },
  });
  return response.data.data;
};

// Get hotel by ID
export const getHotelByIdAPI = async (id) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.CATALOG_HOTELS}/${id}`);
  return response.data.data;
};

// Get flight by ID
export const getFlightByIdAPI = async (id) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.CATALOG_FLIGHTS}/${id}`);
  return response.data.data;
};

// Get bus by ID
export const getBusByIdAPI = async (id) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.CATALOG_BUSES}/${id}`);
  return response.data.data;
};

// Get event by ID
export const getEventByIdAPI = async (id) => {
  const response = await axiosInstance.get(`${API_ENDPOINTS.CATALOG_EVENTS}/${id}`);
  return response.data.data;
};

// Get pricing
export const getPricingAPI = async (resourceType, resourceId, date, quantity = 1) => {
  const response = await axiosInstance.get(API_ENDPOINTS.PRICING_CALCULATE, {
    params: { resourceType, resourceId, date, quantity },
  });
  return response.data.data;
};
