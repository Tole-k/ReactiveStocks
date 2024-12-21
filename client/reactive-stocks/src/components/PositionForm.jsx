import { Form, Button } from 'react-bootstrap';
import Suggestions from './Suggestions';

export default function PositionForm({ suggestions, enteredText, suggestionsClick, quantity, price, date, openPosition, setDate, setPrice, searchBarChange, setQuantity }) {
    return (
        <div className='portfolio-container'>
            <Form className='portfolio-form'>
                <div>
                    <Form.Group>
                        <Form.Label>Symbol:</Form.Label>
                        <Form.Control type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                        <Suggestions suggestions={suggestions} suggestionsClick={suggestionsClick} id='portfolio' />
                    </Form.Group>
                </div>
                <Form.Group>
                    <Form.Label>Quantity:</Form.Label>
                    <Form.Control type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Price:</Form.Label>
                    <Form.Control type="number" placeholder='0' value={price} onChange={(e) => setPrice(e.target.value)} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Date:</Form.Label>
                    <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Form.Group>
                <Button className='buy' variant="success" onClick={openPosition}>Open</Button>
            </Form>
        </div>
    );
}
