// services/auth.ts
import { ZodError, z } from "zod";

import { Login, Register, UserProfile } from "../types/auth";
import { LoginSchema, RegisterSchema } from "../types/auth-schema";
import apiService from "./apiService";


export const loginUser = async (login: Login) => {
  try {
    LoginSchema.parse(login);
    const res = await apiService.post("/user/login", login);
    return res.access_token;
  } catch (error: any) {
    if (error instanceof ZodError) {
      const validationError = new Error("Validation error");

      Object.assign(validationError, {
        type: "validation",
        errors: z.treeifyError(error),
      });

      throw validationError;
    }

    if (error instanceof Error) {
      const apiError = new Error("API error");

      Object.assign(apiError, {
        type: "api",
        status: (error as any)?.response?.status,
        message: error.message,
      });

      throw apiError;
    }

    const unknownError = new Error("Unknown error");
    Object.assign(unknownError, {
      type: "unknown",
      error,
    });
    throw unknownError;
  }
};

export const registerUser = async (register: Register) => {
  try {
    RegisterSchema.parse(register);
    await apiService.post('/user/register', register);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
      throw new Error(error.message);
    }
    throw error;
  }
  
};

export const getProfile = async (token: string): Promise<UserProfile> => {
  const res = await apiService.get("/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};
