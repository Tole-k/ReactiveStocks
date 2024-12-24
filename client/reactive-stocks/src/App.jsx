import { Outlet } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap"
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useEffect } from 'react';
import { checkAuth } from "./utils/auth";
import { useNavigate } from "react-router-dom";

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const accessToken = localStorage.getItem('access_token');
    const navigate = useNavigate();

    useEffect(() => {
        async function authenticate() {
            const isAuthenticated = await checkAuth(accessToken, navigate);
            setIsAuthenticated(isAuthenticated);
        }
        authenticate();
    }, [accessToken, navigate]);


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
            <div id="detail" style={{ flex: 1 }}>
                <Outlet />
            </div>
            <footer className="bg-dark text-white p-4 text-center foot" style={{ position: 'fixed', bottom: 0, width: '100%' }}>
                <Container>
                    <Row>
                        <Col>
                            <p>&copy; {new Date().getFullYear()} ReactiveStocks. All Rights Reserved.</p>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </>
    );
}