import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import React from 'react'
import Button from '@mui/material/Button';
import { editState } from './TaskView';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CloseIcon from '@mui/icons-material/Close';

interface SwitchableFieldProps {
    state: any;
    edit: editState;
    setEdit: React.Dispatch<React.SetStateAction<editState>>;
    fieldStyle: React.CSSProperties;
    label: string;
    minWidth: number;
    selectItens?: string[];
    name: string;
  }

export default function SwitchableField(props:SwitchableFieldProps) {
    const {state, edit, setEdit, fieldStyle, label, minWidth, name, selectItens=[] } = props;
  const handleEdit = () => setEdit({...edit, [name]:true})
  const handleClose = () => setEdit({...edit, [name]:false})
  return (
  <Box
    id={`campo_${name}`}
    sx={fieldStyle}>
  <Typography 
      onClick={handleEdit} 
    sx={{
      minWidth,
    }}>{label}</Typography>
  {/* <Typography>{state.type}</Typography> */}
  {!edit[name] ?
  (
  <Tooltip title='Clique para editar'>
    <Typography 
      onClick={handleEdit} 
      sx={{
        minWidth:'40%',
      }}>
        {state[name]}
    </Typography>
  </Tooltip>
  )
  :
  <React.Fragment>
  {name === 'technology'?
    <TextField
      name={name}
      size='small'
      defaultValue={state[name]}
      sx={{
          minWidth:'40%',
          backgroundColor:'white'
      }}/>
  :
  name === 'deadline' ?
    <LocalizationProvider 
        adapterLocale='pt-br'
        dateAdapter={AdapterDayjs}>
        <DatePicker 
            name={name}
            sx={{backgroundColor:'white'}}
      />
    </LocalizationProvider>
  :
    <Select
      name={name}
      size='small'
      defaultValue={state[name]}
      sx={{
          minWidth:'40%',
          backgroundColor:'white'
        }}>
          {selectItens.map((item) => {
            return (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            )
          })}
    </Select>}
   
    <Button onClick={handleClose}>
      <CloseIcon color='primary' />
    </Button>
    </React.Fragment>}
</Box>)

 
}
