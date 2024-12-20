import Dropdown from 'react-bootstrap/Dropdown';

export default function PortfolioSelector({ chosen_portfolio, portfolios, create_new_portfolio, choose_portfolio }) {
    return (
        <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
                {chosen_portfolio ? chosen_portfolio.name : "Select Portfolio"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {portfolios.map((portfolio, index) => (
                    <Dropdown.Item key={index} onClick={() => choose_portfolio(portfolio)}>
                        {portfolio.name}
                    </Dropdown.Item>
                ))}
                {create_new_portfolio &&
                    <Dropdown.Item onClick={create_new_portfolio}>Create New Portfolio</Dropdown.Item>
                }
            </Dropdown.Menu>
        </Dropdown>
    )
}