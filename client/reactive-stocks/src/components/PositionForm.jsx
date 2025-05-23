import { Form, Button } from 'react-bootstrap';

export default function PositionForm({ enteredText, quantity, price, date, openPosition, setDate, setPrice, searchBarChange, setQuantity }) {
    return (
        <div className='portfolio-container'>
            <Form className='portfolio-form'>
                <div className="row">
                    <div className="col">
                        <Form.Group>
                            <Form.Label>Symbol:</Form.Label>
                            <Form.Control type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                        </Form.Group>
                    </div>
                    <div className="col">
                        <Form.Group>
                            <Form.Label>Quantity:</Form.Label>
                            <Form.Control type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                        </Form.Group>
                    </div>
                    <div className="col">
                        <Form.Group>
                            <Form.Label>Price:</Form.Label>
                            <Form.Control type="number" placeholder='0' value={price} onChange={(e) => setPrice(e.target.value)} />
                        </Form.Group>
                    </div>
                    <div className="col">
                        <Form.Group>
                            <Form.Label>Date:</Form.Label>
                            <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </Form.Group>
                    </div>
                    <div className="col-auto">
                        <Button className='buy' variant="success" onClick={openPosition}>Open</Button>
                    </div>
                </div>
            </Form>
        </div>
    );
}
