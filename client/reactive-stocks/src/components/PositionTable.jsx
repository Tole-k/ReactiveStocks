import Change from "../utils/Change";
import { Table, Form, Button } from "react-bootstrap";

export default function PositionTable({ chosen_portfolio, positions, calculatePositionXirr, setSellAmount, setSellPrice, closePosition }) {
    return (
        <div className='tableWrap'>
            <Table striped bordered hover className='stock-table'>
                <thead>
                    <tr>
                        <th className="text-center align-middle">Symbol</th>
                        <th className="text-center align-middle">Volume</th>
                        <th className="text-center align-middle">Purchase Value</th>
                        <th className="text-center align-middle">Market Value</th>
                        <th className="text-center align-middle">Avg Open Price</th>
                        <th className="text-center align-middle">Market Price</th>
                        <th className="text-center align-middle">Net Profit/Loss</th>
                        <th className="text-center align-middle">Net P/L %</th>
                        <th className="text-center align-middle">XIRR</th>
                        <th className="text-center align-middle sell-col">Sell</th>
                    </tr>
                </thead>
                <tbody>
                    {chosen_portfolio != null && Array.isArray(positions) && positions.map((position, index) => (
                        <tr key={index} className="stock-item">
                            <td className="text-center align-middle">{position.stock.symbol}</td>
                            <td className="text-center align-middle">{position.quantity}</td>
                            <td className="text-center align-middle">
                                {Math.round(position.average_price * position.quantity * 100) / 100}
                            </td>
                            <td className="text-center align-middle">
                                {Math.round(position.stock.price * position.quantity * 100) / 100}
                            </td>
                            <td className="text-center align-middle">
                                {Math.round(position.average_price * 100) / 100}
                            </td>
                            <td className="text-center align-middle">{position.stock.price}</td>
                            <td className="text-center align-middle">
                                <Change data={(position.stock.price - position.average_price) * position.quantity}>
                                    {Math.round((position.stock.price - position.average_price) * position.quantity * 100) / 100}
                                </Change>
                            </td>
                            <td className="text-center align-middle">
                                <Change data={((position.stock.price - position.average_price) * position.quantity) / (position.average_price * position.quantity)}>
                                    {Math.round(((position.stock.price - position.average_price) * position.quantity) / (position.average_price * position.quantity) * 10000) / 100}%
                                </Change>
                            </td>
                            <td className="text-center align-middle">
                                <Change data={calculatePositionXirr(position)}>
                                    {Math.round(calculatePositionXirr(position) * 10000) / 100}%
                                </Change>
                            </td>
                            <td className="sell-col">
                                <div className="sell-inputs">
                                    <Form.Group className="sell-input-group">
                                        <Form.Label>Price:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            onChange={(e) => setSellPrice(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group className="sell-input-group">
                                        <Form.Label>Quantity:</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="0"
                                            onChange={(e) => setSellAmount(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Button
                                        variant="danger"
                                        className="sell"
                                        onClick={() => closePosition(position.id)}
                                    >
                                        Sell
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}