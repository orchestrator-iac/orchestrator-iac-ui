import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";

// Define the type of our context value
type DnDContextType = [
  string | null,
  React.Dispatch<React.SetStateAction<string | null>>,
];

// Create context with a proper default
const DnDContext = createContext<DnDContextType | undefined>(undefined);

export const DnDProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [id, setId] = useState<string | null>(null);

  // useMemo so the array reference doesn’t change every render
  const value = useMemo(() => [id, setId] as DnDContextType, [id]);

  return <DnDContext.Provider value={value}>{children}</DnDContext.Provider>;
};

export const useDnD = (): DnDContextType => {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error("useDnD must be used within a DnDProvider");
  }
  return context;
};

export default DnDContext;
