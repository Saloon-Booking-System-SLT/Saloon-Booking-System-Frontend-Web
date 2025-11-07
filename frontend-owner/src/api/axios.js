import axios from "axios";

// Get API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const instance = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Backend shared base URL
  withCredentials: true,
});

export default instance;
