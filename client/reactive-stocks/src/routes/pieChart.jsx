import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import Dropdown from 'react-bootstrap/Dropdown';
import axios from '../axiosConfig';

export default function PieCharts() {
    const [positions, setPositions] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [allocation, setAllocation] = useState(0.0);
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [portfolios, setPortfolios] = useState([]);
    const [chosen_portfolio, setChosenPortfolio] = useState(null);
    const [proportions, setProportions] = useState([]);
    const [Recommendations, setRecommendations] = useState([]);
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
        const fetchProportions = async () => {
            if (chosen_portfolio) {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/portfolio/allocation/${chosen_portfolio.id}/`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    if (response.status === 200) {
                        setProportions(response.data);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        };
        if (chosen_portfolio) {
            fetchProportions();
        }
    }, [accessToken, chosen_portfolio]);
    useEffect(() => {
        const storedPortfolio = localStorage.getItem('chosen_portfolio');
        if (storedPortfolio) {
            setChosenPortfolio(JSON.parse(storedPortfolio));
        }
    }, []);
    useEffect(() => {
        setRecommendations([]);
        const generate_recommendations = async () => {
            const total_value = positions.reduce((acc, position) => acc + position.quantity * position.stock.price, 0);
            let props = {};
            for (const position of positions) {
                let found = false;
                for (const proportion of proportions) {
                    if (position.stock.symbol === proportion.stock) {
                        const desired_value = total_value * proportion.allocation;
                        const current_value = position.quantity * position.stock.price;
                        const difference = desired_value - current_value;
                        const shares_of_difference = difference / position.stock.price;
                        if (shares_of_difference > 0.5) {
                            setRecommendations((prev) => [...prev, "Buy " + Math.round(shares_of_difference) + " shares of " + position.stock.symbol]);
                        }
                        else if (shares_of_difference < -0.5) {
                            setRecommendations((prev) => [...prev, "Sell " + Math.round(Math.abs(shares_of_difference)) + " shares of " + position.stock.symbol]);
                        }
                        found = true;
                        props[proportion.stock] = true;
                        break;
                    }
                }
                if (!found) {
                    setRecommendations((prev) => [...prev, "Sell all shares of " + position.stock.symbol]);
                }
            }
            for (const proportion of proportions) {
                if (!props[proportion.stock]) {
                    setRecommendations((prev) => [...prev, "Buy " + Math.round(total_value * proportion.allocation) + "$ worth of " + proportion.stock + " shares"]);
                }
            }
        }
        generate_recommendations();
    }, [positions, proportions]);
    const choose_portfolio = (portfolio) => {
        localStorage.setItem('chosen_portfolio', JSON.stringify(portfolio));
        setChosenPortfolio(portfolio);
    }

    const fetchSuggestions = async (symbol) => {
        if (symbol !== "") {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/follow/suggestions/${symbol}/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setSuggestions(response.data);
            } catch (error) {
                console.log(error);
            }
        }
    }

    const searchBarChange = (event) => {
        setEnteredText(event.target.value);
        setSymbol(event.target.value);
        if (enable_suggestions)
            fetchSuggestions(event.target.value);
        if (!event.target.value) {
            setSuggestions([]);
        }
    }

    const suggestionsClick = (symbol) => {
        setSymbol(symbol);
        setEnteredText(symbol);
        setSuggestions([]);
    }

    const prepare_portfolio_data = () => {
        const sum = positions.reduce((acc, position) => acc + position.quantity * position.stock.price, 0);
        const data = positions.map((position) => ({
            name: position.stock.symbol,
            value: Math.round(position.quantity * position.stock.price / sum * 100) / 100
        }));
        return data;
    }

    const prepare_allocation_data = () => {
        const sum = proportions.reduce((acc, proportion) => acc + proportion.allocation, 0);
        const data = proportions.map(proportion => ({
            name: proportion.stock,
            value: proportion.allocation
        }));
        if (sum < 1)
            data.push({ name: "Unallocated", value: 1 - sum });
        return data;
    }

    const add_allocation = async (e) => {
        const data = {
            symbol,
            allocation,
        }
        await axios.post(`http://127.0.0.1:8000/piechart/add_allocation/${chosen_portfolio.id}/`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((response) => response.data).then((data) => {
            if (proportions.some((proportion) => proportion.symbol === symbol)) {
                const next_proportions = proportions.map((proportion) => {
                    if (proportion.stock === symbol) {
                        return {
                            ...proportion,
                            ...data
                        };
                    }
                    return proportion;
                });
                setProportions(next_proportions)
            }
            else {
                setProportions((prev) => [...prev, data]);
            }
            setEnteredText("");
            setSuggestions([]);
            setSymbol("");
            setAllocation(0.0);
        }).catch((error) => {
            console.log(error);
        });
        e.preventDefault();
    }
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
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
                </Dropdown.Menu>
            </Dropdown>
            {chosen_portfolio &&
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <div>
                        <label>
                            Current Portfolio
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={prepare_portfolio_data()}
                                    dataKey="value"
                                    cx={200}
                                    cy={200}
                                    outerRadius={60}
                                    fill="#8884d8"
                                    label={({ name, value }) => `${name}: ${100 * value}%`}
                                >
                                    {prepare_portfolio_data().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </label>
                        <div>
                            <label>
                                Rebalancing Recommendations:
                                <ul>
                                    {Recommendations.map((recommendation, index) => (
                                        <li key={index}>{recommendation}</li>
                                    ))}
                                </ul>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label>
                            Target Portfolio
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={prepare_allocation_data()}
                                    dataKey="value"
                                    cx={200}
                                    cy={200}
                                    outerRadius={60}
                                    fill="#8884d8"
                                    label={({ name, value }) => `${name}: ${Math.round(10000 * value) / 100}%`}
                                >
                                    {prepare_allocation_data().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </label>
                        <div>
                            <label>
                                Edit Portfolio
                                <form className='portfolio-form'>
                                    <div>
                                        <label>
                                            Symbol:
                                            <br></br>
                                            <input type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                                        </label>
                                        <div className='dropdown' id='portfolio'>
                                            {suggestions.length ? suggestions.map((suggestion, index) => (
                                                <div key={index} className='dropdown-row' onClick={() => suggestionsClick(suggestion.symbol)}>{suggestion.symbol} ({suggestion.name})</div>
                                            )) : null}
                                        </div>
                                    </div>
                                    <label>
                                        Allocation:
                                        <br></br>
                                        <input type="number" placeholder="0" value={allocation} onChange={(e) => setAllocation(e.target.value)} min={0.0} max={1.0} step={0.1} />
                                    </label>
                                    <button className='buy' onClick={add_allocation}>Set</button>
                                </form>
                            </label>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
