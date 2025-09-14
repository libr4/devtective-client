// src/routes/ProjectTasksPage.tsx
import * as React from "react";
import {
  Box,
  Toolbar,
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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import { useAppContext } from "../context/AppProvider";

type TaskRow = {
  id: number;                // maps to taskNumber for DataGrid
  taskNumber: number;
  title: string;
  description: string;
  priority?: string;
  status?: string;
  type?: string;
  technology?: string;
  deadline?: string;         // ISO
  assignedTo?: string[];     // names
};

type FiltersDTO = {
  types: string[];
  priorities: string[];
  statuses: string[];
  technologies: string[];
  members: string[]; // display names
};

// --- small utils ---
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

function fromParams(params: URLSearchParams) {
  const getAll = (k: string) => params.getAll(k);
  return {
    q: params.get("q") ?? "",
    assignedTo: getAll("assignedTo"),
    type: getAll("type"),
    priority: getAll("priority"),
    status: getAll("status"),
    technology: getAll("technology"),
  };
}

function toParams(obj: Record<string, string[] | string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (typeof v === "string" && v.trim()) sp.set(k, v);
    if (Array.isArray(v)) v.forEach((x) => x && sp.append(k, x));
  });
  return sp;
}

// --- main page ---
export default function SearchTaskFormSecond() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  // const {state} = location;
  // const preservedState = React.useRef(state);
  const {currentProject, setCurrentProject} = useAppContext();
  // if (!currentProject) {
    // setCurrentProject(preservedState.current?.project);
  // }
  // console.log("CURRENT PROJECT:", currentProject);

  // responsive helpers for column visibility
  const downLg = useMediaQuery("(max-width:1200px)");
  const downMd = useMediaQuery("(max-width:900px)");

  // Local filter state (mirrored to URL)
  const initial = React.useMemo(() => fromParams(searchParams), [searchParams]);
  const [q, setQ] = React.useState(initial.q);
  const [assignedTo, setAssignedTo] = React.useState<string[]>(initial.assignedTo);
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

  // Lookups
  const filtersQuery = useQuery<FiltersDTO>({
    queryKey: ["project-filters", projectId],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/projects/${projectId}/filters`, { withCredentials: true });
      return res.data;
    },
    retry: 0,
  });

  // Tasks query
  const tasksQuery = useQuery<TaskRow[]>({
    queryKey: [
      "project-tasks",
      projectId,
      { q: debouncedQ, assignedTo, type, priority, status, technology },
    ],
    queryFn: async () => {
      const res = await axios.get(`/api/v1/projects/${projectId}/tasks`, {
        withCredentials: true,
        params: {
          q: debouncedQ || undefined,
          assignedTo,
          type,
          priority,
          status,
          technology,
        },
      });
      // Normalize rows for DataGrid
      const rows: TaskRow[] = (Array.isArray(res.data) ? res.data : [])
        .filter(Boolean)
        .map((t: any) => ({
          id: Number(t.taskNumber ?? t.id),
          taskNumber: Number(t.taskNumber ?? t.id),
          title: t.title ?? "",
          description: t.description ?? "",
          priority: t.priority ?? "",
          status: t.status ?? "",
          type: t.type ?? "",
          technology: t.technology ?? "",
          deadline: t.deadline ?? null,
          assignedTo: Array.isArray(t.assignedTo)
            ? t.assignedTo
            : Array.isArray(t.members)
            ? t.members
            : Array.isArray(t.workerNames)
            ? t.workerNames
            : [],
        }));
      return rows;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) =>
      axios.delete(`/api/v1/projects/${projectId}/tasks`, { withCredentials: true, data: ids }),
    onSuccess: () => {
      setSelection([]);
      tasksQuery.refetch();
    },
  });

  // In case lookups endpoint isn't available, derive member names from tasks once.
  const memberFallback = React.useMemo(() => {
    if (!tasksQuery.data) return [];
    const set = new Set<string>();
    tasksQuery.data.forEach((t) => (t.assignedTo ?? []).forEach((n) => set.add(n)));
    return Array.from(set).sort();
  }, [tasksQuery.data]);

  const lookup = {
    types: filtersQuery.data?.types ?? [],
    priorities: filtersQuery.data?.priorities ?? [],
    statuses: filtersQuery.data?.statuses ?? [],
    technologies: filtersQuery.data?.technologies ?? [],
    members: filtersQuery.data?.members ?? memberFallback,
  };

  // responsive visibility: hide some columns on narrower screens
  const columnVisibilityModel = React.useMemo(
    () => ({
      technology: !downMd, // hide on ≤900px
      type: !downMd,
      deadline: !downLg,   // hide on ≤1200px
    }),
    [downLg, downMd]
  );

  // Safer, responsive columns (use flex + minWidth; truncate long cells)
  const columns: GridColDef[] = [
    { field: "taskNumber", headerName: "ID", width: 90 },
    { field: "title", headerName: "Título", flex: 1, minWidth: 220 },
    { field: "status", headerName: "Status", minWidth: 110, flex: 0.4 },
    { field: "priority", headerName: "Prioridade", minWidth: 110, flex: 0.4 },
    { field: "type", headerName: "Tipo", minWidth: 120, flex: 0.5 },
    { field: "technology", headerName: "Tech", minWidth: 120, flex: 0.6 },
    {
      field: "assignedTo",
      headerName: "Atribuido para",
      flex: 1,
      // minWidth: 180,
      // width: '100%',
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const list = Array.isArray(params.row?.assignedTo) ? params.row.assignedTo : [];
        const text = list.join(", ");
        return (
          <Typography variant="body2" noWrap sx={{ maxWidth: "100%" }} title={text}>
            {text}
          </Typography>
        );
      },
    },
    {
      field: "deadline",
      headerName: "Deadline",
      minWidth: 100,
      flex: 0.5,
      valueFormatter: (params: any) => {
        const val = params?.value ?? params?.row?.deadline;
        if (!val) return "";
        const d = new Date(String(val));
        return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
      },
    },
  ];

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
              options={lookup.members}
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

          {/* Active filter chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
            {q && (
              <Chip label={`q: ${q}`} onDelete={() => setQ("")} size="small" variant="outlined" />
            )}
            {assignedTo.map((n) => (
              <Chip
                key={`a-${n}`}
                label={`assignee: ${n}`}
                onDelete={() => setAssignedTo(assignedTo.filter((x) => x !== n))}
                size="small"
              />
            ))}
            {type.map((v) => (
              <Chip
                key={`t-${v}`}
                label={`type: ${v}`}
                onDelete={() => setType(type.filter((x) => x !== v))}
                size="small"
              />
            ))}
            {priority.map((v) => (
              <Chip
                key={`p-${v}`}
                label={`priority: ${v}`}
                onDelete={() => setPriority(priority.filter((x) => x !== v))}
                size="small"
              />
            ))}
            {status.map((v) => (
              <Chip
                key={`s-${v}`}
                label={`status: ${v}`}
                onDelete={() => setStatus(status.filter((x) => x !== v))}
                size="small"
              />
            ))}
            {technology.map((v) => (
              <Chip
                key={`tec-${v}`}
                label={`tech: ${v}`}
                onDelete={() => setTechnology(technology.filter((x) => x !== v))}
                size="small"
              />
            ))}
          </Stack>
        </Paper>

        {/* Task Grid */}
        <Paper
          variant="outlined"
          sx={{ height: "calc(100vh - 280px)", minHeight: 420, width: "100%", overflow: "hidden" }}
        >
          <DataGrid
            rows={tasksQuery.data ?? []}
            getRowId={(row) => Number(row.taskNumber ?? row.id)} // <= guarantees an id
            columns={columns}
            columnVisibilityModel={columnVisibilityModel}
            checkboxSelection
            disableRowSelectionOnClick
            loading={tasksQuery.isLoading}
            onRowSelectionModelChange={(m) => setSelection(m as number[])}
            rowSelectionModel={selection}
            pagination
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 25 } },
              sorting: { sortModel: [{ field: "taskNumber", sort: "asc" }] },
            }}
            
            onRowClick={(params, event) => {
              console.log("params:",params)
              const target = event.target as HTMLElement;
              if (target.closest(".MuiCheckbox-root")) return; // don't navigate on checkbox click
              navigate(`/${projectId}/task/${params.row.taskNumber}`, { state: params.row });
            }}
            sx={{
              width: "100%",
              "& .MuiDataGrid-virtualScroller": { overflowX: "hidden" }, // keep inner scroller contained
              "& .MuiDataGrid-row:hover": { cursor: "pointer" },
            }}
          />
        </Paper>
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

          <Section title="Type" options={lookup.types} values={type} setValues={setType} />
          <Section title="Priority" options={lookup.priorities} values={priority} setValues={setPriority} />
          <Section title="Status" options={lookup.statuses} values={status} setValues={setStatus} />
          <Section title="Technology" options={lookup.technologies} values={technology} setValues={setTechnology} />

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

// Generic checkbox section used inside the drawer
function Section({
  title,
  options,
  values,
  setValues,
}: {
  title: string;
  options: string[];
  values: string[];
  setValues: (v: string[]) => void;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ p: 1 }}>
        <FormGroup>
          {options.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              No options
            </Typography>
          )}
          {options.map((opt) => {
            const checked = values.includes(opt);
            return (
              <FormControlLabel
                key={opt}
                control={
                  <Checkbox
                    size="small"
                    checked={checked}
                    onChange={(e) =>
                      setValues(e.target.checked ? [...values, opt] : values.filter((x) => x !== opt))
                    }
                  />
                }
                label={<Typography variant="body2">{opt}</Typography>}
              />
            );
          })}
        </FormGroup>
      </Paper>
    </Box>
  );
}
