import Change from "../utils/Change"
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
export default function StockTable({ stocks, removeStock }) {
    return (
        <div className='tableWrap'>
            <Table striped bordered hover responsive className='stock-table'>
                <thead>
                    <tr>
                        <th className="text-center align-middle">Symbol</th>
                        <th className="text-center align-middle">Name</th>
                        <th className="text-center align-middle">Price</th>
                        <th className="text-center align-middle">Change</th>
                        <th className="text-center align-middle">%Change</th>
                        <th className="text-center align-middle">Volume</th>
                        <th className="text-center align-middle">Actions</th>
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
                                <Button variant="danger" className='sell' onClick={() => removeStock(stock.id)}>Unfollow</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    )
}