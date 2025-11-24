import { Drawer, Box, Stack, Typography, IconButton, Divider, Button } from '@mui/material'
import CloseIcon from "@mui/icons-material/Close";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import React from 'react'
import Section from './Section'

export default function SearchDrawer({
    drawerOpen,
    setDrawerOpen,
    options,
    values,
    setValues,
    clearAll,
}: {
}) {
  return (
    <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: { xs: 300, sm: 360, }, p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Section title="Type" options={options.typeOptions} values={values.type} setValues={setValues.setType} />
          <Section title="Priority" options={options.priorityOptions} values={values.priority} setValues={setValues.setPriority} />
          <Section title="Status" options={options.statusOptions} values={values.status} setValues={setValues.setStatus} />
          <Section title="Technology" options={[]} values={values.technology} setValues={setValues.setTechnology} />

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
  )
}
