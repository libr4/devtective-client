import CreateIcon from "@mui/icons-material/Create";
import SearchIcon from "@mui/icons-material/Search";
import MailIcon from "@mui/icons-material/Mail";
import InboxIcon from "@mui/icons-material/Inbox";
import AddIcon from "@mui/icons-material/Add";

export const TASKS_MENU = (hasProject:boolean, projectId:string, ) =>
    [
      {
        label: "Nova Tarefa",
        to: hasProject ? `/${projectId}/nova_tarefa` : "#",
        disabled: !hasProject,
        icon: <CreateIcon color="primary" />,
      },
      {
        label: "Buscar Tarefas",
        to: hasProject ? `/${projectId}/tasks` : "#",
        disabled: !hasProject,
        icon: <SearchIcon color="primary" />,
      },
      {
        label: "Projeto",
        to: `/p/${projectId}`, // TODO
        disabled: !hasProject,
        icon: <InboxIcon color="primary" />,
      },
      {
        label: "Iniciar chat",
        to: "#", // TODO
        disabled: true,
        icon: <MailIcon color="primary" />,
      },
    ]

export const PROJECTS_MENU = (hasCard:boolean, cardClicked:boolean) => [
      { label: "Novo Projeto", to: "/novo-projeto", disabled: false, icon: <AddIcon /> },
      {
        label: "Alterar",
        to: hasCard ? `/${cardClicked}/alterar` : "#",
        disabled: !hasCard,
        icon: <CreateIcon />,
      },
      {
        label: "Duplicar",
        to: hasCard ? `/${cardClicked}/duplicar` : "#",
        disabled: !hasCard,
        icon: <InboxIcon />,
      },
      {
        label: "Deletar",
        to: hasCard ? `/${cardClicked}/deletar` : "#",
        disabled: !hasCard,
        icon: <DeleteIconSafe />,
      },
    ]

function DeleteIconSafe() {
  return <span style={{ width: 24, height: 24, display: "inline-block" }}>🗑️</span>;
}