
import axios from "axios";
import { auth } from "./firebase";

const API = axios.create({
    baseURL: "https://buy2basket-e-commerce-1.onrender.com"
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