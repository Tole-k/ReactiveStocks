

export function RebalancingRecommendations({ recommendations }) {
    return (
        <label>
            Rebalancing Recommendations:
            <ul>
                {recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                ))}
            </ul>
        </label>
    );
}
