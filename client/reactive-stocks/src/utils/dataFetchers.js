import api from '../api';

export async function fetchPortfolios() {
    try {
        const response = await api.get("http://127.0.0.1:8000/piechart/");
        if (response.status === 204) {
            console.log("No portfolios found");
            return [];
        } else {
            return response.data;
        }
    } catch (error) {
        console.log(error);
        return [];
    }
}

export async function fetchPositions(chosen_portfolio) {
    if (chosen_portfolio) {
        try {
            const response = await api.get(`http://127.0.0.1:8000/portfolio/${chosen_portfolio.id}/`);
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.log(error);
        }
    }
    return [];
}
