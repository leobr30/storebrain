import axios from "axios";
import { auth } from "./auth";

async function getAxiosInstance() {
    // Get the session on the server side
    const session = await auth();
    
    // Create a new axios instance
    const axiosInstance = axios.create({
      baseURL: process.env.API_URL, // Make sure to set this in your .env file
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    // Add request interceptor to add the Bearer token
    axiosInstance.interceptors.request.use(
      async (config) => {
        // If session exists and has an access token, add it to the request header
        if (session?.tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${session?.tokens?.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  
    return axiosInstance;
  }