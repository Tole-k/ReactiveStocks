import { Form, Button, Row, Col, Dropdown } from 'react-bootstrap';

export function AllocationForm({
    enteredText,
    searchBarChange,
    setAllocation,
    allocation,
    add_allocation,
}) {
    return (
        <div className='portfolio-form'>
            <Row className="mb-3">
                <Form>
                    <Row className="mb-3 justify-content-center h5">
                        Edit Portfolio
                    </Row>
                    <Row className="mb-3 align-items-end">
                        <Col md={4} sm={12}>
                            <Form.Group controlId="formSymbol">
                                <Form.Label>Symbol:</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Stock Symbol..."
                                    value={enteredText}
                                    onChange={searchBarChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4} sm={12}>
                            <Form.Group controlId="formAllocation">
                                <Form.Label>Allocation:</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="0"
                                    value={allocation}
                                    onChange={(e) => setAllocation(e.target.value)}
                                    min={0.0}
                                    max={1.0}
                                    step={0.1}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={4} sm={12} className="d-flex align-items-end">
                            <Button
                                variant="success"
                                onClick={add_allocation}
                                className='w-100'
                            >
                                Set
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Row>
        </div>
    );
}