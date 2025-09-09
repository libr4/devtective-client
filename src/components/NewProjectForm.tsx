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
import { Autocomplete, Button, Divider, FormControlLabel, MenuItem, Select, Stack, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import AdapterDateFns from '@mui/lab/AdapterDateFns';
// import { DatePicker } from '@mui/lab';
// import ptLocale from 'date-fns/locale/pt';
import "dayjs/locale/pt-br";
import axios from 'axios';
import { Form, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAppContext } from '../context/AppProvider';

export function getHello(e) {
    e.preventDefault();
    // console.log(test)
    return null;
}
  const dicionario = {
    title:'Título',
    type:'Tipo',
    priority:'Prioridade',
    description:'Descrição',
    assignedTo:'Atribuído para',
    status:'Andamento',
    technology:'Tecnologia',
    deadline:'Prazo',
  }


function validateRequired(data) {
  const fields:string[] = [];
  for (let property in data) {
    if (data[property] === '') {
      fields.push(dicionario[property])
    }
  }
  return fields;
}

export default function NewProjectForm({setValidation}) {

  interface NewProject {
    members:string[]
    leader:string[]

  }
  const navigate = useNavigate();
  const {projectId} = useParams();
  const newProjectMutation = useMutation({
    mutationFn: async (data:NewProject) => {
      try {
        const response = await axios.post(`/api/v1/projects`, data);
        return response.data;
        
      } catch (error) {
        return error;
      }
    },
    onError:(error) => console.log(error)
    // onSuccess:(data) => navigate(`/${projectId}/task/${data?.data?.taskId}`, {state:data.data}),
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data:NewProject = Object.fromEntries(formData) as unknown as NewProject;
    // delete data['assignedTo'];
    // const requiredError = validateRequired(data);
    // if (requiredError.length) return setValidation(`Preencha o(s) campos: ${requiredError.join(', ')}`)
    data.members = members;
    data.leader = leaders;
    newProjectMutation.mutate(data);
  };

  // const [test, setTest] = useState('')
  // console.log("this is test value: ", test);

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
      // secondary: purple,
    },
  });

  const allUsersQuery = useQuery({
    queryKey:['novo-projeto'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/users')
      return response.data;
    }
  })

  const currentUserQuery = useQuery({
    queryKey:['current-user'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/users/current-user');
      
      return response.data;
    }
  })

  const [members, setMembers] = useState<string[]>([]);
  const [leaders, setLeaders] = useState<string[]>([]);

  return (

  <ThemeProvider theme={theme}>
  <Form
    onSubmit={handleSubmit}
    // component={'form'}
    method='post'>
    <Box 
      id="form_wrapper"
      sx={{ 
        overflow:'auto',
        // background:'#C8C8C8',
        display: 'grid',
        alignItems:'center',
        // mt:10, ml:2,
        width:'100%' ,
        gap:'10px'
      }}
    >
      
       {/* Linha um do form */}
      <Box id="form_linha_um"
          sx={
            {
              display:'grid',
              gridTemplateColumns: 'repeat(4, 1fr)', /* Creates 4 equal columns */
            }
          }
      >
        <Box
          id="input_titulo"
          sx={{
            display:'flex',
            alignItems:'center',
            alignContent:'left',
            gridColumn:'span 3'
          }}
        >
          <Typography
          align='right'
          sx={
            {
              width:LABEL_WIDTH
            }
          }
          >
            Título:&nbsp;&nbsp;
          </Typography>
          <TextField 
          // required
            name='name'
            size='small'
            // fullWidth
            sx={{
              width:'90%'
            }}/>
        </Box>
      </Box>
      <Divider></Divider>
      {/* Fim da linha dois do form */}

      {/* Linha três do form */}
      <Box id="form_linha_dois"
        sx={
          {
            display:'grid',
            gridTemplateColumns: 'repeat(4, 1fr)', /* Creates 4 equal columns */
            // width:'auto'
          }
        }
      >
        <Box
          id="input_descricao"
          sx={{
            display:'flex',
            alignItems:'center',
            alignContent:'left',
            gridColumn:'span 3'
          }}
        >
          <Typography
          align='right'
          sx={
            {
              width:LABEL_WIDTH

            }
          }
          >
            Descrição:&nbsp;&nbsp;
          </Typography>
          <TextField 
          name='description'
          size='small'
          multiline
          // fullWidth
          rows={5}
          sx={{
            width:'90%'
          }}/>
        </Box>
      </Box>
      {/* Fim da linha três do form */}

        {/* Linha quatro do form */}
        <Box id="form_linha_quatro"
          sx={
            {
              display:'grid',
              gridTemplateColumns: 'repeat(4, 1fr)', /* Creates 4 equal columns */
            }
          }
      >
        <Box
          id="input_tipo"
          sx={{
            display:'flex',
            
            alignItems:'center',
            alignContent:'left',
            gridColumn:'span 2'
          }}
        >
          <Typography
            align='right'
            sx={
              {
                width:LABEL_WIDTH
              }
            }
          >
            Líder/Gerente:&nbsp;&nbsp;
          </Typography>
          {allUsersQuery.isLoading ? 
          
          <Typography>Carregando...</Typography> : 
          allUsersQuery.data ?
          <Stack
            sx={{ 
              minWidth: '50%', 
              maxWidth:'50%'
            }}
          >
          <Autocomplete
            multiple
            onChange={(e, v:any[]) => setLeaders(v.map(el => el._id))}
            disableClearable
            // options={allUsersQuery.data.filter(el => el.name).map(el => el.name)}
            options={allUsersQuery.isLoading ? [] : allUsersQuery.data.filter(el => el.name)}
            getOptionLabel={(option:any) => option.name}
            renderInput={(params) => <TextField name='leader' {...params} size='small' placeholder='Nome(s) do(s) líderes(s)'
          />}
          />
          </Stack>
          :
          <Typography>Tente mais tarde.</Typography>
          }
        </Box>
        <Box
          id="input_inicio"
          sx={{
            display:'flex',
            alignItems:'center',
            gridColumn:3
          }}
        >
          <Typography 
              align='right'
              sx={{
                // width:LABEL_WIDTH/2
                minWidth:LABEL_WIDTH_2
              }}>
              Início:&nbsp;&nbsp;
          </Typography>
          <LocalizationProvider 
          adapterLocale='pt-br'
          dateAdapter={AdapterDayjs}>
          <DatePicker 
              name='start'
          />
        </LocalizationProvider>
        </Box>
      </Box>
      {/* Fim da linha quatro do form */}

      {/* Linha cinco do form */}
      <Box id="form_linha_um"
          sx={
            {
              display:'grid',
              gridTemplateColumns: 'repeat(4, 1fr)', /* Creates 4 equal columns */
            }
          }
      >
        <Box
          id="input_tipo"
          sx={{
            display:'flex',
            alignItems:'center',
            alignContent:'left',
            gridColumn:'span 2'
          }}
        >
          <Typography
          align='right'
          sx={
            {
              width:LABEL_WIDTH
            }
          }
          
          >
            Membros:&nbsp;&nbsp;
          </Typography>
          {(allUsersQuery.isLoading || currentUserQuery.isLoading) ? 
          
          <Typography>Carregando...</Typography> : 
          allUsersQuery.data ?
          <Stack
            sx={{ 
              minWidth: '50%', 
              maxWidth:'50%'
            }}
          >
          <Autocomplete
            multiple
            onChange={(e, v:any[]) => setMembers(v.map(el => el._id))}
            disableClearable
            defaultValue={(allUsersQuery.data.filter(el => el._id === currentUserQuery.data._id)) || {}}
            // options={allUsersQuery.data.filter(el => el.name).map(el => el.name)}
            options={allUsersQuery.isLoading ? [] : allUsersQuery.data.filter(el => el.name)}
            getOptionLabel={(option:any) => option.name}
            // value={someValue}
            // disablePortal
            // sx={{ 
            //   overflowX:'auto',
              // minWidth: '100%', width: '100%',}}
            renderInput={(params) => <TextField name='members' {...params} size='small' placeholder='Nome(s) do(s) membro(s)'
            sx={{
              // overflowX:'auto'
              // gridColumn:'span 3',
              // width:'90%'
            }} />}
          />
          </Stack>
          :
          <Typography>Tente mais tarde.</Typography>
          }

          {/* <Select
            name='status'
            size='small'
            defaultValue={status[0]}
            sx={
              {
                width:'50%'
              }
            }
          >
          {status.map((item) => {
            return (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            )
          })}

          </Select> */}
          {/* <TextField 
            size='small'
            sx={{
              width:'50%'
            }}/> */}
        </Box>
        <Box
          id="input_prazo"
          sx={{
            display:'flex',
            alignItems:'center',
            gridColumn:3
          }}
        >
          <Box>
            <Typography 
              align='right'
              sx={{
                width:LABEL_WIDTH_2
              }}>
              Fim:&nbsp;&nbsp;
            </Typography>
          </Box>
          <LocalizationProvider 
          adapterLocale='pt-br'
          dateAdapter={AdapterDayjs}>
          <DatePicker 
              name='end'
          />
        </LocalizationProvider>
        </Box>
      </Box>
      {/* Fim da linha um do form */}

      {/* Linha seis do form */}
      <Box id="form_linha_seis"
          sx={
            {
              display:'grid',
              gridTemplateColumns: 'repeat(4, 1fr)', /* Creates 4 equal columns */
            }}>
        <Box
      
          id="enviar_tarefa_btn"
          sx={{
            display:'flex',
            alignItems:'center',
            gridColumn:3
          }}
        >
          <Typography
           align='right'
           sx={
            {
              width:LABEL_WIDTH_2

            }
           }
          >
            {/* Prioridade:&nbsp;&nbsp; */}
          </Typography>
          <Button 
          // onClick={() => setValidation("button clicked")}
            size='large'
            sx={{
              width:'70%',
            }}
            type='submit'
            variant='contained'>
              Enviar
          </Button>
        </Box>
      </Box>
      {/* Fim da linha seis do form */}


    </Box>
    </Form>
    </ThemeProvider>
  );
}