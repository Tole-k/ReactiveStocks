import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api';
import { REFRESH_TOKEN } from '../constants';
import { useOutletContext } from 'react-router-dom';

export default function Logout() {
    const navigate = useNavigate();
    const { toggle_auth } = useOutletContext();

    useEffect(() => {
        async function logout() {
            try {
                await api.post('http://localhost:8000/user_auth/logout/', {
                    refresh_token: localStorage.getItem(REFRESH_TOKEN)
                });

                localStorage.clear();
                api.defaults.headers.common['Authorization'] = null;
                navigate('/user_auth/login');
                toggle_auth(false);
            } catch (e) {
                console.log('Logout not working', e);
            }
        }

        logout();
    }, [navigate, toggle_auth]);

    return (
        <div></div>
    );
}