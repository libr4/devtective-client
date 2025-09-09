import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import FilledInput from '@mui/material/FilledInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Typography from '@mui/material/Typography';
import { Autocomplete, Button, CircularProgress, Dialog, DialogActions, DialogContent, Divider, FormControlLabel, MenuItem, Select, Stack, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { useEffect, useRef, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import AdapterDateFns from '@mui/lab/AdapterDateFns';
// import { DatePicker } from '@mui/lab';
// import ptLocale from 'date-fns/locale/pt';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import "dayjs/locale/pt-br";
import axios from 'axios';
import TaskGrid from './TaskGrid';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQuery } from '@tanstack/react-query';
import CloseIcon from '@mui/icons-material/Close';
import { useAppContext } from '../context/AppProvider';
import DynamicFilter from './DynamicFilter';
import FilterContainer from './FilterContainer';

export default function SearchTaskForm() {

  const {projectId} = useParams();
  console.log("projectid", projectId)

  const LABEL_WIDTH = 120;
  const LABEL_WIDTH_2 = 90;

const primary = {
  main: '#00796b',           // Main teal color
  light: '#48a999',          // Lighter shade of the main color
  dark: '#004c40',           // Darker shade of the main color
  contrastText: '#ffffff'    // White text contrasts well with the main color
};

  const theme = createTheme({
    palette: {
      primary,
      secondary: {
        main:'#b71c1c',
      }
      // secondary: purple,
    },
  });

  const [deleteClick, setDeleteClick] = useState(false);
  const [results, setResult] = useState(true);
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [refetchTasks, triggerRefetchTasks] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState(false);

  const deleteTasksMutation = useMutation({
    mutationFn:async (data: readonly number[]) => await axios.delete(`/api/v1/projects/${projectId}/tasks`, {data}),
    onSuccess:() => triggerRefetchTasks(true),
  })

  const closeDialog = () => {
    setConfirmationDialog(false);
  }
  const handleDeleteTasks = (e:React.FormEvent) => {
      e.preventDefault();
      console.log("to be deleted: ", selected)
      deleteTasksMutation.mutate(selected);
      setDeleteClick(false);
      closeDialog();
      setSelected([]);
  }

const { state } = useLocation();
const { setCurrentProject } = useAppContext();

let initialProject = state || JSON.parse(localStorage.getItem('currentProject') as string);
const [project, setProject] = useState(initialProject);
const [memberDetails, setMemberDetails] = useState(initialProject?.memberDetails);

// Use a ref to control whether to update currentProject
const updateCurrentProject = useRef(false);

useEffect(() => {
  // Update localStorage when project changes
  if (project) {
    localStorage.setItem('currentProject', JSON.stringify(project));
  }

  // Update currentProject only if flag is true
  if (updateCurrentProject.current) {
    setCurrentProject(project);
    // Reset the flag after update
    updateCurrentProject.current = false;
  }
}, [project, setCurrentProject]);

// Function to update project and set the flag
const handleProjectUpdate = (newProject) => {
  setProject(newProject);
  updateCurrentProject.current = true; // Set the flag to update currentProject
};
  // useEffect(() => {
  //   if (project) {
  //     localStorage.setItem('currentProject',JSON.stringify(project));
  //     // setCurrentProject(project)
  //   }
  // }, [project])

  interface SearchQuery {
    type?:unknown[]
    priority?:unknown[]
    status?:unknown[]
    technology?:unknown[]
    deadline?:unknown[]
    assignedTo?:unknown[]
  }

  const initialQuery:SearchQuery = {
    type:[],
    priority:[],
    status:[],
    technology:[],
    deadline:[],
    assignedTo:[],
  }
  /**O objeto do form pode vir com diferentes chaves
   * que se referem ao mesmo tipo de valor.
   * Essa função unifica tais chaves em uma lista 
   * de valores do mesmo tipo para uma mesma chave
   */
  function formToSearchQuery(data:FormDataEntryValue) {
    const fields = ['type', 'priority', 'status', 'technology', 'deadline'];
    const query:SearchQuery = {};
    for(let field of fields) {
      for (let dynamicFormKey in (data as any)) {
        if((data[dynamicFormKey] as string).length > 0 && dynamicFormKey.startsWith(field) && data[dynamicFormKey] !== 'Todos' && data[dynamicFormKey] !== 'Todas') {
          query[field] = query[field] ? 
            [...query[field], data[dynamicFormKey]] : 
            [data[dynamicFormKey]];
        }
      }
    }
    //assignedTo é um campo que recebe valores de uma forma diferente,
    //inacessível pelo form
    if(assignedTo.length > 0) query['assignedTo'] = assignedTo;
    return query;
  }
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [customQuery, setCustomQuery] = useState<SearchQuery>({});

  const [searchParams, setSearchParams] = useSearchParams();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData) as any;
    console.log("data: ", data)
    const query = formToSearchQuery(data);
    setCustomQuery(query)
    setResult(true)
    triggerRefetchTasks(true)
    setSearchParams(query as Record<string, string[]>)
    console.log("query: ", query)
  };

  // const customSearchQuery = useQuery({
  //   queryKey:['customSearch'],
  //   queryFn: async () => {
  //     const response = await axios.get(`/api/v1/projects/${projectId}/tasks`, {params:customQuery})
  //     setCustomQuery({})
  //     return response.data;
  //   },
  //   enabled:Object.keys(customQuery).length !== 0
  // })

  console.log("search params: ", searchParams)
  console.log("useParams(): ", useParams());
  
  return (
  <ThemeProvider theme={theme}>
    <Box 
      id="form_wrapper"
      component={'form'}
      onSubmit={handleSubmit}
      sx={{ 
        overflow:'auto',
        // background:'#C8C8C8',
        display: 'grid',
        alignItems:'center',
        // mt:10, ml:2,
        // mb:0, pb:0,
        width:'100%' ,
        marginLeft:3,
        // gap:'10px',
        // pl:0
      }}
    >
      <Box
        // component={'form'}
        // method='GET'
        // onSubmit={handleSubmit}
        sx={

          {
            display:'flex',
            alignItems:'center',
            gridTemplateColumns: 'repeat(4, 1fr)', /* Creates 4 equal columns */
            // gridColumn:'span 3'
          }
        }
        id="primeira_linha_busca">
          <Box
            id='label_busca'
            sx={
              {
                gridColumn:1,
                width:LABEL_WIDTH
              }
            }>
          <Typography
            align='right'
          >
            Atribuído para:&nbsp;&nbsp;
          </Typography>
        </Box>
        <Stack
          sx={{
            maxWidth:'70%',
            width:'70%',
          }}
        >

        <Autocomplete
          multiple
          onChange={(e, v) => setAssignedTo([...v])}
          // value={someValue}
          // disablePortal
          disableClearable
          // options={(project || currentProject).memberDetails.map(el => el.name)}
          options={['1', '2', '3']}
          // sx={{ maxWidth: '100%', width: '100%',}}
          renderInput={(params) => <TextField name='assignedTo' {...params} size='small' placeholder='Nome(s) do(s) membro(s)'
          sx={{
            // gridColumn:'span 3',
            // width:'90%'
          }} />}
        />
        </Stack>
        <Button type='submit' variant='contained'>
          Buscar
        </Button>
      </Box>
      <Box
        id="segunda_linha_busca"
        sx={{
          mt:0.5,
          display:'flex',
          justifyContent:'space-between'
        }}
      >
         <Box
          sx={{
          display:'flex',
          my:0.5,
          flex:1
            // width:420
          }}
          id="label_filtros"
        >
          <Button onClick={() => setResult(true)} >
            Resultados&nbsp; 
          </Button>
            {/* <Divider variant='middle' textAlign='center' orientation='vertical'/> */}
            {/* /&nbsp; */}
          <Button onClick={() => setResult(false)}>
             Outros filtros&nbsp;&nbsp;
          </Button>
        </Box>
        <Box 
          // component={'form'} 
          onClick={() => setConfirmationDialog(true)}
          // onSubmit={handleDeleteTasks} 
          sx={{ alignContent:'right'}}>
          <IconButton 
            // onClick={() => setConfirmationDialog(true)}
            type='submit'>
            <DeleteIcon 
              sx={{color:'#b71c1c'}} fontSize='large'></DeleteIcon>
          </IconButton>
        </Box>
        <Dialog 
          component={'form'}
          onSubmit={handleDeleteTasks}
          // method='DELETE'
          onClose={closeDialog}
          open={confirmationDialog}>
          <IconButton size='small' onClick={closeDialog} sx={{width:'10%', alignContent:'right', marginLeft:'auto'}}>
            <CloseIcon></CloseIcon>
          </IconButton>
          <DialogContent>
            {selected.length === 0 ? "Nenhuma tarefa selecionada!" : `Tem certeza que deseja deletar a(s) tarefa(s): ${[...selected].sort((a, b) => a - b).join(', ')}?`}
          </DialogContent>
          {!!selected.length && <DialogActions>
           <Button type='submit' variant='contained' color='secondary'>Deletar</Button>
          </DialogActions>}
        </Dialog>
        <Divider ></Divider>
        
      </Box>

      {results && 
      <TaskGrid 
          searchParams={searchParams}
          selected={selected} setSelected={setSelected} 
          refetchTasks={refetchTasks} triggerRefetchTasks={triggerRefetchTasks}
          customQuery={customQuery} setCustomQuery={setCustomQuery}
          memberDetails={memberDetails}
          >
      </TaskGrid>}

      {/* Container para os filtros */}
      {!results && 
      <FilterContainer LABEL_WIDTH={LABEL_WIDTH} LABEL_WIDTH_2={LABEL_WIDTH_2} />}
    </Box>
    </ThemeProvider>
  );
}