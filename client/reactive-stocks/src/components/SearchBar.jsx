import { Form, Button, InputGroup, Dropdown } from 'react-bootstrap';

export default function SearchBar({ addStock, suggestions, enteredText, searchBarChange, suggestionsClick }) {
    return (
        <>
            <h1>Stock Browser</h1>
            <div className='search-container'>
                <InputGroup className='search-inner'>
                    <Form.Control type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                    <Button variant="success" onClick={addStock}>Follow</Button>
                </InputGroup>
                <Dropdown className='dropdown' id='followed'>
                    {suggestions.length ? suggestions.map((suggestion, index) => (
                        <Dropdown.Item key={index} onClick={() => suggestionsClick(suggestion.symbol)}>
                            {suggestion.symbol} ({suggestion.name})
                        </Dropdown.Item>
                    )) : null}
                </Dropdown>
            </div>
        </>
    );
}
