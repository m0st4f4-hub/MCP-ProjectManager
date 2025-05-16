import React from 'react';

// Placeholder for Project Context - needed to resolve test errors
// TODO: Implement actual context or remove if not needed

const ProjectContext = React.createContext({}); // Empty context for now

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectContext.Provider value={{}}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => React.useContext(ProjectContext);

export default ProjectContext; 