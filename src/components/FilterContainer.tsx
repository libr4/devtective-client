import React from 'react'
import Box from '@mui/material/Box'
import DynamicFilter from './DynamicFilter'

const prioridades = ["Todas", "Muito Baixa", "Baixa", "Média", "Alta", "Muito Alta"]
const status = ["Todos", "Aberta", "Desenvolvimento", "Teste", "Adiada", "Concluída", "Personalizada" ]
const tipos = ["Todos", "Erro", "Bug", "Requisito", "Funcionalidade", "Atualização", "Personalizada" ]
export default function FilterContainer({LABEL_WIDTH, LABEL_WIDTH_2}) {
  return (
    <Box 
      id="filter_container"
      sx={{
        display:'flex',
        mt:2,
        // width:'100vw',
        flex:'wrap'
      }}>
        {/* Container para a primeira coluna, que contém uma label e um input */}
        <Box sx={{
           flex: 0.4, 
          display:'flex',
          flexDirection:'column',
          alignItems:'stretch',
          alignContent:'start',
          // border: '1px solid gray',
          gap:'10px'
        }}>
          <DynamicFilter label="Tipo" width={LABEL_WIDTH} name='type' selectItens={tipos}></DynamicFilter>
          <DynamicFilter label="Andamento" width={LABEL_WIDTH} name='status' selectItens={status}></DynamicFilter>
          {/* <DynamicFilter label="Prazo" inputType="date" width={LABEL_WIDTH}></DynamicFilter> */}
        </Box>
        <Box sx={{
           flex: 0.5, 
          display:'flex',
          flexDirection:'column',
          alignItems:'stretch',
          alignContent:'start',
          gap:'10px',
          // border: '1px solid gray'
        }}>
          <DynamicFilter label="Prioridade" width={LABEL_WIDTH_2} name='priority' selectItens={prioridades}></DynamicFilter>
          <DynamicFilter label="Tecnologia" width={LABEL_WIDTH_2} name='technology'></DynamicFilter>
          </Box>
        <Box sx={{
          flex: 0.9, 
          display:'flex',
          flexDirection:'column',
          alignItems:'stretch',
          alignContent:'start',
          gap:'10px',
          // border: '1px solid gray'
        }}>
          <DynamicFilter label="Prazo" inputType="date" width={LABEL_WIDTH} name='deadline'></DynamicFilter>
        </Box>
      </Box>
  )
}
