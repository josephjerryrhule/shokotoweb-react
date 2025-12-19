import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const consumerKey = import.meta.env.VITE_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_CONSUMER_SECRET;

const auth = btoa(`${consumerKey}:${consumerSecret}`);

const woo = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  },
});
export default woo;
