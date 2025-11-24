import { Paper, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { UseQueryResult } from "@tanstack/react-query";
import { TaskRow } from "../types/Task";
import { NavigateFunction } from "react-router-dom";

type TaskGridProps = {
  tasksQuery: UseQueryResult<TaskRow[], Error>;
  columnVisibilityModel: any;
  selection: number[];
  setSelection:React.Dispatch<React.SetStateAction<number[]>>
  projectId: string | undefined;
  navigate: NavigateFunction;
}


export default function TaskGrid({ tasksQuery, columnVisibilityModel, 
        setSelection, selection, projectId, navigate }:TaskGridProps
) {

    const columns: GridColDef[] = [
    { field: "taskNumber", headerName: "ID", width: 90 },
    { field: "title", headerName: "Título", flex: 1, minWidth: 220 },
    { field: "status", headerName: "Status", minWidth: 110, flex: 0.4 },
    { field: "priority", headerName: "Prioridade", minWidth: 110, flex: 0.4 },
    { field: "type", headerName: "Tipo", minWidth: 120, flex: 0.5 },
    { field: "technology", headerName: "Tech", minWidth: 120, flex: 0.6 },
    {
        field: "assignedToFullName",
        headerName: "Atribuido para",
        flex: 1,
        sortable: false,
        filterable: false,
        // renderCell: (params) => {
        // const list = Array.isArray(params.row?.assignedTo) ? params.row.assignedTo : [];
        // const text = list.join(", ");
        // return (
        //     <Typography variant="body2" noWrap sx={{ maxWidth: "100%" }} title={text}>
        //     {text}
        //     </Typography>
        // );
        // },
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
    
    return (
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
    );
}