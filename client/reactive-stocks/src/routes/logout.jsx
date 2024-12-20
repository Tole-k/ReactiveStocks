import { useEffect } from "react";
import axios from '../axiosConfig';

export default function Logout() {
    const accessToken = localStorage.getItem('access_token');

    useEffect(() => {
        const logout = async () => {
            try {
                await axios.post('http://localhost:8000/user_auth/logout/', {
                    refresh_token: localStorage.getItem('refresh_token')
                }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` } },
                    { withCredentials: true });

                localStorage.clear();
                axios.defaults.headers.common['Authorization'] = null;
                window.location.href = '/user_auth/login';
            } catch (e) {
                console.log('Logout not working', e);
            }
        };

        logout();
    }, [accessToken]);

    return (
        <div></div>
    );
}