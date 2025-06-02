"use client";
import React, { useState } from "react";
import { AppContext } from "./app-context";

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: "1",
    firstName: "Peace",
    lastName: "Ishimwe",
    email: "peaceishimwem@gmail.com",
    isVerified: false,
    role: "Admin",
    status: "ENABLED",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
