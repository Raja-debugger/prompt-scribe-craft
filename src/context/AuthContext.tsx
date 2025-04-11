
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate login API call
    try {
      // Check if user exists in localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error("Invalid credentials");
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      return true;
    } catch (error) {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate register API call
    try {
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      if (users.some((u: any) => u.email === email)) {
        throw new Error("User already exists");
      }
      
      const newUser = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        email,
        password
      };
      
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
