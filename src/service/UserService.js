/* eslint-disable no-useless-catch */
import store from '@/store';
import axios from 'axios';
const APIUrl = import.meta.env.VITE_PUBLIC_API_URL;

export const getUsers = async () => {
    try {
        const res = await axios.get(`${APIUrl}/user/list-user`, {
            headers: { Authorization: `Bearer ${store.state.accessToken}` }
        });
        return res.data;
    } catch (error) {
        throw error;
    }
};
