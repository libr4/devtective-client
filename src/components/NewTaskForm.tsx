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
import { Button, Divider, FormControlLabel, MenuItem, Select, createTheme } from '@mui/material';
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

export default function NewTaskForm({setValidation}) {

  interface NewTask {

  }
  const navigate = useNavigate();
  const {projectId} = useParams();

  // const memberDetails = JSON.parse(localStorage.getItem('currentProject') as string).memberDetails;
  const safeGetJSON = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

type Member = { _id: string; name: string };
const project = safeGetJSON<any>('currentProject', null);
const memberDetails: Member[] = project?.memberDetails ?? [];

  const newTaskMutation = useMutation({
    mutationFn: async (data:NewTask) => await axios.post(`/api/v1/projects/${projectId}/tasks`, data),
    onSuccess:(data) => navigate(`/${projectId}/task/${data?.data?.taskId}`, {state:data.data}),
  })



  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data:NewTask = Object.fromEntries(formData);
    // const requiredError = validateRequired(data);
    // if (requiredError.length) return setValidation(`Preencha o(s) campos: ${requiredError.join(', ')}`)
    newTaskMutation.mutate(data);
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

  const prioridades = ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"]
  const status = ["Aberta", "Desenvolvimento", "Teste", "Adiada", "Concluída", "Personalizada" ]
  const tipos = ["Erro", "Bug", "Requisito", "Funcionalidade", "Atualização", "Personalizada" ]

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
            Tipo:&nbsp;&nbsp;
          </Typography>
          <Select
            name='type'
            size='small'
            // value={test}
            // onChange={(e) => {setTest(e.target.value)}}
            defaultValue={tipos[0]}
            sx={
              {
                width:'50%'
              }
            }
          >
          {tipos.map((item) => {
            return (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            )
          })}

          </Select>
          {/* <TextField 
            size='small'
            sx={{
              width:'50%'
            }}/> */}
        </Box>
        <Box
          id="input_prioridade"
          sx={{
            display:'flex',
            alignItems:'center',
            gridColumn:3
          }}
        >
          <Typography
            align='right'
            sx={{
              width:LABEL_WIDTH_2
            }}
          >
            Prioridade:&nbsp;&nbsp;
          </Typography>
          {/* <TextField
            size='small'
          /> */}
          <Select
            name='priority'
            fullWidth
            defaultValue={'Média'}
            size='small'>
            
            {prioridades.map((item) => {
              return (
              <MenuItem key={item} value={item}>{item}</MenuItem>
              )
            })}
          </Select>
        </Box>
      </Box>
      {/* Fim da linha um do form */}
<Divider></Divider>
      
       {/* Linha dois do form */}
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
          id="input_tipo"
          sx={{
            display:'flex',
            // flexWrap:'wrap',
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
            name='title'
            size='small'
            // fullWidth
            sx={{
              width:'90%'
            }}/>
        </Box>
      </Box>
      {/* Fim da linha dois do form */}

      {/* Linha três do form */}
      <Box id="form_linha_tres"
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
            Atribuído para:&nbsp;&nbsp;
          </Typography>
          {(!memberDetails.length) ?
          <Typography>
            Aguarde...
          </Typography>
          :
          <Select
            name='assignedTo'
            size='small'
            // value={test}
            // onChange={(e) => {setTest(e.target.value)}}
            defaultValue={''}
            sx={
              {
                width:'50%'
              }
            }
          >
          {memberDetails.map((item, index) => {
            return (
              <MenuItem key={index} value={item?._id}>
                {item?.name}
              </MenuItem>
            )
          })}

          </Select>}
          {/* <TextField 
            name='assignedTo'
            size='small'
            sx={{
              width:'50%'
            }}/> */}
        </Box>
        <Box
          id="input_tecnologia"
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
                width:LABEL_WIDTH_2
              }}>
              Tecnologia:&nbsp;&nbsp;
          </Typography>
          <TextField
            name='technology'
            size='small'
            fullWidth
          />
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
            Andamento:&nbsp;&nbsp;
          </Typography>
          <Select
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

          </Select>
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
              Prazo:&nbsp;&nbsp;
            </Typography>
          </Box>
          <LocalizationProvider 
          adapterLocale='pt-br'
          dateAdapter={AdapterDayjs}>
          <DatePicker 
              name='deadline'
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