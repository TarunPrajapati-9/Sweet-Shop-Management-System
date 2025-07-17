import { useState, useEffect } from "react";

export const useOwnerAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated in this session
    const sessionAuth = sessionStorage.getItem("ownerAuthenticated");
    if (sessionAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const authenticate = (inputPassword: string) => {
    const correctPassword = process.env.NEXT_PUBLIC_OWNER_PASSWORD;

    if (inputPassword === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("ownerAuthenticated", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPassword("");
    sessionStorage.removeItem("ownerAuthenticated");
  };

  return {
    isAuthenticated,
    password,
    setPassword,
    isLoading,
    authenticate,
    logout,
  };
};
