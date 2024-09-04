import axios from 'axios';

let refresh = false;

axios.interceptors.response.use(
    response => response,
    async error => {
        if (error.response.status === 401 && !refresh) {
            refresh = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    // Handle case where there is no refresh token
                    refresh = false;
                    return Promise.reject(error);
                }

                const response = await axios.post('http://localhost:8000/token/refresh/', {
                    refresh: refreshToken
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });

                if (response.status === 200) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data['access']}`;
                    localStorage.setItem('access_token', response.data.access);
                    localStorage.setItem('refresh_token', response.data.refresh);

                    // Retry the original request with the new token
                    error.config.headers['Authorization'] = `Bearer ${response.data['access']}`;
                    return axios(error.config);
                }
            } catch (refreshError) {
                // Handle error during token refresh
                console.error('Token refresh error:', refreshError);
                return Promise.reject(refreshError);
            } finally {
                refresh = false;
            }
        }
        return Promise.reject(error);
    }
);

export default axios;