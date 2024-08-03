import { useEffect, useState } from 'react';
import styled from "styled-components";
import '../App.css';
export default function Portfolio() {
    const [positions, setPositions] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState(0.0);
    const [price, setPrice] = useState(0.0);
    const [date, setDate] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');

    useEffect(() => {
        //fetchStocks();
    }, []);

    const openPosition = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/stocks/open/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ symbol, quantity, price, date }),
            });
            const data = await response.json();
            setPositions((prev) => [...prev, data]);
            setEnteredText("");
            setSuggestions([]);
        } catch (error) {
            alert(error);
            console.log(error);
        }
    };
    const closePosition = async (id) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await fetch(`http://127.0.0.1:8000/api/stocks/close/${id}/`, {
                method: "DELETE",
            });
            setPositions((prev) => prev.filter((stock) => stock.id !== id));
        } catch (error) {
            alert(error);
            console.log(error);
        }
    }
    const Change = styled.p`
        color: ${(props) => props.data === 0 ? "white" : props.data > 0 ? "green" : "red"};
    `;
    const fetchSuggestions = async (symbol) => {
        if (symbol !== "") {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/stocks/suggestions/${symbol}/`);
                setSuggestions(await response.json());
            } catch (error) {
                alert(error);
                console.log(error);
            }
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
            <h1>Portfolio</h1>
            <div className='search-container'>
                <div className='search-inner'>
                    <input type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                    <button onClick={openPosition}>Follow</button>
                </div>
                <div className='dropdown'>
                    {suggestions.length ? suggestions.map((suggestion, index) => (
                        <div key={index} className='dropdown-row' onClick={() => suggestionsClick(suggestion.symbol)}>{suggestion.symbol} ({suggestion.name})</div>
                    )) : null}
                </div>
            </div>
        </>
    )
}