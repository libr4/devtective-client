import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useEffect, useState } from 'react';
import TablePagination from '@mui/material/TablePagination';
import { useAppContext } from '../context/AppProvider';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress } from '@mui/material';

function createData(name, status, type, priority, date, price) {
  return {
    name,
    status,
    type,
    priority,
    date,
    price,
    history: [
      {
        date: '2020-01-05',
        customerId: '11091700',
        amount: 3,
      },
      {
        date: '2020-01-02',
        customerId: 'Anonymous',
        amount: 1,
      },
    ],
  };
}

// function prepareTaskActivities(arr) {
//   const changesInTask: Partial<ITask> = changesArray.reduce((acc, change) => {
//     acc[change.field] = change.newValue;
//     return acc;
// }, {} as Partial<ITask>);
// }

function Row(props) {
  const { row, author, changes, currentTask } = props;
  const [open, setOpen] = React.useState(false);
  console.log(row.changes.filter((e) => {return e.field === 'priority'})[0].newValue)
  const cellContent = {
    status:row.changes.filter((e) => {return e.field === 'status'})[0],
    type:row.changes.filter((e) => {return e.field === 'type'})[0],
    priority:row.changes.filter((e) => {return e.field === 'priority'})[0],
    assignedTo:row.changes.filter((e) => {return e.field === 'assignedTo'})[0],
  }

  return (
    <React.Fragment>
      <TableRow 
        sx={{ 
          '& > *': { borderBottom: 'unset' } 
        }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.author}
        </TableCell>
        <TableCell align="right">{cellContent?.status?.newValue || currentTask.status}</TableCell>
        <TableCell align="right">{cellContent?.priority?.newValue || currentTask.priority}</TableCell>
        <TableCell align="right">{cellContent?.type?.newValue || currentTask.type}</TableCell>
        <TableCell align="right">{cellContent?.assignedTo?.newValue || currentTask.assignedTo}</TableCell>
        <TableCell align="right">{new Date(row.createdAt).toLocaleDateString('pt-br') || new Date(currentTask.createdAt).toLocaleDateString('pt-br')}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Nota
              </Typography>
              <Typography gutterBottom component="div">
                {row.note}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// const rows = [
//   createData('Jonas Pereira', 159, 6.0, 24, 4.0, 3.99),
//   createData('Ice cream sandwich', 237, 9.0, 37, 4.3, 4.99),
//   createData('Eclair', 262, 16.0, 24, 6.0, 3.79),
//   createData('Cupcake', 305, 3.7, 67, 4.3, 2.5),
//   createData('Gingerbread', 356, 16.0, 49, 3.9, 1.5),
  // createData('Gingerbread', 356, 16.0, 49, 3.9, 1.5),
  // createData('Gingerbread', 356, 16.0, 49, 3.9, 1.5),
// ];

export default function CollapsibleTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const {currentScreen, setCurrentScreen, currentTask} = useAppContext();

  const {projectId, taskId} = useParams();
  const allActivitiesQuery = useQuery({
    queryKey:[`get_all_activities_${projectId}_${taskId}`] ,
    queryFn: async () => {
      const response = await axios.get(`/api/v1/projects/${projectId}/tasks/${currentTask._id}/updates`)
      return response.data;
    }
  })

  const rows = allActivitiesQuery.data || [];
  rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  console.log(rows)

  useEffect(() => {
    if (currentScreen !== 'tasks')
      setCurrentScreen('tasks')
  }, [currentScreen])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  if (allActivitiesQuery.isLoading) {
    return <CircularProgress></CircularProgress>
  }
  console.log("allActivitiesQuery", allActivitiesQuery.data)
  return (
    <Box sx={{ 
      width:'80vw', 
      // maxHeight:'50vh',
      height:'100vh',
    }}>
        
      <TableContainer component={Paper}>
        <Table 
          // sx={{tableLayout:'fixed'}} 
          aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              {/* <TableCell>39435</TableCell> */}
              <TableCell align='left'>Autor</TableCell>
              <TableCell align='right'>Fase</TableCell>
              <TableCell align="right">Prioridade</TableCell>
              <TableCell align="right">Tipo</TableCell>
              <TableCell align="right">Atribuído para</TableCell>
              <TableCell align="right">Data de Modificação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{height:'50px'}}>
            {rows.map((row) => {
              console.log(row.note)
              return <Row key={row.name} author={row.author} createdAt={row.createdAt} currentTask={currentTask} changes={row.changes} row={row} />
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
    </Box>
  );
}