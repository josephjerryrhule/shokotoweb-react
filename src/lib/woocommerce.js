import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const woo = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with cross-origin requests
});
export default woo;
