import { useEffect, useState } from 'react';
import './App.css'

function App() {
    const [stocks, setStocks] = useState([]);
    const [symbol, setSymbol] = useState("");

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
                body: JSON.stringify({symbol}),
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
    return (
        <>
            <h1>Stock App</h1>

            <div>
                <input type="text" placeholder="Stock Symbol..." onChange={(e) => setSymbol(e.target.value)} />
                <button onClick={addStock}>Follow</button>
            </div>
            {stocks.map((stock, index) => (
                <div key={index}>
                    <p>Symbol: {stock.symbol}</p>
                    <p>Price: {stock.price}</p>
                    <p>Change: {stock.change}</p>
                    <button onClick={() => removeStock(stock.id)}>Unfollow</button>
                </div>
            ))}
        </>
    );
}
export default App;