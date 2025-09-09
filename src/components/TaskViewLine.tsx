// import Box from '@mui/material/Box'
// import Button from '@mui/material/Button'
// import MenuItem from '@mui/material/MenuItem'
// import Select from '@mui/material/Select'
// import Tooltip from '@mui/material/Tooltip'
// import Typography from '@mui/material/Typography'
// import React from 'react'

// export default function TaskViewLine({edit, setEdit}) {
//   return (
//     <Box
//         id="form_linha_um"
//         sx={{
//           display:'flex',
//           flexDirection:'row',
//           p:2,
//           height:100
//         }}
//       >
//       <Box
//         id='campo_tipo'
//         sx={{
//           display:'flex',
//           flex:1,
//           alignItems:'center',
//           cursor:'pointer',
//         }}
//       >
//         <Typography 
//           onClick={() => setEdit({...edit, type:true})} 
//           sx={{
//             minWidth:LABEL_WIDTH,
//         }}>
//           Tipo:
//         </Typography>
//         {!edit.type ?
//         <Tooltip title='Clique para editar'>
//         <Typography 
//           onClick={() => setEdit({...edit, type:true})} 
//           sx={{
//             minWidth:'40%',
//           }}>
//             {state.type}
//         </Typography>
//         </Tooltip>
//         :
//         <React.Fragment>
//         <Select
//                 name='type'
//                 size='small'
//             defaultValue={state.type}
//             sx={
//               {
//                 minWidth:'40%',
//                 backgroundColor:'white'
//               }
//             }
//           >
//           {tipos.map((item) => {
//             return (
//               <MenuItem key={item} value={item}>
//                 {item}
//               </MenuItem>
//             )
//           })}
//           </Select>
         
//           <Button onClick={() => setEdit({...edit, type:false})}>
//             <CloseIcon color='primary' />
//           </Button>
//           </React.Fragment>}
//       </Box>

//       <Box
//         id='campo_prioridade'
//         sx={{
//           display:'flex',
//           flex:1,
//           alignItems:'center',
//           cursor:'pointer',
//         }}
//       >
//         <Typography sx={{
//           minWidth:LABEL_WIDTH_2,
//           // '.&:hover': {
//           //         cursor:'pointer',
//           // }
//         }}>Prioridade:</Typography>
//         {/* <Typography>{state.type}</Typography> */}
//         {!edit.priority ?
//         <Tooltip title='Clique para editar'>
//         <Typography 
//           onClick={() => setEdit({...edit, priority:true})} 
//           sx={{
//             minWidth:'40%',
//           }}>
//             {state.priority}
//         </Typography>
//         </Tooltip>
//         :
//         <React.Fragment>
//         <Select
//                 name='priority'
//                 size='small'
//             defaultValue={state.priority}
//             sx={
//               {
//                 minWidth:'40%',
//                 backgroundColor:'white'
//               }
//             }
//           >
//           {prioridades.map((item) => {
//             return (
//               <MenuItem key={item} value={item}>
//                 {item}
//               </MenuItem>
//             )
//           })}
//           </Select>
         
//           <Button onClick={() => setEdit({...edit, priority:false})}>
//             <CloseIcon color='primary' />
//           </Button>
//           </React.Fragment>}
//       </Box>

//       </Box>
//   )
// }
