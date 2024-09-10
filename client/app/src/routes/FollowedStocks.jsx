import { useEffect, useState } from 'react';
import styled from "styled-components";
import axios from '../axiosConfig';

export default function FollowedStocks() {
    const [stocks, setStocks] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const accessToken = localStorage.getItem('access_token');
    const enable_suggestions = true;

    useEffect(() => {
        const fetchStocks = async () => {
            console.log("fetching stocks");
            try {
                const response = await axios.get('http://localhost:8000/follow/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                console.log(response);
                if (response.status === 200) {
                    setStocks(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        };
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
                    setUser(response.data.username);
                }
            }).catch((error) => {
                console.log(error);
                console.log("Not authenticated, redirecting to login");
                setIsAuthenticated(false);
                window.location.href = '/user_auth/login';
            });
        };
        checkAuth();
        fetchStocks();
    }, [accessToken]);

    const addStock = async () => {
        await axios.post("http://127.0.0.1:8000/follow/add/", { symbol }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((response) => {
            console.log(response);
            return response.data;
        }).then((data) => {
            if (!stocks.some((stock) => stock.symbol === symbol)) {
                setStocks((prev) => [...prev, data]);
            }
            setEnteredText("");
            setSuggestions([]);
        }).catch((error) => {
            console.log(error);
        });
    };

    const removeStock = async (id) => {
        await axios.delete(`http://127.0.0.1:8000/follow/remove/${id}/`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        setStocks(stocks.filter((stock) => stock.id !== id));
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
                    method: "GET",
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

    return (
        <div className='whole-page'>
            <h1>Stock Browser</h1>
            <div className='search-container'>
                <div className='search-inner'>
                    <input type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                    <button className='follow' onClick={addStock}>Follow</button>
                </div>
                <div className='dropdown' id='followed'>
                    {suggestions.length ? suggestions.map((suggestion, index) => (
                        <div key={index} className='dropdown-row' onClick={() => suggestionsClick(suggestion.symbol)}>{suggestion.symbol} ({suggestion.name})</div>
                    )) : null}
                </div>
            </div>
            {stocks.length > 0 &&
                <div className='tableWrap'>
                    <table className='stock-table'>
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Change</th>
                                <th>%Change</th>
                                <th>Volume</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(stocks) && stocks.map((stock, index) => (
                                <tr key={index} className='stock-item'>
                                    <td>{stock.symbol}</td>
                                    <td>{stock.name}</td>
                                    <td>{stock.price}</td>
                                    <td>
                                        <Change data={stock.change}>{stock.change}</Change>
                                    </td>
                                    <td>
                                        <Change data={stock.changesPercentage}>{stock.changesPercentage}</Change>
                                    </td>
                                    <td>{stock.volume}</td>
                                    <td>
                                        <button className='sell' onClick={() => removeStock(stock.id)}>Unfollow</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            }
        </div>
    );
}