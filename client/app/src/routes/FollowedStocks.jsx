import { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import { SearchBar } from '../components/SearchBar';
import { StockTable } from '../components/StockTable';

export default function FollowedStocks() {
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');
    const [stocks, setStocks] = useState([]);
    const [symbol, setSymbol] = useState("");

    const accessToken = localStorage.getItem('access_token');
    const enable_suggestions = true;

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
                }
            }).catch((error) => {
                console.log(error);
                console.log("Not authenticated, redirecting to login");
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

    return (
        <div className='whole-page'>
            <SearchBar addStock={addStock} suggestions={suggestions} enteredText={enteredText} searchBarChange={searchBarChange} suggestionsClick={suggestionsClick} />
            {stocks.length > 0 &&
                <StockTable stocks={stocks} removeStock={removeStock} />
            }
        </div>
    );
}