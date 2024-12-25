import { useEffect, useState } from 'react';
import api from '../api';
import xirr from '@webcarrot/xirr';
import XirrSummary from '../components/XirrSummary';
import PositionForm from '../components/PositionForm';
import PositionTable from '../components/PositionTable';
import PortfolioSelector from '../components/PortfolioSelector';
import { fetchPortfolios, fetchPositions, fetchSuggestions } from '../utils/dataFetchers';
import { Spinner, Container, Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

function Portfolio() {
    const [positions, setPositions] = useState([]);
    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState(0.0);
    const [price, setPrice] = useState(0.0);
    const [date, setDate] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [enteredText, setEnteredText] = useState('');
    const [portfolios, setPortfolios] = useState([]);
    const [chosen_portfolio, setChosenPortfolio] = useState(null);
    const [sellAmount, setSellAmount] = useState(0.0);
    const [sellPrice, setSellPrice] = useState(0.0);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState("");

    const enable_suggestions = true;

    useEffect(() => {
        async function loadPortfolios() {
            setLoading(true);
            const portfoliosData = await fetchPortfolios();
            setPortfolios(portfoliosData);
            setLoading(false);
        }

        loadPortfolios();
    }, []);

    useEffect(() => {
        async function loadPositions() {
            setLoading(true);
            const positionsData = await fetchPositions(chosen_portfolio);
            setPositions(positionsData);
            setLoading(false);
        }

        if (chosen_portfolio) {
            loadPositions();
        }
    }, [chosen_portfolio]);

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
        api.post(`http://127.0.0.1:8000/portfolio/open/${chosen_portfolio.id}/`, positionData).then((response) => response.data).then((data) => {
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
            setErrorMessage(`Failed to open position. ${error.response.data.message}`);
        });
        e.preventDefault();
    }

    async function closePosition(id) {
        const sellData = {
            average_price: sellPrice,
            quantity: sellAmount
        };
        console.log(sellData);
        await api.post(`http://127.0.0.1:8000/portfolio/close/${id}/`, sellData).then((response) => {
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
            fetchSuggestions(event.target.value, setSuggestions);
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

    function handleShowModal() {
        setShowModal(true);
    }

    function handleCloseModal() {
        setShowModal(false);
        setNewPortfolioName("");
    }

    async function create_new_portfolio() {
        if (newPortfolioName) {
            try {
                const response = await api.post("http://127.0.0.1:8000/piechart/add/", { name: newPortfolioName });
                if (response.status === 201) {
                    setPortfolios((prev) => [...prev, response.data]);
                    choose_portfolio(response.data);
                    handleCloseModal();
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
            console.log(cashFlows);
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
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            {loading && (
                <div className="spinner-container">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            )}
            {!loading &&
                <Row className="mb-4">
                    <Col>
                        <PortfolioSelector
                            chosen_portfolio={chosen_portfolio}
                            portfolios={portfolios}
                            create_new_portfolio={handleShowModal}
                            choose_portfolio={choose_portfolio}
                        />
                    </Col>
                </Row>
            }
            {!loading && chosen_portfolio &&
                <div>
                    <PositionForm
                        suggestions={suggestions}
                        enteredText={enteredText}
                        suggestionsClick={suggestionsClick}
                        quantity={quantity}
                        price={price}
                        date={date}
                        openPosition={openPosition}
                        setDate={setDate}
                        setPrice={setPrice}
                        searchBarChange={searchBarChange}
                        setQuantity={setQuantity}
                    />
                    {positions.length > 0 &&
                        <>
                            <PositionTable
                                chosen_portfolio={chosen_portfolio}
                                positions={positions}
                                calculatePositionXirr={calculatePositionXirr}
                                setSellAmount={setSellAmount}
                                setSellPrice={setSellPrice}
                                closePosition={closePosition}
                            />
                            <XirrSummary
                                calculatePortfolioXirr={calculatePortfolioXirr}
                                positions={positions}
                            />
                        </>
                    }
                </div>
            }

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Portfolio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formPortfolioName">
                            <Form.Label>Portfolio Name</Form.Label>
                            <Form.Control type="text" placeholder="Enter portfolio name" value={newPortfolioName} onChange={(e) => setNewPortfolioName(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={create_new_portfolio}>
                        Create Portfolio
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    )
}

export default Portfolio;