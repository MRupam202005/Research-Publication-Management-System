import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

export const getAgencies = async (token) => {
  const res = await axios.get(`${API_URL}/funding`, authHeader(token));
  return res.data;
};

export const createAgency = async (token, payload) => {
  const res = await axios.post(`${API_URL}/funding`, payload, authHeader(token));
  return res.data;
};

export const assignFunding = async (token, payload) => {
  const res = await axios.post(`${API_URL}/funding/assign`, payload, authHeader(token));
  return res.data;
};

export const getFundingReport = async (token) => {
  const res = await axios.get(`${API_URL}/funding/report`, authHeader(token));
  return res.data;
};
