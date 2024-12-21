import { Dropdown } from "react-bootstrap";


export default function Suggestions({ suggestions, suggestionsClick, id }) {
    return <Dropdown id={id}>
        {suggestions.length ? suggestions.map((suggestion, index) => (
            <Dropdown.Item key={index} onClick={() => suggestionsClick(suggestion.symbol)}>
                {suggestion.symbol} ({suggestion.name})
            </Dropdown.Item>
        )) : null}
    </Dropdown>;
}