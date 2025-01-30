import api from '../api';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

async function refreshToken() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
        const response = await api.post('http://localhost:8000/token/refresh/', {
            refresh: refreshToken
        });

        if (response.status === 200) {
            localStorage.setItem(ACCESS_TOKEN, response.data.access);
            localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
            console.log('Token refreshed');
            return true;
        }
        else {
            return false;
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        return false;
    }
};
export async function checkAuth() {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
        return false;
    }

    const decodedToken = jwtDecode(token);
    const tokenExpiration = decodedToken.exp * 1000;
    const currentTime = Date.now();

    if (tokenExpiration < currentTime) {
        const refreshed = await refreshToken();
        return refreshed;
    }
    else {
        return true;
    }
};