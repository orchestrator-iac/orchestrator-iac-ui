// services/auth.ts
import { ZodError, z } from "zod";

import {
  ImageUpdate,
  Login,
  Register,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UserProfile,
} from "../types/auth";
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
    await apiService.post("/user/register", register);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
};

export const getProfile = async (): Promise<UserProfile> => {
  const res = await apiService.get("/user/profile");
  return res;
};

export const uploadProfileImage = async (formData: ImageUpdate) => {
  const res = await apiService.put("/user/profile/image", formData);
  return res;
};

export const updatePassword = async (
  data: UpdatePasswordRequest,
): Promise<UpdatePasswordResponse> => {
  const response = await apiService.post("/user/update-password", data);
  return response.data;
};

export const refreshAccessToken = async (): Promise<string> => {
  const res = await apiService.post(
    "/user/refresh",
    {},
    { withCredentials: true, headers: { "Content-Type": "application/json" } },
  );
  return res.data.access_token as string;
};

export const loginWithGoogle = async (credential: string): Promise<string> => {
  const res = await apiService.post("/user/google-login", { credential });
  return res.access_token;
};
