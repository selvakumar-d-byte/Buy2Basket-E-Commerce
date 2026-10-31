import axios from "axios";
import { auth } from "./firebase";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

API.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser;

        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;