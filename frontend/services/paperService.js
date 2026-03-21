import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export const getPapers = async (token) => {
  const res = await axios.get(`${API_URL}/papers`, authHeader(token));
  return res.data;
};

export const createPaper = async (token, payload) => {
  const res = await axios.post(`${API_URL}/papers`, payload, authHeader(token));
  return res.data;
};

export const updatePaper = async (token, id, payload) => {
  const res = await axios.put(`${API_URL}/papers/${id}`, payload, authHeader(token));
  return res.data;
};

export const deletePaper = async (token, id) => {
  await axios.delete(`${API_URL}/papers/${id}`, authHeader(token));
};

