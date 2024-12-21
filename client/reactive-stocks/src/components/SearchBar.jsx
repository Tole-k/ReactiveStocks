import { Form, Button, InputGroup } from 'react-bootstrap';
import Suggestions from './Suggestions';

export default function SearchBar({ addStock, suggestions, enteredText, searchBarChange, suggestionsClick }) {
    return (
        <>
            <h1>Stock Browser</h1>
            <div className='search-container'>
                <InputGroup className='search-inner'>
                    <Form.Control type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                    <Button variant="success" onClick={addStock}>Follow</Button>
                </InputGroup>
                <Suggestions suggestions={suggestions} suggestionsClick={suggestionsClick} id='followed' />
            </div>
        </>
    );
}

