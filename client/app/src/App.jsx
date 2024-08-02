import { useEffect, useState } from 'react';
import styled from "styled-components";
import './App.css'

function App() {
    const [stocks, setStocks] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState(''); 

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/stocks/").then((response) => {
                if (response.status === 403) {
                    throw new Error("Token limit reached");
                }
                if (response.status === 204) {
                    throw new Error("No followed stocks");
                }
            });
            const data = await response.json();
            setStocks(data);
        } catch (error) {
            alert(error);
            console.log(error);
        }
    }
    const addStock = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/stocks/add/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ symbol }),
            }).then((response) => { 
                if (response.status === 403) {
                    throw new Error("Token limit reached");
                }
            });
            const data = await response.json();
            setStocks((prev) => [...prev, data]);
            setEnteredText("");
            setSuggestions([]);
        } catch (error) {
            alert(error);
            console.log(error);
        }
    };
    const removeStock = async (id) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await fetch(`http://127.0.0.1:8000/api/stocks/remove/${id}/`, {
                method: "DELETE",
            }).then((response) => {
                if (response.status === 403) {
                    throw new Error("Token limit reached");
                }
            });
            setStocks((prev) => prev.filter((stock) => stock.id !== id));
        } catch (error) {
            alert(error);
            console.log(error);
        }
    }
    const Change = styled.p`
        color: ${(props) => props.data === 0 ? "white" : props.data > 0 ? "green" : "red"};
    `;
    const fetchSuggestions = async (symbol) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/stocks/suggestions/${symbol}/`).then((response) => {
                if (response.status === 403) {
                    throw new Error("Token limit reached");
                }
            });
            setSuggestions(await response.json());
        } catch (error) {
            alert(error);
            console.log(error);
        }
    }
    const searchBarChange = (event) => {
        setEnteredText(event.target.value);
        setSymbol(event.target.value);
        fetchSuggestions(event.target.value);
        if (!event.target.value) {
            setSuggestions([]);
        }
    }
    const suggestionsClick = (symbol) => {
        setSymbol(symbol);
        setEnteredText(symbol);
    }
    return (
        <>
            <h1>Stock App</h1>
            <div className='search-container'>
                <div className='search-inner'>
                    <input type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                    <button onClick={addStock}>Follow</button>
                </div>
                <div className='dropdown'>
                    {suggestions.length ? suggestions.map((suggestion, index) => (
                        <div key={index} className='dropdown-row' onClick={() => suggestionsClick(suggestion.symbol)}>{suggestion.symbol} ({suggestion.name})</div>
                    )) : null}
                </div>
            </div>
            {stocks.map((stock, index) => (
                <div key={index}>
                    <p>Symbol: {stock.symbol}</p>
                    <p>Name: {stock.name}</p>
                    <p>Price: {stock.price}</p>
                    <Change data={stock.changesPercentage}>Change: {stock.changesPercentage}</Change>
                    <button onClick={() => removeStock(stock.id)}>Unfollow</button>
                </div>
            ))}
        </>
    );
}
export default App;