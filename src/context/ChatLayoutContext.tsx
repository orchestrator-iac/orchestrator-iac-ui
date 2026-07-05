import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "maestro.splitWidth";
const MIN_WIDTH = 320;
const MAX_WIDTH_VW = 0.7;
const DEFAULT_WIDTH = 420;

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const maxWidthForViewport = () => window.innerWidth * MAX_WIDTH_VW;

interface ChatLayoutContextType {
  isSplitView: boolean;
  toggleSplitView: () => void;
  setSplitView: (value: boolean) => void;
  splitWidth: number;
  setSplitWidth: (width: number) => void;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
}

const ChatLayoutContext = createContext<ChatLayoutContextType | undefined>(
  undefined,
);

export const ChatLayoutProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSplitView, setIsSplitView] = useState(false);
  const [splitWidth, setSplitWidthState] = useState<number>(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (!Number.isFinite(stored) || stored <= 0) return DEFAULT_WIDTH;
    return clamp(stored, MIN_WIDTH, maxWidthForViewport());
  });
  const [isDragging, setIsDragging] = useState(false);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const setSplitWidth = useCallback((width: number) => {
    const clamped = clamp(width, MIN_WIDTH, maxWidthForViewport());
    setSplitWidthState(clamped);
    clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, String(clamped));
    }, 300);
  }, []);

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setSplitWidthState((w) => clamp(w, MIN_WIDTH, maxWidthForViewport()));
      }, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  const toggleSplitView = useCallback(() => setIsSplitView((v) => !v), []);
  const setSplitView = useCallback((value: boolean) => setIsSplitView(value), []);

  const value = useMemo<ChatLayoutContextType>(
    () => ({
      isSplitView,
      toggleSplitView,
      setSplitView,
      splitWidth,
      setSplitWidth,
      isDragging,
      setIsDragging,
    }),
    [isSplitView, toggleSplitView, setSplitView, splitWidth, setSplitWidth, isDragging],
  );

  return (
    <ChatLayoutContext.Provider value={value}>
      {children}
    </ChatLayoutContext.Provider>
  );
};

export const useChatLayout = (): ChatLayoutContextType => {
  const ctx = useContext(ChatLayoutContext);
  if (!ctx) {
    throw new Error("useChatLayout must be used within a ChatLayoutProvider");
  }
  return ctx;
};
