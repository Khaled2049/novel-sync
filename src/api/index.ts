import axios from "axios";

// Create an instance of axios
const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add interceptors to handle request and response
axiosInstance.interceptors.request.use(
  (config) => {
    // Do something before the request is sent
    return config;
  },
  (error) => {
    // Do something with the request error
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    return Promise.reject(error);
  }
);

export default axiosInstance;
