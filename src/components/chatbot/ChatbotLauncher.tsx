import React from "react";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import { IoMdClose } from "react-icons/io";

import { useChatLayout } from "@/context/ChatLayoutContext";
import { useAppSelector } from "@/store/hooks";
import MaestroRobot from "./MaestroRobot";
import styles from "./Maestro.module.css";

interface ChatbotLauncherProps {
  openChat: boolean;
  onToggle: () => void;
}

const ChatbotLauncher: React.FC<ChatbotLauncherProps> = ({
  openChat,
  onToggle,
}) => {
  const theme = useTheme();
  const { isSplitView } = useChatLayout();
  const isSending = useAppSelector((state) => state.chat.isSending);
  const dark = theme.palette.mode === "dark";

  if (isSplitView) return null;

  const robotColor = dark ? theme.palette.secondary.light : undefined;
  const robotState = isSending ? "thinking" : "idle";

  return (
    <Box className={styles.launcher}>
      <Tooltip title={openChat ? "Close Maestro" : "Open Maestro"}>
        <IconButton
          className={styles.launcherButton}
          aria-label={openChat ? "Close Maestro" : "Open Maestro"}
          color="primary"
          onClick={onToggle}
          size="large"
          sx={{
            bgcolor: "background.paper",
            boxShadow: 4,
            "&:hover": { boxShadow: 6 },
          }}
        >
          {openChat ? (
            <IoMdClose size={36} />
          ) : (
            <MaestroRobot
              state={robotState}
              size={36}
              decorative
              robotColor={robotColor}
            />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ChatbotLauncher;
