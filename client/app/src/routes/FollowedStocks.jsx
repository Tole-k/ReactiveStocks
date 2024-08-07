import { useEffect, useState } from 'react';
import styled from "styled-components";
import Nav from 'react-bootstrap/Nav';

function FollowedStocks() {
    const [stocks, setStocks] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/follow/");
            const data = await response.json();
            setStocks(data);
        } catch (error) {
            
            console.log(error);
        }
    }
    const addStock = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/follow/add/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ symbol }),
            });
            const data = await response.json();
            setStocks((prev) => [...prev, data]);
            setEnteredText("");
            setSuggestions([]);
        } catch (error) {
            
            console.log(error);
        }
    };
    const removeStock = async (id) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await fetch(`http://127.0.0.1:8000/follow/remove/${id}/`, {
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
        if (symbol !== "") {
            try {
                const response = await fetch(`http://127.0.0.1:8000/follow/suggestions/${symbol}/`);
                setSuggestions(await response.json());
            } catch (error) {
                
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
        setSuggestions([]);
    }
    return (
        <>
            <h1>Stock Browser</h1>
            <div className='search-container'>
                <div className='search-inner'>
                    <input type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                    <button onClick={addStock}>Follow</button>
                </div>
                <div className='dropdown' id='followed'>
                    {suggestions.length ? suggestions.map((suggestion, index) => (
                        <div key={index} className='dropdown-row' onClick={() => suggestionsClick(suggestion.symbol)}>{suggestion.symbol} ({suggestion.name})</div>
                    )) : null}
                </div>
            </div>
            <h3>Followed Stocks</h3>
            <table className='stock-table'>
                <thead>
                    <td>Symbol</td>
                    <td>Name</td>
                    <td>Price</td>
                    <td>Change</td>
                    <td>%Change</td>
                    <td>Volume</td>
                    <td>Actions</td>
                </thead>
                {stocks.filter(stock => stock.followed).map((stock, index) => (
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
                            <button onClick={() => removeStock(stock.id)}>Unfollow</button>
                        </td>
                    </tr>
                ))}
            </table>
            <h3>Owned Stocks</h3>
            <table className='stock-table'>
                <thead>
                    <td>Symbol</td>
                    <td>Name</td>
                    <td>Price</td>
                    <td>Change</td>
                    <td>%Change</td>
                    <td>Volume</td>
                    <td>Actions</td>
                </thead>
                {stocks.filter(stock => stock.owned).map((stock, index) => (
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
                            <button>
                                <Nav.Link href="/portfolio">
                                    Portfolio
                                </Nav.Link>
                            </button>
                        </td>
                    </tr>
                ))}
            </table>
        </>
    );
}
export default FollowedStocks;