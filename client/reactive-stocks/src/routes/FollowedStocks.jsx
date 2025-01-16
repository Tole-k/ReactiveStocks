import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import SearchBar from '../components/SearchBar';
import StockTable from '../components/StockTable';
import { Container, Alert, Spinner } from 'react-bootstrap';

export default function FollowedStocks({ fresh }) {
    const [enteredText, setEnteredText] = useState('');
    const [stocks, setStocks] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    function searchBarChange(event) {
        setEnteredText(event.target.value);
        setSymbol(event.target.value);
    }

    useEffect(() => {
        async function fetchStocks() {
            console.log("fetching stocks");
            setLoading(true);
            try {
                const response = await api.get('http://localhost:8000/follow/');
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
        fetchStocks();
    }, [fresh, navigate]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    async function addStock() {
        await api.post("http://127.0.0.1:8000/follow/add/", { symbol }).then((response) => {
            return response.data;
        }).then((data) => {
            if (!stocks.some((stock) => stock.symbol === symbol)) {
                setStocks((prev) => [...prev, data]);
            }
            setEnteredText("");
        }).catch((error) => {
            setErrorMessage(`Failed to add stock. ${error.response.data.message}`);
        });
    }

    async function removeStock(id) {
        await api.delete(`http://127.0.0.1:8000/follow/remove/${id}/`).catch((error) => {
            setErrorMessage(`Failed to remove stock. Please try again.", ${error.response.data.message}`);
        });
        setStocks(stocks.filter((stock) => stock.id !== id));
    }

    return (
        <Container className='whole-page'>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {loading && <div className="spinner-container"><Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner></div>}
            {!loading &&
                <SearchBar addStock={addStock} enteredText={enteredText} searchBarChange={searchBarChange} />
            }
            {!loading && stocks.length > 0 &&
                <StockTable stocks={stocks} removeStock={removeStock} />
            }
        </Container>
    );
}