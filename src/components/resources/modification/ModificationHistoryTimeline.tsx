import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from "@mui/lab";
import VerifiedIcon from "@mui/icons-material/Verified";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import {
  loadUsersByIds,
  selectUsersMap,
  selectUsersLoadingAny,
} from "@/store/usersSlice";

export type ModifiedHistoryItem = {
  modifiedBy: string;
  modifiedAt: string;
  changeDescription: string;
};

export interface ModificationHistoryProps {
  history: ModifiedHistoryItem[];
  title?: string;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(d);
  } catch {
    return iso;
  }
}

export default function ModificationHistory({
  history,
  title = undefined,
}: Readonly<ModificationHistoryProps>) {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();

  const sorted = useMemo(
    () =>
      (history || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime(),
        ),
    [history],
  );

  const ids = useMemo(
    () => Array.from(new Set(sorted.map((h) => h.modifiedBy))),
    [sorted],
  );

  const usersMap = useSelector((s: RootState) => selectUsersMap(s));
  const loading = useSelector((s: RootState) => selectUsersLoadingAny(s, ids));

  useEffect(() => {
    if (!ids.length) return;
    const missing = ids.filter((id) => !usersMap[id]);
    if (missing.length) {
      dispatch(loadUsersByIds(missing));
    }
  }, [dispatch, ids, usersMap]);

  return (
    <Box>
      {title && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}

      {loading && (
        <Stack alignItems="center" sx={{ py: 3 }}>
          <CircularProgress size={24} />
        </Stack>
      )}

      {!loading && (
        <Timeline position="right" sx={{ m: 0, p: 0 }}>
          {sorted.map((item, idx) => {
            const u = usersMap[item.modifiedBy] || ({} as any);
            const primary =
              [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() ||
              `User ${String(item.modifiedBy).slice(0, 6)}…`;

            return (
              <TimelineItem
                key={`${item.modifiedBy}-${item.modifiedAt}-${idx}`}
                sx={{ "&:before": { display: "none" } }}
              >
                <TimelineSeparator>
                  <TimelineDot color="primary">
                    {u?.imageUrl ? (
                      <Avatar
                        src={u.imageUrl}
                        alt={primary}
                        sx={{ width: 28, height: 28 }}
                      />
                    ) : (
                      <LaptopMacIcon />
                    )}
                  </TimelineDot>
                  {idx < sorted.length - 1 && <TimelineConnector />}
                </TimelineSeparator>

                <TimelineContent sx={{ pl: 2 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.modifiedAt)}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2">{primary}</Typography>
                      <Tooltip title="Verified user">
                        <VerifiedIcon color="primary" fontSize="small" />
                      </Tooltip>
                    </Stack>
                    {u?.email && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {u.email}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.25,
                        color:
                          (theme as any).palette?.textVariants?.text4 ??
                          theme.palette.text.secondary,
                      }}
                    >
                      {item.changeDescription}
                    </Typography>
                  </Stack>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      )}

      {!loading && sorted.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No modifications yet.
        </Typography>
      )}
    </Box>
  );
}
