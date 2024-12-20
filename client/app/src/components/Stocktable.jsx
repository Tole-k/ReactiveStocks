import styled from "styled-components";

export default function StockTable({ stocks, removeStock }) {

    const Change = styled.p`color: ${(props) => props.data === 0 ? "white" : props.data > 0 ? "green" : "red"};
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center; /* Center vertically */
        height: 100%; /* Ensure it takes the full height of the cell */`;

    return (<div className='tableWrap'>
        <table className='stock-table'>
            <thead>
                <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Change</th>
                    <th>%Change</th>
                    <th>Volume</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {Array.isArray(stocks) && stocks.map((stock, index) => (
                    <tr key={index} className='stock-item'>
                        <td>{stock.symbol}</td>
                        <td>{stock.name}</td>
                        <td>{stock.price}</td>
                        <td>
                            <Change data={stock.change}>{stock.change}</Change>
                        </td>
                        <td>
                            <Change data={stock.changesPercentage}>{stock.changesPercentage}</Change>
                        </td>
                        <td>{stock.volume}</td>
                        <td>
                            <button className='sell' onClick={() => removeStock(stock.id)}>Unfollow</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>)
}