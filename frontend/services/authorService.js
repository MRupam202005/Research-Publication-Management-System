import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export const getAuthors = async (token) => {
  const res = await axios.get(`${API_URL}/authors`, authHeader(token));
  return res.data;
};

export const createAuthor = async (token, payload) => {
  const res = await axios.post(`${API_URL}/authors`, payload, authHeader(token));
  return res.data;
};

export const getCollaborationRecommendations = async (token, authorId) => {
  const res = await axios.get(`${API_URL}/authors/${authorId}/recommendations`, authHeader(token));
  return res.data;
};

export const deleteAuthor = async (token, authorId) => {
  const res = await axios.delete(`${API_URL}/authors/${authorId}`, authHeader(token));
  return res.data;
};

