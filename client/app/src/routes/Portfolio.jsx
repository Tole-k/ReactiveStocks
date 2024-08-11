import { useEffect, useState } from 'react';
import styled from "styled-components";
export default function Portfolio() {
    const [positions, setPositions] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState(0.0);
    const [price, setPrice] = useState(0.0);
    const [date, setDate] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');
    const enable_suggestions = true;


    useEffect(() => {
        const fetchPositions = async () => {
            console.log("fetching stocks");
            try {
                const response = await fetch("http://127.0.0.1:8000/portfolio/");
                console.log(response);
                if (response.status === 200) {
                    const data = await response.json();
                    setPositions(data);
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchPositions();
    }, []);

    const openPosition = async (e) => {
        console.log(e)
        const positionData = {
            symbol,
            quantity,
            average_price: price,
            date
        };
        fetch("http://127.0.0.1:8000/portfolio/open/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ positionData }),
        }).then((response) => { console.log(response); return response.json(); }).then((data) => {
            if (positions.some((position) => position.symbol === symbol)) {
                setPositions((prev) => prev.map((position) => {
                    if (position.symbol === data.symbol) {
                        return {
                            data
                        };
                    }
                    return position;
                }));
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
        await fetch(`http://127.0.0.1:8000/portfolio/close/${id}/`, {
            method: "DELETE",
        }).catch((error) => {
            console.log(error);
        });
        setPositions((prev) => prev.filter((stock) => stock.id !== id));
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
            <h1>Portfolio</h1>
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
            <table className='stock-table'>
                <thead>
                    <tr>
                        <td>Symbol</td>
                        <td>Volume</td>
                        <td>Purchase Value</td>
                        <td>Market Value</td>
                        <td>Open Price</td>
                        <td>Market Price</td>
                        <td>Net Profit/Loss</td>
                        <td>Net P/L %</td>
                        <td>Close</td>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(positions) && positions.map((position, index) => (
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
        </>
    )
}