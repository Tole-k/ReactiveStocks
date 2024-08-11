import { useEffect, useState } from 'react';
import styled from "styled-components";
import Nav from 'react-bootstrap/Nav';

function FollowedStocks() {
    const [stocks, setStocks] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');
    const enable_suggestions = true;

    useEffect(() => {
        const fetchStocks = async () => {
            console.log("fetching stocks");
            try {
                const response = await fetch("http://127.0.0.1:8000/follow/");
                console.log(response);
                if (response.status === 200) {
                    const data = await response.json();
                    console.log(data);
                    setStocks(data);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchStocks();
    }, []);

    const addStock = async () => {
        await fetch("http://127.0.0.1:8000/follow/add/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ symbol }),
        }).then((response) => {
            console.log(response);
            return response.json();
        }).then((data) => {
            //setStocks((prev) => [...prev, data]);
            if (stocks.some((stock) => stock.symbol === symbol)) {
                setStocks((prev) => prev.map((stock) => {
                    if (stock.symbol === data.symbol) {
                        stock.followed = true;
                    }
                    return stock;
                }));
            }
            else {
                setStocks((prev) => [...prev, data]);
            }
            setEnteredText("");
            setSuggestions([]);
        }).catch((error) => {
            console.log(error);
        });
    };
    const removeStock = async (id) => {
        await fetch(`http://127.0.0.1:8000/follow/remove/${id}/`, {
            method: "DELETE",
        });
        //setStocks((prev) => prev.filter((stock) => stock.id !== id));
        setStocks((prev) => prev.map((stock) => {
            if (stock.id === id) {
                stock.followed = false;
            }
            return stock;
        }));
    }
    // eslint-disable-next-line react/prop-types
    const Change = styled.p`color: ${(props) => props.data === 0 ? "white" : props.data > 0 ? "green" : "red"};`;
    const fetchSuggestions = async (symbol) => {
        if (symbol !== "") {
            await fetch(`http://127.0.0.1:8000/follow/suggestions/${symbol}/`).then((response) => response.json()).then((data) => {
                setSuggestions(data);
            }).catch((error) => {
                console.log(error);
            });
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
                    <tr>
                        <td>Symbol</td>
                        <td>Name</td>
                        <td>Price</td>
                        <td>Change</td>
                        <td>%Change</td>
                        <td>Volume</td>
                        <td>Actions</td>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(stocks) && stocks.filter(stock => stock.followed).map((stock, index) => (
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
                </tbody>
            </table>
            <h3>Owned Stocks</h3>
            <table className='stock-table'>
                <thead>
                    <tr>
                        <td>Symbol</td>
                        <td>Name</td>
                        <td>Price</td>
                        <td>Change</td>
                        <td>%Change</td>
                        <td>Volume</td>
                        <td>Actions</td>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(stocks) && stocks.filter(stock => stock.owned).map((stock, index) => (
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
                </tbody>
            </table>
        </>
    );
}
export default FollowedStocks;