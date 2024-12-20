import Change from "../utils/Change";

export default function PositionTable({ chosen_portfolio, positions, calculatePositionXirr, setSellAmount, setSellPrice, closePosition }) {
    return (
        <div className='tableWrap'>
            <table className='stock-table'>
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Volume</th>
                        <th>Purchase Value</th>
                        <th>Market Value</th>
                        <th>Avg Open Price</th>
                        <th>Market Price</th>
                        <th>Net Profit/Loss</th>
                        <th>Net P/L %</th>
                        <th>XIRR</th>
                        <th>Sell</th>
                    </tr>
                </thead>
                <tbody>
                    {chosen_portfolio != null && Array.isArray(positions) && positions.map((position, index) => (
                        <tr key={index} className='stock-item'>
                            <td>{position.stock.symbol}</td>
                            <td>{position.quantity}</td>
                            <td>{Math.round(position.average_price * position.quantity * 100) / 100}</td>
                            <td>{Math.round(position.stock.price * position.quantity * 100) / 100}</td>
                            <td>{Math.round(position.average_price * 100) / 100}</td>
                            <td>{position.stock.price}</td>
                            <td>
                                <Change data={(position.stock.price - position.average_price) * position.quantity}>
                                    {Math.round((position.stock.price - position.average_price) * position.quantity * 100) / 100}
                                </Change>
                            </td>
                            <td>
                                <Change data={((position.stock.price - position.average_price) * position.quantity) / (position.average_price * position.quantity)}>
                                    {Math.round(((position.stock.price - position.average_price) * position.quantity) / (position.average_price * position.quantity) * 10000) / 100}%
                                </Change>
                            </td>
                            <td>
                                <Change data={calculatePositionXirr(position)}>
                                    {Math.round(calculatePositionXirr(position) * 10000) / 100}%
                                </Change>
                            </td>
                            <td>
                                <div className="sell-inputs">
                                    <label>
                                        Price:
                                        <input type='number' placeholder='0' onChange={(e) => setSellPrice(e.target.value)} />
                                    </label>
                                    <label>
                                        Quantity:
                                        <input type='number' placeholder='0' onChange={(e) => setSellAmount(e.target.value)} />
                                    </label>
                                    <button className='sell' onClick={() => closePosition(position.id)}>Sell</button>
                                </div>

                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
