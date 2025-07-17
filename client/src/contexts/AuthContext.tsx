import { useIonRouter, useIonToast } from "@ionic/react";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ChangePasswordRequest,
  convertPDFModel,
  LoginRequest,
  RegisterRequest,
  SOAModel,
  UpdateProfileRequest,
  User,
} from "../models/user.model";
import api from "../services/api";
import { ListOfSOADetails } from "../interface/SOADetailsInterface";
import { AxiosResponse, AxiosError } from "axios";

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isLoading: () => boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: UpdateProfileRequest) => Promise<void>;
  changePassword: (passwordData: ChangePasswordRequest) => Promise<void>;
  isLoggedIn: () => boolean;
  isAdmin: () => boolean;
  uploadPDF: (payload: convertPDFModel) => Promise<ListOfSOADetails | null>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [present] = useIonToast();
  const router = useIonRouter();
  // Initialize auth state from localStorage on component mount
  const getToken = () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    return storedToken;
  };
  useEffect(() => {
    getToken();
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      present({
        message,
        duration: 3000,
        position: "bottom",
        color: type === "success" ? "success" : "danger",
      });
    },
    [present]
  );

  const login = async (credentials: LoginRequest) => {
    try {
      setError(null);

      const response = await api.post("/auth/login", credentials);
      const { user, firebaseCustomToken } = response.data.data;
      // Store auth data
      localStorage.setItem("token", firebaseCustomToken);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setToken(token);
      window.location.replace("/home");
      showToast(`Welcome back, ${user.username || user.email}!`);
    } catch (err: any) {
      console.log(err);
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setError(null);

      const response = await api.post("/auth/register", userData);
      const { user, token } = response.data.data;

      // Store auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setToken(token);

      showToast("Registration successful! Welcome to Pet Shop.");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
    }
  };

  const logout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Reset state
    setUser(null);
    setToken(null);

    showToast("You have been logged out.");
  };

  const updateProfile = async (userData: UpdateProfileRequest) => {
    try {
      setError(null);

      const response = await api.put<User>("/users/profile", userData);
      const updatedUser = response.data;

      // Update stored user data
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      showToast("Profile updated successfully.");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update profile.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
    }
  };

  const changePassword = async (passwordData: ChangePasswordRequest) => {
    try {
      setError(null);

      await api.put("/users/password", passwordData);

      showToast("Password updated successfully.");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update password.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
    }
  };

  const isLoggedIn = useCallback(() => {
    return !!user && !!token;
  }, [token, user]);
  const isLoading = useCallback(() => {
    return !!user && !!token ? false : true;
  }, [token, user]);
  const uploadPDF = async (
    payload: convertPDFModel
  ): Promise<ListOfSOADetails | null> => {
    // Changed return type to allow null on error
    try {
      setError(null); // Clear any previous errors

      const formData = new FormData();

      // Iterate over payload entries to append to FormData
      // Ensure 'file' is handled as a File object, others as strings
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) {
          // Only append if value is not undefined
          if (key === "file" && value instanceof File) {
            console.log(`Appending file: ${value.name}, type: ${value.type}`);
            formData.append(key, value, value.name); // formData.append(name, blob, filename);
          } else if (value !== null) {
            // Also check for null
            formData.append(key, String(value));
          }
        }
      });

      console.log("Sending PDF upload request...");
      const response: AxiosResponse<ListOfSOADetails> = await api.post(
        "/pdf/upload-pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // This header is crucial for FormData
          },
        }
      );

      console.log("PDF upload successful. Response:", response.data);
      showToast("PDF processed successfully!", "success"); // Show success toast
      return response.data; // Return the actual data from the response
    } catch (err: any) {
      // Catch block for error handling
      console.error("Error in uploadPDF:", err); // Log the full error for debugging

      let errorMessage: string;

      // Check if it's an Axios error (from the API)
      if (err.isAxiosError && err.response) {
        const axiosError = err as AxiosError; // Type assertion for better IntelliSense
        // Prioritize error message from backend if available
        errorMessage =
          (axiosError.response?.data as any)?.message ||
          (axiosError.response?.data as any)?.error || // Check for 'error' key too
          `API Error: ${axiosError.response!.statusText || "Unknown Status"}`;

        // Handle specific status codes if needed
        if (axiosError.response!.status === 401) {
          errorMessage = "Failed to unlock PDF. Please check the password.";
        } else if (axiosError.response!.status === 400) {
          errorMessage = "Invalid request. Missing file or password.";
        }
      } else if (err instanceof Error) {
        // General JavaScript error
        errorMessage = err.message;
      } else {
        // Fallback for unexpected error types
        errorMessage = "An unexpected error occurred during PDF upload.";
      }

      setError(errorMessage);
      showToast(errorMessage, "error");
      return null; // Return null on error as indicated by the new return type
    } finally {
      // Always set loading to false when the operation finishes
    }
  };
  const isAdmin = () => {
    return isLoggedIn() && user?.role === "admin";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isLoggedIn,
        isAdmin,
        uploadPDF,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
