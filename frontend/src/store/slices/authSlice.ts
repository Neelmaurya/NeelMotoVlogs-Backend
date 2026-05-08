import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_image?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get('access_token') || null,
  isAuthenticated: !!Cookies.get('access_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; access: string; refresh: string }>
    ) => {
      const { user, access, refresh } = action.payload;
      state.user = user;
      state.token = access;
      state.isAuthenticated = true;
      
      // Store in cookies instead of localStorage
      Cookies.set('access_token', access, { expires: 7, secure: true, sameSite: 'strict' });
      Cookies.set('refresh_token', refresh, { expires: 30, secure: true, sameSite: 'strict' });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Remove from cookies
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    }
  },
});

export const { setCredentials, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
