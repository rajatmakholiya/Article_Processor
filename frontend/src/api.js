import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const getArticles = async () => {
    const response = await axios.get(`${API_URL}/articles`);
    return response.data;
};

export const getArticle = async (id) => {
    const response = await axios.get(`${API_URL}/articles/${id}`);
    return response.data;
};