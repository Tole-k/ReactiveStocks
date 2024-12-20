import { PieChart, Pie, Cell } from "recharts";

export default function PortfolioPieChart({ prepare_data, COLORS, label }) {
    return (
        <label>
            {label}
            <PieChart width={400} height={400}>
                <Pie
                    data={prepare_data()}
                    dataKey="value"
                    cx={200}
                    cy={200}
                    outerRadius={60}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${Math.round(10000 * value) / 100}%`}
                >
                    {prepare_data().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </PieChart>
        </label>
    );
}
