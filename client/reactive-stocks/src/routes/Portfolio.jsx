import { useEffect, useState } from 'react';
import styled from "styled-components";
import axios from '../axiosConfig';
import xirr from '@webcarrot/xirr';
import XirrSummary from '../components/XirrSummary';
import PositionForm from '../components/PositionForm';
import PositionTable from '../components/PositionTable';
import PortfolioSelector from '../components/PortfolioSelector';
export default function Portfolio() {
    const [positions, setPositions] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState(0.0);
    const [price, setPrice] = useState(0.0);
    const [date, setDate] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [portfolios, setPortfolios] = useState([]);
    const [chosen_portfolio, setChosenPortfolio] = useState(null);
    const [sellAmount, setSellAmount] = useState(0.0);
    const [sellPrice, setSellPrice] = useState(0.0);

    const accessToken = localStorage.getItem('access_token');
    const enable_suggestions = true;

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/user_auth/whoami/", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.status === 200) {
                    setIsAuthenticated(true);
                }
            } catch {
                setIsAuthenticated(false);
                window.location.href = '/user_auth/login';
            }
        };

        checkAuth();
    }, [accessToken]);

    useEffect(() => {
        const fetchPortfolios = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/piechart/", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.status === 204) {
                    console.log("No portfolios found");
                } else {
                    setPortfolios(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        };

        if (isAuthenticated) {
            fetchPortfolios();
        }
        console.log(positions);
    }, [accessToken, isAuthenticated, positions]);

    useEffect(() => {
        const fetchPositions = async () => {
            if (chosen_portfolio) {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/portfolio/${chosen_portfolio.id}/`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    if (response.status === 200) {
                        setPositions(response.data);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        };

        if (chosen_portfolio) {
            fetchPositions();
        }
    }, [accessToken, chosen_portfolio]);

    useEffect(() => {
        const storedPortfolio = localStorage.getItem('chosen_portfolio');
        if (storedPortfolio) {
            setChosenPortfolio(JSON.parse(storedPortfolio));
        }
    }, []);

    const openPosition = async (e) => {
        const positionData = {
            symbol,
            quantity,
            average_price: price,
            timestamp: date
        };
        console.log(positionData);
        axios.post(`http://127.0.0.1:8000/portfolio/open/${chosen_portfolio.id}/`, positionData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((response) => response.data).then((data) => {
            if (positions.some((position) => position.stock.symbol === symbol)) {
                const next_positions = positions.map((position) => {
                    if (position.stock.symbol === symbol) {
                        return {
                            ...position,
                            ...data
                        };
                    }
                    return position;
                });
                setPositions(next_positions);
            }
            else {
                setPositions((prev) => [...prev, data]);
            }
            setEnteredText("");
            setSuggestions([]);
            setQuantity(0.0);
            setPrice(0.0);
            setDate("");
        }).catch((error) => {
            console.log(error);
        });
        e.preventDefault();
    };

    const closePosition = async (id) => {
        const sellData = {
            average_price: sellPrice,
            quantity: sellAmount
        };
        console.log(sellData);
        await axios.post(`http://127.0.0.1:8000/portfolio/close/${id}/`, sellData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((response) => {
            if (response.status === 200) {
                setPositions((prev) => prev.filter((stock) => stock.id !== id));
            }
            else {
                const next_positions = positions.map((position) => {
                    if (position.id === id) {
                        return {
                            ...position,
                            ...response.data
                        };
                    }
                    return position;
                });
                setPositions(next_positions);
            }
        }).catch((error) => {
            console.log(error);
        });
        setSellAmount(0.0);
        setSellPrice(0.0);
    }

    const Change = styled.p`color: ${(props) => props.data === 0 ? "white" : props.data > 0 ? "green" : "red"};
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center; 
        height: 100%;`;

    const fetchSuggestions = async (symbol) => {
        if (symbol !== "") {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/follow/suggestions/${symbol}/`, {
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

    const choose_portfolio = (portfolio) => {
        localStorage.setItem('chosen_portfolio', JSON.stringify(portfolio));
        setChosenPortfolio(portfolio);
    }

    const create_new_portfolio = async () => {
        const portfolioName = prompt("Enter the name of the new portfolio:");
        if (portfolioName) {
            try {
                const response = await axios.post("http://127.0.0.1:8000/piechart/add/", { name: portfolioName }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.status === 201) {
                    setPortfolios((prev) => [...prev, response.data]);
                    choose_portfolio(response.data);
                }
            } catch (error) {
                console.log(error);
            }
        }
    };
    const calculatePositionXirr = (position) => {
        const cashFlows = []
        position.transactions.forEach((transaction) => {
            cashFlows.push({
                amount: -transaction.quantity * transaction.average_price,
                date: new Date(transaction.timestamp)
            });
        });
        cashFlows.push({
            amount: position.quantity * position.stock.price,
            date: new Date()
        });
        try {
            const xir = xirr(cashFlows);
            return xir;
        }
        catch {
            return NaN;
        }
    };
    const calculatePortfolioXirr = (positions) => {
        const cashFlows = []
        positions.forEach((position) => {
            position.transactions.forEach((transaction) => {
                cashFlows.push({
                    amount: -transaction.quantity * transaction.average_price,
                    date: new Date(transaction.timestamp)
                });
            });
            cashFlows.push({
                amount: position.quantity * position.stock.price,
                date: new Date()
            });
        });
        try {
            const xir = xirr(cashFlows);
            return xir;
        }
        catch {
            return NaN;
        }
    };

    return (
        <div className='whole-page'>
            <PortfolioSelector chosen_portfolio={chosen_portfolio} portfolios={portfolios} create_new_portfolio={create_new_portfolio} choose_portfolio={choose_portfolio} />
            {portfolios.length > 0 &&
                <div>
                    <PositionForm suggestions={suggestions} enteredText={enteredText} suggestionsClick={suggestionsClick} quantity={quantity} price={price} date={date} openPosition={openPosition} setDate={setDate} setPrice={setPrice} searchBarChange={searchBarChange} setQuantity={setQuantity} />
                    {positions.length > 0 &&
                        <PositionTable chosen_portfolio={chosen_portfolio} positions={positions} Change={Change} calculatePositionXirr={calculatePositionXirr} setSellAmount={setSellAmount} setSellPrice={setSellPrice} closePosition={closePosition} />
                    }
                    {positions.length > 0 &&
                        <XirrSummary calculatePortfolioXirr={calculatePortfolioXirr} positions={positions} Change={Change} />
                    }
                </div>
            }
        </div>
    )
}