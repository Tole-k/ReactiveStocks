import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import SearchBar from '../components/SearchBar';
import StockTable from '../components/StockTable';
import { fetchSuggestions } from '../utils/dataFetchers'; // Import the fetchSuggestions function
import { checkAuth } from '../utils/auth'; // Import the checkAuth function
import { Container, Alert, Spinner } from 'react-bootstrap';

export default function FollowedStocks() {
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');
    const [stocks, setStocks] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const accessToken = localStorage.getItem('access_token');
    const enable_suggestions = true;
    const navigate = useNavigate();

    function searchBarChange(event) {
        setEnteredText(event.target.value);
        setSymbol(event.target.value);
        if (enable_suggestions)
            fetchSuggestions(event.target.value, accessToken, setSuggestions);
        if (!event.target.value) {
            setSuggestions([]);
        }
    }

    function suggestionsClick(symbol) {
        setSymbol(symbol);
        setEnteredText(symbol);
        setSuggestions([]);
    }

    useEffect(() => {
        async function fetchStocks() {
            console.log("fetching stocks");
            setLoading(true);
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
            } finally {
                setLoading(false);
            }
        }

        async function authenticate() {
            const isAuthenticated = await checkAuth(accessToken, navigate);
            if (isAuthenticated) {
                fetchStocks();
            }
        }

        authenticate();
    }, [accessToken, navigate]);

    async function addStock() {
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
            setErrorMessage("Failed to add stock. Please try again.");
        });
    }

    async function removeStock(id) {
        await axios.delete(`http://127.0.0.1:8000/follow/remove/${id}/`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).catch((error) => {
            console.log(error);
            setErrorMessage("Failed to remove stock. Please try again.");
        });
        setStocks(stocks.filter((stock) => stock.id !== id));
    }

    return (
        <Container className='whole-page'>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}
            {!loading &&
                <SearchBar addStock={addStock} suggestions={suggestions} enteredText={enteredText} searchBarChange={searchBarChange} suggestionsClick={suggestionsClick} />
            }
            {!loading && stocks.length > 0 &&
                <StockTable stocks={stocks} removeStock={removeStock} />
            }
        </Container>
    );
}