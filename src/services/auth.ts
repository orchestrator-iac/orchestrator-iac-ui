// services/auth.ts
import { ZodError, z } from "zod";
import axios from "axios";

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

// Safe base64 encoder for Unicode strings (avoids deprecated `unescape`).
const base64Encode = (s: string): string => {
  try {
    return btoa(
      encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
        String.fromCodePoint(Number.parseInt(p1, 16)),
      ),
    );
  } catch {
    return btoa(s);
  }
};

export const loginUser = async (login: Login) => {
  try {
    LoginSchema.parse(login);
    const payload = { email: login.email, password: base64Encode(login.password) };
    const res = await apiService.post(
      "/user/login",
      payload,
      { headers: { "X-Password-Encoding": "base64" } },
    );
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
    const payload = { ...register, password: base64Encode(register.password) };
    await apiService.post("/user/register", payload, { headers: { "X-Password-Encoding": "base64" } });
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
  const payload = { ...data, newPassword: base64Encode(data.newPassword) };
  const response = await apiService.post("/user/update-password", payload, { headers: { "X-Password-Encoding": "base64" } });
  return response as UpdatePasswordResponse;
};

export const refreshAccessToken = async (): Promise<string> => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/user/refresh`,
      {},
      { withCredentials: true, headers: { "Content-Type": "application/json" } },
    );
    return res.data?.access_token as string;
  } catch (err: any) {
    const status = err?.response?.status;
    const e = new Error(err?.message || "Refresh failed");
    (e as any).status = status;
    throw e;
  }
};

export const loginWithGoogle = async (credential: string): Promise<string> => {
  const res = await apiService.post("/user/google-login", { credential });
  return res.access_token;
};
