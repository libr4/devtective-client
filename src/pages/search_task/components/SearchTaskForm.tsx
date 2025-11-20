import * as React from "react";
import {
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Autocomplete,
  Chip,
  IconButton,
  Button,
  Divider,
  Drawer,
  Typography,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../../api/axios";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import Section from "./Section";
import useDebounced from "../hooks/useDebounced";
import { fromParams, toParams } from "../utils/utils";
import { fetchFilters, fetchTasks } from "../requests/queries";
import { FiltersDTO, TaskRow } from "../types/Task";
import TaskGrid from "./TaskGrid";
import { fetchTaskPriorities, fetchTaskStatus, fetchTaskTypes } from "../../common/queries";
import { ProjectMember } from "../../common/types";

// --- main page ---
export default function SearchTaskFormSecond() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const downLg = useMediaQuery("(max-width:1200px)");
  const downMd = useMediaQuery("(max-width:900px)");

  const initial = React.useMemo(() => fromParams(searchParams), [searchParams]);
  const [q, setQ] = React.useState(initial.q);
  const [assignedTo, setAssignedTo] = React.useState<ProjectMember[]>(initial.assignedTo);
  const [type, setType] = React.useState<string[]>(initial.type);
  const [priority, setPriority] = React.useState<string[]>(initial.priority);
  const [status, setStatus] = React.useState<string[]>(initial.status);
  const [technology, setTechnology] = React.useState<string[]>(initial.technology);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Selection for bulk actions
  const [selection, setSelection] = React.useState<number[]>([]);

  // Debounce text search for nicer UX
  const debouncedQ = useDebounced(q, 300);

  // Keep URL in sync when filters change
  React.useEffect(() => {
    const params = toParams({ q, assignedTo, type, priority, status, technology });
    setSearchParams(params, { replace: true });
  }, [q, assignedTo, type, priority, status, technology, setSearchParams]);


const params = {
        q: debouncedQ || undefined,
        assignedTo,
        type,
        priority,
        status,
        technology,
      };

  // Tasks query
  const tasksQuery = useQuery<TaskRow[]>({
    queryKey: [
      "project-tasks",
      projectId,
      params
    ],
    queryFn: async () => fetchTasks(projectId as string, params),
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });

  const membersQuery = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: async () => {
      const res = await api.get<ProjectMember[]>(`/api/v1/projects/${projectId}/members`, {
        withCredentials: true,
      });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) =>
      api.delete(`/api/v1/projects/${projectId}/tasks`, { withCredentials: true, data: ids }),
    onSuccess: () => {
      setSelection([]);
      tasksQuery.refetch();
    },
  });

  // In case lookups endpoint isn't available, derive member names from tasks once.
  const memberFallback = React.useMemo(() => {
    if (!tasksQuery.data) return [];
    const set = new Set<string>();
    tasksQuery.data.forEach((t) => (t.assignedToFullName ?? []).forEach((n) => set.add(n)));
    return Array.from(set).sort();
  }, [tasksQuery.data]);

  const staleTimeMs = 5 * 60_000;
  const {
    data: typeOptions,
    isLoading: typesLoading,
    error: typesError,
  } = useQuery({ queryKey: ["task-types"], queryFn: fetchTaskTypes, staleTime: staleTimeMs });

  const {
    data: priorityOptions,
    isLoading: prioritiesLoading,
    error: prioritiesError,
  } = useQuery({ queryKey: ["task-priorities"], queryFn: fetchTaskPriorities, staleTime: staleTimeMs });

  const {
    data: statusOptions,
    isLoading: statusLoading,
    error: statusError,
  } = useQuery({ queryKey: ["task-status"], queryFn: fetchTaskStatus, staleTime: staleTimeMs });

  // responsive visibility: hide some columns on narrower screens
  const columnVisibilityModel = React.useMemo(
    () => ({
      technology: !downMd, // hide on ≤900px
      type: !downMd,
      deadline: !downLg,   // hide on ≤1200px
    }),
    [downLg, downMd]
  );

  
  // Quick-chip helpers
  const clearAll = () => {
    setQ("");
    setAssignedTo([]);
    setType([]);
    setPriority([]);
    setStatus([]);
    setTechnology([]);
  };

  const hasAnyFilter =
    !!debouncedQ ||
    assignedTo.length ||
    type.length ||
    priority.length ||
    status.length ||
    technology.length;

  const selectedAssignees = React.useMemo(() => {
    const members = membersQuery.data || [];
    const map = new Map<string, ProjectMember>(); 
    members.forEach((m) => map.set(m.displayName, m));
    return assignedTo
      .map((name) => map.get(name))
      .filter((m): m is ProjectMember => m !== undefined);
  }, [membersQuery, assignedTo]); 

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* <Toolbar /> keeps content below AppBar */}
      <Container
        maxWidth="xl"
        sx={{ py: 0, px: { xs: 1, sm: 2 }, overflowX: "clip" }} // prevent page-level horizontal scroll
      >
        {/* Search + Assignees + Actions */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, width: "100%", overflow: "hidden" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            sx={{ width: "100%" }}
          >
            <TextField
              fullWidth
              size="small"
              label="Search tasks"
              placeholder="Title, description, #id…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Autocomplete
              multiple
              getOptionLabel={(option) => option.displayName || option.username || option.email || ""}
              options={(membersQuery.data || [])}
              value={assignedTo}
              onChange={(_, v) => setAssignedTo(v)}
              renderInput={(params) => <TextField {...params} size="small" label="Assignees" />}
              sx={{ minWidth: { xs: "100%", md: 260 }, flex: { xs: "1 1 auto", md: "0 0 260px" } }}
            />
            <Stack direction="row" spacing={1} sx={{ ml: { md: "auto" } }}>
              <Tooltip title="More filters">
                <IconButton onClick={() => setDrawerOpen(true)}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear all filters">
                <span>
                  <IconButton onClick={clearAll} disabled={!hasAnyFilter}>
                    <ClearAllIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={() => tasksQuery.refetch()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete selected">
                <span>
                  <IconButton
                    color="error"
                    onClick={() => deleteMutation.mutate(selection)}
                    disabled={selection.length === 0 || deleteMutation.isPending}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {/* Task Grid */}
        <TaskGrid 
          tasksQuery={tasksQuery} 
          columnVisibilityModel={columnVisibilityModel}
          projectId={projectId}
          navigate={navigate}
          selection={selection} 
          setSelection={setSelection} />
          {/* </TaskGrid> */}
        
      </Container>

      {/* Filters Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: { xs: 300, sm: 360, }, p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Section title="Type" options={typeOptions} values={type} setValues={setType} />
          <Section title="Priority" options={priorityOptions} values={priority} setValues={setPriority} />
          <Section title="Status" options={statusOptions} values={status} setValues={setStatus} />
          <Section title="Technology" options={[]} values={technology} setValues={setTechnology} />

          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={clearAll} startIcon={<ClearAllIcon />}>
              Clear
            </Button>
            <Button variant="contained" onClick={() => setDrawerOpen(false)}>
              Apply
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}