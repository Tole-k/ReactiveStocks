import { useEffect, useState } from 'react';

export default function UserAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmationPassword, setConfirmationPassword] = useState("");

    const login = async () => {
        await fetch("http://127.0.0.1:8000/user_auth/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then((response) => {
            console.log(response);
            if (response.status === 202) {
                setIsAuthenticated(true);
            }
        }).catch((error) => {
            console.log(error);
        });
    }
    const register = async () => {
        await fetch("http://127.0.0.1:8000/user_auth/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                confirmation: confirmationPassword
            })
        }).then((response) => {
            console.log(response);
            if (response.status === 201) {
                setIsAuthenticated(true);
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        const checkAuth = async () => {
            await fetch("http://127.0.0.1:8000/user_auth/whoami/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((response) => {
                console.log(response);
                if (response.status === 200) {
                    setIsAuthenticated(true);
                }
            }).catch((error) => {
                console.log(error);
            });
        }
        checkAuth();
    }
        , []);

    if (!isAuthenticated) {
        return (
            <div className="row">
                <div className='column'>
                    <div className="container mt-3">
                        <br />
                        <h2>Login</h2>
                        <form>
                            <div className="form-group">
                                <label htmlFor="login_username">Username</label>
                                <input type="text" className="form-control" id="login_username" name="login_username" onChange={(e) => setUsername(e.target.value)} value={username} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="login_password">Password</label>
                                <input type="password" className="form-control" id="login_password" name="login_password" onChange={(e) => setPassword(e.target.value)} value={password} />
                            </div>
                            <button type="submit" onClick={login} className="btn btn-primary">Login</button>
                        </form>
                    </div>
                </div>
                <div className='column'>
                    <div className="container mt-3">
                        <br />
                        <h2>Register</h2>
                        <form>
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input type="text" className="form-control" id="username" name="username" onChange={(e) => setUsername(e.target.value)} value={username} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" className="form-control" id="email" name="email" onChange={(e) => setEmail(e.target.value)} value={email} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" className="form-control" id="password" name="password" onChange={(e) => setPassword(e.target.value)} value={password} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmation_password">Repeat Password</label>
                                <input type="password" className="form-control" id="confirmation_password" name="confirmation_password" onChange={(e) => setConfirmationPassword(e.target.value)} value={confirmationPassword} />
                            </div>
                            <button type="submit" onClick={register} className="btn btn-primary">Register</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="container mt-3">
            <p>You are logged in!</p>
            <button className="btn btn-primary mr-2" >WhoAmI</button>
            <button className="btn btn-danger" >Log out</button>
        </div>
    )
}