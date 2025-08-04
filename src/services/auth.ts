// services/auth.ts
import { Login, Register } from "../types/auth";
import { LoginSchema, RegisterSchema } from "../types/auth-schema";
import apiService from "./apiService";


export const loginUser = async (login: Login) => {
  try {
    LoginSchema.parse(login);
    const res = await apiService.post('/login', login);
    return res.data.token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
    throw error;
  }
};

export const registerUser = async (register: Register) => {
  try {
    RegisterSchema.parse(register);
    await apiService.post('/register', register);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
    throw error;
  }
  
};

export const getProfile = async (token: string) => {
  const res = await apiService.get('/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
