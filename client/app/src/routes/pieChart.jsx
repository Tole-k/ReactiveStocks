import React from "react";
import { useEffect, useState } from "react";
import { PieChart, Pie } from "recharts";
import Dropdown from 'react-bootstrap/Dropdown';
import styled from "styled-components";
import axios from '../axiosConfig';

const data01 = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 300 },
    { name: "Group D", value: 200 }
];
const data02 = [
    { name: "A1", value: 100 },
    { name: "A2", value: 300 },
    { name: "B1", value: 100 },
    { name: "B2", value: 80 },
    { name: "B3", value: 40 },
    { name: "B4", value: 30 },
    { name: "B5", value: 50 },
    { name: "C1", value: 100 },
    { name: "C2", value: 200 },
    { name: "D1", value: 150 },
    { name: "D2", value: 50 }
];

export default function PieCharts() {
    const [positions, setPositions] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState(0.0);
    const [price, setPrice] = useState(0.0);
    const [date, setDate] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [portfolios, setPortfolios] = useState([]);
    const [chosen_portfolio, setChosenPortfolio] = useState(null);
    const [sellAmount, setSellAmount] = useState(0.0);
    const [sellPrice, setSellPrice] = useState(0.0);
    const accessToken = localStorage.getItem('access_token');
    const enable_suggestions = true;
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/user_auth/whoami/", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.status === 200) {
                    setIsAuthenticated(true);
                    setUser(response.data.username);
                }
            } catch (error) {
                setIsAuthenticated(false);
                window.location.href = '/user_auth/login';
            }
        };

        checkAuth();
    }, [accessToken]);

    useEffect(() => {
        const fetchPortfolios = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/piechart/", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.status === 204) {
                    console.log("No portfolios found");
                } else {
                    setPortfolios(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        };

        if (isAuthenticated) {
            fetchPortfolios();
        }
        console.log(positions);
    }, [accessToken, isAuthenticated, positions]);

    useEffect(() => {
        const fetchPositions = async () => {
            if (chosen_portfolio) {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/portfolio/${chosen_portfolio.id}/`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    if (response.status === 200) {
                        setPositions(response.data);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        };

        if (chosen_portfolio) {
            fetchPositions();
        }
    }, [accessToken, chosen_portfolio]);

    useEffect(() => {
        const storedPortfolio = localStorage.getItem('chosen_portfolio');
        if (storedPortfolio) {
            setChosenPortfolio(JSON.parse(storedPortfolio));
        }
    }, []);
    const choose_portfolio = (portfolio) => {
        localStorage.setItem('chosen_portfolio', JSON.stringify(portfolio));
        setChosenPortfolio(portfolio);
    }

    const create_new_portfolio = async () => {
        const portfolioName = prompt("Enter the name of the new portfolio:");
        if (portfolioName) {
            try {
                const response = await axios.post("http://127.0.0.1:8000/piechart/add/", { name: portfolioName }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.status === 201) {
                    setPortfolios((prev) => [...prev, response.data]);
                    choose_portfolio(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        }
    };

    const prepare_portfolio_data = () => {
        const sum = positions.reduce((acc, position) => acc + position.quantity * position.average_price, 0);
        const data = positions.map((position) => ({
            name: position.stock.symbol,
            value: Math.round(position.quantity * position.average_price/sum*100)/100
        }));
        return data;
    }
    return (
        <div className="whole-page">
            <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {chosen_portfolio ? chosen_portfolio.name : "Select Portfolio"}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {portfolios.map((portfolio, index) => (
                        <Dropdown.Item key={index} onClick={() => choose_portfolio(portfolio)}>
                            {portfolio.name}
                        </Dropdown.Item>
                    ))}
                    <Dropdown.Item onClick={create_new_portfolio}>Create New Portfolio</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <PieChart width={400} height={400}>
                <Pie
                    data={prepare_portfolio_data()}
                    dataKey="value"
                    cx={200}
                    cy={200}
                    outerRadius={60}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${100*value}%`}
                />
            </PieChart>
        </div>
    );
}
