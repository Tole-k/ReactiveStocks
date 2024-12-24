import { ListGroup } from 'react-bootstrap';

export function RebalancingRecommendations({ recommendations }) {
    return (
        <div className="mt-3 p-3 border rounded">
            <label className="fw-bold fs-5 mb-2 d-block">
                Rebalancing Recommendations:
            </label>
            <ListGroup>
                {recommendations.map((recommendation, index) => (
                    <ListGroup.Item
                        key={index}
                        className={recommendation.startsWith("Buy") ? "text-success" : "text-danger"}
                    >
                        {recommendation}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </div>
    );
}
