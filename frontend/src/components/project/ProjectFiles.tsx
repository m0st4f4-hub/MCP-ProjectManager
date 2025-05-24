import React, { useEffect, useState } from 'react';
import { getProjectFiles, disassociateFileFromProject, ProjectFileAssociation } from '@/services/api/projects';

interface ProjectFilesProps {
  projectId: string;
}

const ProjectFiles: React.FC<ProjectFilesProps> = ({ projectId }) => {
  const [files, setFiles] = useState<ProjectFileAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const data = await getProjectFiles(projectId);
      setFiles(data);
    } catch (err) {
      setError('Failed to fetch project files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const handleDisassociateFile = async (fileId: string) => {
    try {
      await disassociateFileFromProject(projectId, fileId);
      fetchFiles(); // Refresh the list
    } catch (err) {
      alert('Failed to disassociate file');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading files...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h3>Project Files</h3>
      {
        files.length === 0 ? (
          <p>No files associated.</p>
        ) : (
          <ul>
            {files.map((file) => (
              <li key={file.file_id}>
                {file.file_id}
                <button onClick={() => handleDisassociateFile(file.file_id)}>Disassociate</button>
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
};

export default ProjectFiles; 