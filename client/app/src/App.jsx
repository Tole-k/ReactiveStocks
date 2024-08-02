import { useEffect, useState } from 'react';
import styled from "styled-components";
import './App.css'

function App() {
    const [stocks, setStocks] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/stocks/");
            const data = await response.json();
            setStocks(data);
        } catch (error) {
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
            });
            const data = await response.json();
            setStocks((prev) => [...prev, data]);
        } catch (error) {
            console.log(error);
        }
    };
    const removeStock = async (id) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await fetch(`http://127.0.0.1:8000/api/stocks/remove/${id}/`, {
                method: "DELETE",
            });
            setStocks((prev) => prev.filter((stock) => stock.id !== id));
        } catch (error) {
            console.log(error);
        }
    }
    const Change = styled.p`
        color: ${(props) => props.data === 0 ? "white" : props.data > 0 ? "green" : "red"};
    `;
    const fetchSuggestions = async (symbol) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/stocks/suggestions/${symbol}/`);
            setSuggestions(await response.json());
        } catch (error) {
            console.log(error);
        }
    }
    const onChange = (event) => {
        setSymbol(event.target.value);
        fetchSuggestions(event.target.value);
    }
    return (
        <>
            <h1>Stock App</h1>
            <div className='search-container'>
                <div className='search-inner'>
                    <input type="text" placeholder="Stock Symbol..." onChange={onChange} />
                    <button onClick={addStock}>Follow</button>
                </div>
                <div className='dropdown'>
                    {suggestions.length ? suggestions.map((suggestion, index) => (
                        <div key={index} className='dropdown-row'>{suggestion.symbol}</div>
                    )) : null}
                </div>
            </div>
            {stocks.map((stock, index) => (
                <div key={index}>
                    <p>Symbol: {stock.symbol}</p>
                    <p>Price: {stock.price}</p>
                    <Change data={stock.change_percent}>Change: {stock.change_percent}</Change>
                    <button onClick={() => removeStock(stock.id)}>Unfollow</button>
                </div>
            ))}
        </>
    );
}
export default App;