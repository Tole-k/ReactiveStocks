import axios from 'axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
},
    (error) => {
        return Promise.reject(error)
    }
);
api.interceptors.response.use(
    function (response) {
        return response;
    },
    async function (error) {

        const originalRequest = error.config;

        if (error.response && (error.response.status === 403 || error.response.status == 401 )&& !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (!refreshToken) {
                return Promise.reject(error);
            }
            try {
                const response = await api.post('http://localhost:8000/token/refresh/', {
                    refresh: refreshToken
                });

                if (response.status === 200) {
                    localStorage.setItem(ACCESS_TOKEN, response.data.access);
                    localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
                    console.log('Token refreshed');

                    originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;

                    return api(originalRequest);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        return Promise.reject(error);
    }
);
export default api