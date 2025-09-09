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
import { useState } from 'react';
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
import { Link, useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation } from '@tanstack/react-query';
import CloseIcon from '@mui/icons-material/Close';
import { useAppContext } from '../context/AppProvider';


export default function DynamicFilter(props:any) {

    let {label, width, selectItens, inputType, name} = props;

    if ( selectItens == undefined ) {
      selectItens = [];
    }

    const [newFilter, setNewFilter] = useState([{id:1}]);

    const handleNewFilter = () => {
      setNewFilter((newFilter) => [...newFilter, {id:newFilter.length + 1}]);
    }
    const handleRemove = (id) => {
      setNewFilter((newFilter) => newFilter.filter((filter) => filter.id !== id));
    }

    let fieldName = name;

    const filters = newFilter.map((el, index) => {
      const isFirst = index < 1;
      //Nome do campo do form, sendo modificado para 
      //possibilitar a extração fácil dos valores de campos iguais
      name = `${fieldName}_${index}`;
      return <Box key={el.id}
        id={"input_atribuido_" + el.id}
          sx={{
            display:'flex',
            alignItems:'center'
          }}
          >
            <Typography
              align='right'
              sx={
                {
                  width:width,
                }
              }
            >
              {label}:&nbsp;&nbsp;
            </Typography>
            {inputType === "date" ?
            <LocalizationProvider 
              adapterLocale='pt-br'
              dateAdapter={AdapterDayjs}>
                <DatePicker name={name} />
            </LocalizationProvider>
              :
              !selectItens.length ? 
              <TextField 
            //   onChange={(e, v) => setSearch({...search, label:v})} 
              name={name}
              size='small'></TextField>
              :           
              <Select
              size='small'
              name={name}
            //   onChange={(e, v) => setSearch({...search, [label]:[...(search?.label && []), v]})}
            //   onChange={(e, v) => setSearch({...search, [e.target.name]:[...search[e.target.name], e.target.value]}) }
              defaultValue={selectItens[0]}
              sx={
                {
                  width:'33%'
                }
              }
            >
            {selectItens.map((item) => {
              return (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              )
            })}
  
            </Select>
            }
            {inputType !== "date" &&  <IconButton onClick={isFirst ? handleNewFilter : () => handleRemove(el.id)}>
              {isFirst ? 
              <AddIcon></AddIcon> 
              : <RemoveIcon></RemoveIcon>}
            </IconButton>}
          
          </Box>
    })
    return filters;
  }