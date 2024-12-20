export default function PositionForm({ suggestions, enteredText, suggestionsClick, quantity, price, date, openPosition, setDate, setPrice, searchBarChange, setQuantity }) {
    return (
        <div className='portfolio-container'>
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
                    Quantity:
                    <br></br>
                    <input type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </label>
                <label>
                    Price:
                    <br></br>
                    <input type="number" placeholder='0' value={price} onChange={(e) => setPrice(e.target.value)} />
                </label>
                <label>
                    Date:
                    <br></br>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <button className='buy' onClick={openPosition}>Open</button>
            </form>
        </div>
    );
}
