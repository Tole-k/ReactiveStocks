

export function AllocationForm({ enteredText, searchBarChange, suggestionsClick, setAllocation, allocation, add_allocation, suggestions }) {
    return (
        <label>
            Edit Portfolio
            <form className='portfolio-form'>
                <div>
                    <label>
                        Symbol:
                        <br></br>
                        <input type="text" placeholder="Stock Symbol..." value={enteredText} onChange={searchBarChange} />
                    </label>
                    <div className='dropdown' id='portfolio'>
                        {suggestions.length ? suggestions.map((suggestion, index) => (
                            <div key={index} className='dropdown-row' onClick={() => suggestionsClick(suggestion.symbol)}>{suggestion.symbol} ({suggestion.name})</div>
                        )) : null}
                    </div>
                </div>
                <label>
                    Allocation:
                    <br></br>
                    <input type="number" placeholder="0" value={allocation} onChange={(e) => setAllocation(e.target.value)} min={0.0} max={1.0} step={0.1} />
                </label>
                <button className='buy' onClick={add_allocation}>Set</button>
            </form>
        </label>
    );
}
