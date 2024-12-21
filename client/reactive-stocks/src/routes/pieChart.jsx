import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../axiosConfig';
import PortfolioPieChart from "../components/PortfolioPieChart";
import PortfolioSelector from "../components/PortfolioSelector";
import { RebalancingRecommendations } from "../components/RebalancingRecommendations";
import { AllocationForm } from "../components/AllocationForm";
import { checkAuth } from '../utils/auth'; // Import the checkAuth function
import { fetchPortfolios, fetchPositions, fetchSuggestions } from '../utils/dataFetchers'; // Import the data fetchers
import { Spinner } from "react-bootstrap";

export default function PieCharts() {
    const [positions, setPositions] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [allocation, setAllocation] = useState(0.0);
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [portfolios, setPortfolios] = useState([]);
    const [chosen_portfolio, setChosenPortfolio] = useState(null);
    const [proportions, setProportions] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
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
        async function fetchProportions() {
            if (chosen_portfolio) {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/portfolio/allocation/${chosen_portfolio.id}/`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    if (response.status === 200) {
                        setProportions(response.data);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
        if (chosen_portfolio) {
            fetchProportions();
        }
    }, [accessToken, chosen_portfolio]);

    useEffect(() => {
        const storedPortfolio = localStorage.getItem('chosen_portfolio');
        if (storedPortfolio) {
            setChosenPortfolio(JSON.parse(storedPortfolio));
        }
    }, []);

    useEffect(() => {
        setRecommendations([]);
        async function generate_recommendations() {
            const total_value = positions.reduce((acc, position) => acc + position.quantity * position.stock.price, 0);
            let props = {};
            for (const position of positions) {
                let found = false;
                for (const proportion of proportions) {
                    if (position.stock.symbol === proportion.stock) {
                        const desired_value = total_value * proportion.allocation;
                        const current_value = position.quantity * position.stock.price;
                        const difference = desired_value - current_value;
                        const shares_of_difference = difference / position.stock.price;
                        if (shares_of_difference > 0.5) {
                            setRecommendations((prev) => [...prev, "Buy " + Math.round(shares_of_difference) + " shares of " + position.stock.symbol]);
                        }
                        else if (shares_of_difference < -0.5) {
                            setRecommendations((prev) => [...prev, "Sell " + Math.round(Math.abs(shares_of_difference)) + " shares of " + position.stock.symbol]);
                        }
                        found = true;
                        props[proportion.stock] = true;
                        break;
                    }
                }
                if (!found) {
                    setRecommendations((prev) => [...prev, "Sell all shares of " + position.stock.symbol]);
                }
            }
            for (const proportion of proportions) {
                if (!props[proportion.stock]) {
                    setRecommendations((prev) => [...prev, "Buy " + Math.round(total_value * proportion.allocation) + "$ worth of " + proportion.stock + " shares"]);
                }
            }
        }
        generate_recommendations();
    }, [positions, proportions]);

    function choose_portfolio(portfolio) {
        localStorage.setItem('chosen_portfolio', JSON.stringify(portfolio));
        setChosenPortfolio(portfolio);
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

    function prepare_portfolio_data() {
        const sum = positions.reduce((acc, position) => acc + position.quantity * position.stock.price, 0);
        const data = positions.map((position) => ({
            name: position.stock.symbol,
            value: Math.round(position.quantity * position.stock.price / sum * 100) / 100
        }));
        return data;
    }

    function prepare_allocation_data() {
        const sum = proportions.reduce((acc, proportion) => acc + proportion.allocation, 0);
        const data = proportions.map(proportion => ({
            name: proportion.stock,
            value: proportion.allocation
        }));
        if (sum < 1)
            data.push({ name: "Unallocated", value: 1 - sum });
        return data;
    }

    async function add_allocation(e) {
        const data = {
            symbol,
            allocation,
        }
        await axios.post(`http://127.0.0.1:8000/piechart/add_allocation/${chosen_portfolio.id}/`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        }).then((response) => response.data).then((data) => {
            if (proportions.some((proportion) => proportion.symbol === symbol)) {
                const next_proportions = proportions.map((proportion) => {
                    if (proportion.stock === symbol) {
                        return {
                            ...proportion,
                            ...data
                        };
                    }
                    return proportion;
                });
                setProportions(next_proportions)
            }
            else {
                setProportions((prev) => [...prev, data]);
            }
            setEnteredText("");
            setSuggestions([]);
            setSymbol("");
            setAllocation(0.0);
        }).catch((error) => {
            console.log(error);
            setErrorMessage("Failed to add allocation. Please try again.");
        });
        e.preventDefault();
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="whole-page">
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {loading && <div className="spinner-container">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>}
            {!loading &&
                <PortfolioSelector chosen_portfolio={chosen_portfolio} portfolios={portfolios} choose_portfolio={choose_portfolio} />
            }
            {!loading && chosen_portfolio &&
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <div>
                        <PortfolioPieChart prepare_data={prepare_portfolio_data} COLORS={COLORS} label={'Current Portfolio'} />
                        <div>
                            <RebalancingRecommendations recommendations={recommendations} />
                        </div>
                    </div>
                    <div>
                        <PortfolioPieChart prepare_data={prepare_allocation_data} COLORS={COLORS} label={'Target Portfolio'} />
                        <div>
                            <AllocationForm enteredText={enteredText} searchBarChange={searchBarChange} suggestionsClick={suggestionsClick} setAllocation={setAllocation} allocation={allocation} add_allocation={add_allocation} suggestions={suggestions} />
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
