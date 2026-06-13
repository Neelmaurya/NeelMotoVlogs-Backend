import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const baseQuery = fetchBaseQuery({
  baseUrl: typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || '/api/')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/'),
  prepareHeaders: (headers) => {
    const token = Cookies.get('access_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Blog', 'Video', 'Destination', 'Message', 'User'],
  endpoints: (builder) => ({}),
});
