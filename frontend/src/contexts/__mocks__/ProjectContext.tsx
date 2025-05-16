import React from 'react';

const ProjectContext = React.createContext({}); // Mock context value

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectContext.Provider value={{ /* mock specific context values if needed by consumers */ }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => React.useContext(ProjectContext);

export default ProjectContext; 