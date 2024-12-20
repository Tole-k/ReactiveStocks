import { Form, Button, InputGroup, Dropdown } from 'react-bootstrap';

export function AllocationForm({ enteredText, searchBarChange, suggestionsClick, setAllocation, allocation, add_allocation, suggestions }) {
    return (
        <Form.Label>
            Edit Portfolio
            <Form className='portfolio-form'>
                <div>
                    <Form.Group>
                        <Form.Label>Symbol:</Form.Label>
                        <Form.Control type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                        <Dropdown className='dropdown' id='portfolio'>
                            {suggestions.length ? suggestions.map((suggestion, index) => (
                                <Dropdown.Item key={index} onClick={() => suggestionsClick(suggestion.symbol)}>
                                    {suggestion.symbol} ({suggestion.name})
                                </Dropdown.Item>
                            )) : null}
                        </Dropdown>
                    </Form.Group>
                </div>
                <Form.Group>
                    <Form.Label>Allocation:</Form.Label>
                    <Form.Control type="number" placeholder="0" value={allocation} onChange={(e) => setAllocation(e.target.value)} min={0.0} max={1.0} step={0.1} />
                </Form.Group>
                <Button variant="success" onClick={add_allocation}>Set</Button>
            </Form>
        </Form.Label>
    );
}
