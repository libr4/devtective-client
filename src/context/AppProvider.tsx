import React, { createContext, useContext, useState } from 'react'

interface ContextApp {

}

const AppContext = createContext({} as any);

export default function AppProvider({children}) {
  const sayHello = () => console.log("Hello context");
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState({});
  const [currentTask, setCurrentTask] = useState({});
  const [currentScreen, setCurrentScreen] = useState('projects');
  const [currentUser, setCurrentUser] = useState('projects');
  const [cardClicked, setCardClicked] = useState('');
  const [clickedElement, setClickedElement] = useState(null);
  return (
    <AppContext.Provider value={{sayHello, projects, setProjects, 
      currentProject, setCurrentProject, 
      currentScreen, setCurrentScreen,
      currentUser, setCurrentUser,
      currentTask, setCurrentTask,
      cardClicked, setCardClicked,
      clickedElement, setClickedElement,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  return useContext(AppContext)
}
