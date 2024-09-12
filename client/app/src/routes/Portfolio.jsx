import { useEffect, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import styled from "styled-components";
import axios from '../axiosConfig';

export default function Portfolio() {
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
    }, [accessToken, isAuthenticated]);

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

    const openPosition = async (e) => {
        const positionData = {
            symbol,
            quantity,
            average_price: price,
            date
        };
        axios.post(`http://127.0.0.1:8000/portfolio/open/${chosen_portfolio.id}/`, positionData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((response) => response.data).then((data) => {
            if (positions.some((position) => position.stock.symbol === symbol)) {
                const next_positions = positions.map((position) => {
                    if (position.stock.symbol === symbol) {
                        return {
                            ...position,
                            ...data
                        };
                    }
                    return position;
                });
                setPositions(next_positions);
            }
            else {
                setPositions((prev) => [...prev, data]);
            }
            setEnteredText("");
            setSuggestions([]);
        }).catch((error) => {
            console.log(error);
        });
        e.preventDefault();
    };

    const closePosition = async (id) => {
        await axios.delete(`http://127.0.0.1:8000/portfolio/close/${id}/`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).catch((error) => {
            console.log(error);
        });
        setPositions((prev) => prev.filter((stock) => stock.id !== id));
    }

    // eslint-disable-next-line react/prop-types
    const Change = styled.p`color: ${(props) => props.data === 0 ? "white" : props.data > 0 ? "green" : "red"};
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center; /* Center vertically */
        height: 100%; /* Ensure it takes the full height of the cell */`;

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

    return (
        <div className='whole-page'>
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
            <div className='portfolio-container'>
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
                        Quantity:
                        <br></br>
                        <input type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </label>
                    <label>
                        Price:
                        <br></br>
                        <input type="number" placeholder='0' value={price} onChange={(e) => setPrice(e.target.value)} />
                    </label>
                    <label>
                        Date:
                        <br></br>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </label>
                    <button className='buy' onClick={openPosition}>Open</button>
                </form>
            </div>
            {positions.length > 0 &&
                <div className='tableWrap'>
                    <table className='stock-table'>
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Volume</th>
                                <th>Purchase Value</th>
                                <th>Market Value</th>
                                <th>Open Price</th>
                                <th>Market Price</th>
                                <th>Net Profit/Loss</th>
                                <th>Net P/L %</th>
                                <th>Close</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chosen_portfolio != null && Array.isArray(positions) && positions.map((position, index) => (
                                <tr key={index} className='stock-item'>
                                    <td>{position.stock.symbol}</td>
                                    <td>{position.quantity}</td>
                                    <td>{position.average_price * position.quantity}</td>
                                    <td>{position.stock.price * position.quantity}</td>
                                    <td>{Math.round(position.average_price * 100) / 100}</td>
                                    <td>{position.stock.price}</td>
                                    <td>
                                        <Change data={(position.stock.price - position.average_price) * position.quantity}>
                                            {Math.round((position.stock.price - position.average_price) * position.quantity * 100) / 100}
                                        </Change>
                                    </td>
                                    <td>
                                        <Change data={((position.stock.price - position.average_price) * position.quantity) / (position.average_price * position.quantity)}>
                                            {Math.round(((position.stock.price - position.average_price) * position.quantity) / (position.average_price * position.quantity) * 10000) / 100}
                                        </Change>
                                    </td>
                                    <td>
                                        <button className='sell' onClick={() => closePosition(position.id)}>Close</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
        </div>
    )
}