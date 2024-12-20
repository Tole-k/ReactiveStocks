import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../axiosConfig';
import { checkAuth } from '../utils/auth'; // Import the checkAuth function

export default function Logout() {
    const accessToken = localStorage.getItem('access_token');
    const navigate = useNavigate();

    useEffect(() => {
        async function logout() {
            const isAuthenticated = await checkAuth(accessToken);
            if (isAuthenticated) {
                try {
                    await axios.post('http://localhost:8000/user_auth/logout/', {
                        refresh_token: localStorage.getItem('refresh_token')
                    }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` } },
                        { withCredentials: true });

                    localStorage.clear();
                    axios.defaults.headers.common['Authorization'] = null;
                    navigate('/user_auth/login');
                } catch (e) {
                    console.log('Logout not working', e);
                }
            }
        }

        logout();
    }, [accessToken, navigate]);

    return (
        <div></div>
    );
}