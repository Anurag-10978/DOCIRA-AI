import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import type { LoginRequest, RegisterRequest } from '../types';

export function useAuth() {
  const navigate = useNavigate();

  const { setAuth, clearAuth } = useAuthStore();

  const login = async (data: LoginRequest) => {
    const res = await authAPI.login(data);

    setAuth(res.data.user, res.data.access_token);

    navigate('/dashboard');
  };

  const register = async (data: RegisterRequest) => {
    const res = await authAPI.register(data);

    setAuth(res.data.user, res.data.access_token);

    navigate('/dashboard');
  };

  const logout = () => {
    clearAuth();

    navigate('/login');
  };

  return {
    login,
    register,
    logout,
  };
}