import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import { useOutletContext } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toggle_auth } = useOutletContext();

    async function login(e) {
        e.preventDefault();
        setLoading(true);
        const user = {
            username,
            password
        };

        try {
            const response = await api.post('http://localhost:8000/token/', user);
            const { access, refresh } = response.data;
            localStorage.clear();
            console.log(access, refresh);
            localStorage.setItem(ACCESS_TOKEN, access);
            localStorage.setItem(REFRESH_TOKEN, refresh);
            navigate('/');
            toggle_auth(true);
        } catch (e) {
            console.log('login not working', e);
            setErrorMessage("Login failed. Please check your credentials and try again.");
        } finally {
            setLoading(false);
        }
    }

    async function register(e) {
        e.preventDefault();
        setLoading(true);
        const user = {
            username,
            password,
            confirm_password: repeatPassword
        };

        try {
            const response = await api.post('http://localhost:8000/user_auth/register/', user);
            if (response.status === 201) {
                console.log('User created');
                login(e);
            }
            else {
                console.log('User not created');
                console.log(response['message']);
            }
        } catch (e) {
            console.log('Register not working', e);
            setErrorMessage(`Registration failed. ${e.response.data.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {loading && <div className="spinner-container"><Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner></div>}
            <div className="Auth-form-container">
                <form className="Auth-form" onSubmit={login}>
                    <div className="Auth-form-content">
                        <h3 className="Auth-form-title">Sign In</h3>
                        <div className="form-group mt-3">
                            <label>Username</label>
                            <input className="form-control mt-1"
                                placeholder="Enter Username"
                                name='username'
                                type='text' value={username}
                                required
                                onChange={e => setUsername(e.target.value)} />
                        </div>
                        <div className="form-group mt-3">
                            <label>Password</label>
                            <input name='password'
                                type="password"
                                className="form-control mt-1"
                                placeholder="Enter password"
                                value={password}
                                required
                                onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="d-grid gap-2 mt-3">
                            <button type="submit"
                                className="btn btn-primary" onClick={login}>Submit</button>
                        </div>
                    </div>
                </form>
                <form className="Auth-form" onSubmit={login}>
                    <div className="Auth-form-content">
                        <h3 className="Auth-form-title">Sign Up</h3>
                        <div className="form-group mt-3">
                            <label>Username</label>
                            <input className="form-control mt-1"
                                placeholder="Enter Username"
                                name='username'
                                type='text' value={username}
                                required
                                onChange={e => setUsername(e.target.value)} />
                        </div>
                        <div className="form-group mt-3">
                            <label>Password</label>
                            <input name='password'
                                type="password"
                                className="form-control mt-1"
                                placeholder="Enter password"
                                value={password}
                                required
                                onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="form-group mt-3">
                            <label>Confirm Password</label>
                            <input name='confirm-password'
                                type="password"
                                className="form-control mt-1"
                                placeholder="Confirm password"
                                value={repeatPassword}
                                required
                                onChange={e => setRepeatPassword(e.target.value)} />
                        </div>
                        <div className="d-grid gap-2 mt-3">
                            <button type="submit"
                                className="btn btn-primary" onClick={register}>Submit</button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
