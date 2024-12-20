import React from 'react';
import { Outlet } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useEffect } from 'react';
import axios from './axiosConfig';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const accessToken = localStorage.getItem('access_token');
    useEffect(() => {
        const checkAuth = async () => {
            await axios.get("http://127.0.0.1:8000/user_auth/whoami/", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }).then((response) => {
                console.log(response);
                if (response.status === 200) {
                    console.log(response.data)
                    setIsAuthenticated(true);
                }
            }).catch((error) => {
                console.log(error);
                console.log("Not authenticated, redirecting to login");
                setIsAuthenticated(false);
            });
        };
        checkAuth();
    }, [isAuthenticated, accessToken]);
    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary" sticky="top">
                <Container>
                    <Navbar.Brand>
                        Stock App
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            {isAuthenticated ? <Nav.Link href="/follow">
                                Followed Stocks
                            </Nav.Link> : null}
                            {isAuthenticated ? <Nav.Link href="/portfolio">
                                Portfolio
                            </Nav.Link> : null}
                            {isAuthenticated ? <Nav.Link href="/pieChart">
                                PieChart
                            </Nav.Link> : null}
                        </Nav>
                    </Navbar.Collapse>
                    <Navbar.Collapse className="justify-content-end">
                        <Nav>
                            {isAuthenticated ? (
                                <Nav.Link href="/user_auth/logout">
                                    Logout
                                </Nav.Link>
                            ) : (
                                <Nav.Link href="/user_auth/login">
                                    Login
                                </Nav.Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <div id="detail">
                <Outlet />
            </div>
        </>
    );
}