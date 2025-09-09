import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, createTheme, Divider, MenuItem, Select, TextField, Theme, ThemeProvider, Tooltip } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import CreateIcon from '@mui/icons-material/Create';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SwitchableField from './SwitchableField';
import { useAppContext } from '../context/AppProvider';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export interface editState {
    type:boolean,
    priority:boolean,
    description:boolean,
    assignedTo:boolean,
    technology:boolean,
    status:boolean,
    deadline:boolean,
}

interface ITaskUpdate {
  fromTask: string;
  fromProject: string;
  note?: string;
  author: string;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
}

const LABEL_WIDTH = 130;
const LABEL_WIDTH_2 = 130;

const LINE_HEIGHT = 85;
const DESCRIPTION_LINE_HEIGHT = 220;

function lineStyle(lineHeight:number) {
  return {
    display:'flex',
    flexDirection:'row',
    p:2,
    minHeight:lineHeight,
    // height:lineHeight
  }
}

const FIELD_ALIGNMENT = 'center';
const DESCRIPTION_FIELD_ALIGNMENT = '';

function fieldStyle(alignItems:string) {
  return {
    display:'flex',
    flex:1,
    alignItems:alignItems,
    cursor:'pointer',
  }

}

export default function TaskView() {

  const primary = {
    main: '#00796b', // Main teal color
    light: '#48a999', // Lighter shade of the main color
    dark: '#004c40', // Darker shade of the main color
    contrastText: '#ffffff', // White text contrasts well with the main color
  };



  const {state} = useLocation();

  const {projectId} = useParams();


  const theme = createTheme({
    palette: {
      primary,
    },
  });


  const initialState = {
    type:false,
    priority:false,
    description:false,
    assignedTo:false,
    technology:false,
    status:false,
    deadline:false,
  }

  const [edit, setEdit] = useState<editState>(initialState);

  const {currentUser, setCurrentTask} = useAppContext();

  React.useEffect(() => {
    setCurrentTask(state)
  }, [])

  const prioridades = ["Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"];
  const status = ["Aberta", "Desenvolvimento", "Teste", "Adiada", "Concluída", "Personalizada" ];
  const tipos = ["Erro", "Bug", "Requisito", "Funcionalidade", "Atualização", "Personalizada" ];

  const taskActivityPost = useMutation({
    mutationFn: async(data:ITaskUpdate) => {
      const response = await axios.patch(`/api/v1/projects/${projectId}/tasks/${state.taskId}`, data);
      return response;
    }
  })

  const prepareChanges = (data:{[k: string]: FormDataEntryValue}) => {
    let changes:ITaskUpdate["changes"] = [];
    for (let d in (data as any)) {
      if (d !== '_id' && d !== 'note' && state[d] !== data[d]) {
        changes.push({
          field:d,
          oldValue:state[d],
          newValue:data[d],
        })
      } 
    }
    return changes;
  }


  const handleSubmitActivity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);

    let changes:ITaskUpdate["changes"] = prepareChanges(data);

    if (changes.length === 0 && data.note == '') {
      console.log('empty')
      return;
    }

    let newTaskActivity:ITaskUpdate = {
      fromProject:projectId as string,
      fromTask:state._id as string,
      author:currentUser._id,
      changes:changes,
      note:data.note as string,
    };
    
    taskActivityPost.mutate(newTaskActivity);
  };


  return (
    <ThemeProvider theme={theme}>
    <Box
        component={'form'}
        onSubmit={handleSubmitActivity}
        method='post'
        sx={{
          display:'flex',
          flexDirection:'column',
          backgroundColor:'hsl(144, 72%, 95%)',
          border:'1px solid rgba(0,0,0,0.2)',
          width: '65vw',
          overflow: 'auto',
          marginLeft:3,
        }}>
      <Box
        id="form_linha_um"
        sx={lineStyle(LINE_HEIGHT)}>
        <SwitchableField state={state} 
          edit={edit} setEdit={setEdit}
          fieldStyle={fieldStyle(FIELD_ALIGNMENT)} 
          label={'Tipo:'} minWidth={LABEL_WIDTH}
          selectItens={tipos} name={'type'} />

        <SwitchableField state={state} 
          edit={edit} setEdit={setEdit}
          fieldStyle={fieldStyle(FIELD_ALIGNMENT)} 
          label={'Prioridade:'} minWidth={LABEL_WIDTH_2}
          selectItens={prioridades} name={'priority'} />
      </Box>

      <Divider sx={{mx:2}}></Divider>

      {/*Primeira linha */}
      <Box
        id="form_linha_tres"
        sx={lineStyle(LINE_HEIGHT)}>

        <SwitchableField state={state} 
          edit={edit} setEdit={setEdit}
          fieldStyle={fieldStyle(FIELD_ALIGNMENT)} 
          label={'Atribuído para:'} minWidth={LABEL_WIDTH}
          selectItens={[]} name={'assignedTo'} />

        <SwitchableField state={state} 
          edit={edit} setEdit={setEdit} fieldStyle={fieldStyle(FIELD_ALIGNMENT)} 
          label={'Tecnologia:'} minWidth={LABEL_WIDTH_2} name={'technology'} />
      </Box>
      <Divider sx={{mx:2}}></Divider>

      {/*Segunda linha */}
        <Box
          id="form_linha_quatro"
          sx={lineStyle(LINE_HEIGHT)}
        >
          <SwitchableField state={state} 
            edit={edit} setEdit={setEdit}
            fieldStyle={fieldStyle(FIELD_ALIGNMENT)} 
            label={'Andamento:'} minWidth={LABEL_WIDTH}
            selectItens={status} name={'status'} />

          <SwitchableField state={state} 
            edit={edit} setEdit={setEdit}
            fieldStyle={fieldStyle(FIELD_ALIGNMENT)} 
            label={'Prazo:'} minWidth={LABEL_WIDTH_2}
            name={'deadline'} />
        </Box>

      <Divider sx={{mx:2}}></Divider>

      {/*Terceira linha */}
      <Box
        id="form_linha_dois"
        sx={lineStyle(DESCRIPTION_LINE_HEIGHT)}
      >
        <Box
          id='campo_descricao'
          sx={fieldStyle(DESCRIPTION_FIELD_ALIGNMENT)}
        >
          <Box
          >
            <Typography
            onClick={() => setEdit({...edit, description:true})} 
            sx={{
              minWidth:LABEL_WIDTH,
            }}>
              Descrição:
            </Typography>
            {edit.description && 
            <Button onClick={() => setEdit({...edit, description:false})}>
                <CloseIcon color='primary' />
            </Button>
            }
          </Box>
          {!edit.description ?
          (<Tooltip title='Clique para editar'>
            <Typography 
              onClick={() => setEdit({...edit, description:true})} 
              sx={{
                minWidth:'40%',
              }}>
                {state.description}
            </Typography>
          </Tooltip>)
          :
          <TextField
              multiline
              rows={8}
              name='description'
              size='small'
              defaultValue={state.description}
              sx={
                {
                  minWidth:'70%',
                  backgroundColor:'white'
                }
              }
            />
            }
          </Box>
        </Box>

        
      <Divider sx={{mx:2}}></Divider>
      {/* <Divider sx={{mx:2}}></Divider> */}
      <Box
        id="form_linha_dois"
        sx={lineStyle(DESCRIPTION_LINE_HEIGHT)}
      >
      <Box
        id='campo_descricao'
        sx={fieldStyle(DESCRIPTION_FIELD_ALIGNMENT)}
      >
        <Box
        >
        
        </Box>
        {
        <TextField
            multiline
            rows={8}
            fullWidth
            name='note'
            label={'Nota da atividade'}
            size='small'
            placeholder={'Nota sobre as mudanças feitas.'}
            sx={
              {
                // minWidth:'70%',
                backgroundColor:'white',
                // paddingBottom:'40px'
              }
            }
          />
          }
        </Box>
      </Box>
      <Box sx={{...lineStyle(LINE_HEIGHT), marginBottom:'30px'}}>
          <Box sx={{display:'flex', alignItems:'center', flex:1.0, justifyContent:'right'}}>
          <Button 
            sx={{
            }}
            type='submit'
            variant='contained'>
              Lançar movimentação
          </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}