import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export const getHIndexAnalytics = async (token) => {
  const res = await axios.get(`${API_URL}/analytics/hindex`, authHeader(token));
  return res.data;
};

export const getCitationsAnalytics = async (token) => {
  const res = await axios.get(`${API_URL}/analytics/citations`, authHeader(token));
  return res.data;
};

export const getAuthorAnalytics = async (token, id) => {
  const res = await axios.get(`${API_URL}/analytics/author/${id}`, authHeader(token));
  return res.data;
};
