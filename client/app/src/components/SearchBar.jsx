export default function SearchBar({ addStock, suggestions, enteredText, searchBarChange, suggestionsClick }) {
    return (<>
        <h1>Stock Browser</h1>
        <div className='search-container'>
            <div className='search-inner'>
                <input type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                <button className='follow' onClick={addStock}>Follow</button>
            </div>
            <div className='dropdown' id='followed'>
                {suggestions.length ? suggestions.map((suggestion, index) => (
                    <div key={index} className='dropdown-row' onClick={() => suggestionsClick(suggestion.symbol)}>{suggestion.symbol} ({suggestion.name})</div>
                )) : null}
            </div>
        </div>
    </>);
}
