import { IconButton, Stack, Tooltip } from '@mui/material'
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import RefreshIcon from "@mui/icons-material/Refresh";
import React from 'react'

export default function TaskToolbar({setDrawerOpen, clearAll, hasAnyFilter, tasksQuery, deleteMutation, selection}:any) {
  return (
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
  )
}
