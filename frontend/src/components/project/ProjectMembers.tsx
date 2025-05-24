import React, { useEffect, useState } from 'react';
import { getProjectMembers, addMemberToProject, removeMemberFromProject, ProjectMember } from '@/services/api/projects';

interface ProjectMembersProps {
  projectId: string;
}

const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId }) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  const fetchMembers = async () => {
    try {
      const data = await getProjectMembers(projectId);
      setMembers(data);
    } catch (err) {
      setError('Failed to fetch project members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberUserId || !newMemberRole) return;

    try {
      await addMemberToProject(projectId, { user_id: newMemberUserId, role: newMemberRole });
      setNewMemberUserId('');
      setNewMemberRole('');
      fetchMembers(); // Refresh the list
    } catch (err) {
      alert('Failed to add member');
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberFromProject(projectId, userId);
      fetchMembers(); // Refresh the list
    } catch (err) {
      alert('Failed to remove member');
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading members...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h3>Project Members</h3>
      {
        members.length === 0 ? (
          <p>No members yet.</p>
        ) : (
          <ul>
            {members.map((member) => (
              <li key={member.user_id}>
                {member.user_id} ({member.role})
                <button onClick={() => handleRemoveMember(member.user_id)}>Remove</button>
              </li>
            ))}
          </ul>
        )
      }

      <h4>Add Member</h4>
      <form onSubmit={handleAddMember}>
        <div>
          <label htmlFor="userId">User ID:</label>
          <input
            id="userId"
            type="text"
            value={newMemberUserId}
            onChange={(e) => setNewMemberUserId(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <input
            id="role"
            type="text"
            value={newMemberRole}
            onChange={(e) => setNewMemberRole(e.target.value)}
          />
        </div>
        <button type="submit">Add Member</button>
      </form>
    </div>
  );
};

export default ProjectMembers; 