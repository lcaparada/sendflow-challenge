import { Box, Tab, Tabs } from "@mui/material";

export type FilterTab = "all" | "scheduled" | "sent";

const FILTER_OPTIONS: FilterTab[] = ["all", "scheduled", "sent"];

const FILTER_TAB_LABELS: Record<FilterTab, string> = {
  all: "Todas",
  scheduled: "Agendadas",
  sent: "Enviadas",
};

interface TabsMessagesFilterProps {
  filter: FilterTab;
  onSelectFilter(filter: FilterTab): void;
}

export function TabsMessagesFilter(props: TabsMessagesFilterProps) {
  const { filter, onSelectFilter } = props;

  return (
    <Box sx={{ mb: 4, borderBottom: "1px solid #f0f0f0" }}>
      <Tabs
        value={filter}
        onChange={(_, v) => onSelectFilter(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: 14,
            minHeight: 44,
          },
          "& .Mui-selected": { color: "#6366f1" },
          "& .MuiTabs-indicator": {
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            height: 3,
            borderRadius: 2,
          },
        }}
      >
        {FILTER_OPTIONS.map((tab) => (
          <Tab key={tab} value={tab} label={FILTER_TAB_LABELS[tab]} />
        ))}
      </Tabs>
    </Box>
  );
}
