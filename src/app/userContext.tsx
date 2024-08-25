"use client"
import { createContext, useState, ReactNode, FC } from 'react';
import { usersProfile } from './components/interface';

interface UserContextType {
  userData: any; // or specify the type of userData
  setUserData: (userData: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<usersProfile | null>(null);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
