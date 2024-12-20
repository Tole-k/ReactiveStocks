import axios from '../axiosConfig';

export async function fetchPortfolios(accessToken) {
    try {
        const response = await axios.get("http://127.0.0.1:8000/piechart/", {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
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

export async function fetchPositions(accessToken, chosen_portfolio) {
    if (chosen_portfolio) {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/portfolio/${chosen_portfolio.id}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error) {
            console.log(error);
        }
    }
    return [];
}

export async function fetchSuggestions(symbol, accessToken, setSuggestions) {
    if (symbol !== "") {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/follow/suggestions/${symbol}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setSuggestions(response.data);
        } catch (error) {
            console.log(error);
        }
    }
}
