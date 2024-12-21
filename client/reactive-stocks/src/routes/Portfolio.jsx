import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import xirr from '@webcarrot/xirr';
import XirrSummary from '../components/XirrSummary';
import PositionForm from '../components/PositionForm';
import PositionTable from '../components/PositionTable';
import PortfolioSelector from '../components/PortfolioSelector';
import { checkAuth } from '../utils/auth'; // Import the checkAuth function
import { fetchPortfolios, fetchPositions, fetchSuggestions } from '../utils/dataFetchers'; // Import the data fetchers
import { Spinner, Container } from 'react-bootstrap';

function Portfolio() {
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
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const accessToken = localStorage.getItem('access_token');
    const enable_suggestions = true;
    const navigate = useNavigate();

    useEffect(() => {
        async function authenticate() {
            const isAuthenticated = await checkAuth(accessToken, navigate);
            setIsAuthenticated(isAuthenticated);
        }

        authenticate();
    }, [accessToken, navigate]);

    useEffect(() => {
        async function loadPortfolios() {
            setLoading(true);
            const portfoliosData = await fetchPortfolios(accessToken);
            setPortfolios(portfoliosData);
            setLoading(false);
        }

        if (isAuthenticated) {
            loadPortfolios();
        }
    }, [accessToken, isAuthenticated]);

    useEffect(() => {
        async function loadPositions() {
            setLoading(true);
            const positionsData = await fetchPositions(accessToken, chosen_portfolio);
            setPositions(positionsData);
            setLoading(false);
        }

        if (chosen_portfolio) {
            loadPositions();
        }
    }, [accessToken, chosen_portfolio]);

    useEffect(() => {
        const storedPortfolio = localStorage.getItem('chosen_portfolio');
        if (storedPortfolio) {
            setChosenPortfolio(JSON.parse(storedPortfolio));
        }
    }, []);

    async function openPosition(e) {
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
            setErrorMessage("Failed to open position. Please try again.");
        });
        e.preventDefault();
    }

    async function closePosition(id) {
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
            setErrorMessage("Failed to close position. Please try again.");
        });
        setSellAmount(0.0);
        setSellPrice(0.0);
    }

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

    function choose_portfolio(portfolio) {
        localStorage.setItem('chosen_portfolio', JSON.stringify(portfolio));
        setChosenPortfolio(portfolio);
    }

    async function create_new_portfolio() {
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
    }

    function calculatePositionXirr(position) {
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
    }

    function calculatePortfolioXirr(positions) {
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
    }

    return (
        <Container className='whole-page'>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {loading && <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>}
            {!loading &&
                <PortfolioSelector chosen_portfolio={chosen_portfolio} portfolios={portfolios} create_new_portfolio={create_new_portfolio} choose_portfolio={choose_portfolio} />
            }
            {!loading && portfolios.length > 0 &&
                <div>
                    <PositionForm suggestions={suggestions} enteredText={enteredText} suggestionsClick={suggestionsClick} quantity={quantity} price={price} date={date} openPosition={openPosition} setDate={setDate} setPrice={setPrice} searchBarChange={searchBarChange} setQuantity={setQuantity} />
                    {positions.length > 0 &&
                        <PositionTable chosen_portfolio={chosen_portfolio} positions={positions} calculatePositionXirr={calculatePositionXirr} setSellAmount={setSellAmount} setSellPrice={setSellPrice} closePosition={closePosition} />
                    }
                    {positions.length > 0 &&
                        <XirrSummary calculatePortfolioXirr={calculatePortfolioXirr} positions={positions} />
                    }
                </div>
            }
        </Container>
    )
}

export default Portfolio;