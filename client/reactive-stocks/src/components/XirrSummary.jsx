import Change from "../utils/Change";

export default function XirrSummary({ calculatePortfolioXirr, positions }) {
    return (
        <div>
            <label>
                Portfolio XIRR:
                <Change data={calculatePortfolioXirr(positions)}>
                    {Math.round(calculatePortfolioXirr(positions) * 10000) / 100}%
                </Change>
            </label>
        </div>
    );
}
