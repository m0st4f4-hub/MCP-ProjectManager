'use client';

import React, { useEffect, useState } from 'react';
import { handoffApi } from '@/services/api/handoff';
import type { AgentHandoffCriteria } from '@/types/handoff';

interface AgentHandoffManagerProps {
  agentRoleId: string;
}

const AgentHandoffManager: React.FC<AgentHandoffManagerProps> = ({
  agentRoleId,
}) => {
  const [criteria, setCriteria] = useState<AgentHandoffCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCriteria, setNewCriteria] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetRole, setNewTargetRole] = useState('');
  const [newActive, setNewActive] = useState(true);

  const fetchCriteria = async () => {
    try {
      const data = await handoffApi.list({ agent_role_id: agentRoleId });
      setCriteria(data);
    } catch (err) {
      setError('Failed to fetch criteria');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriteria();
  }, [agentRoleId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handoffApi.create({
        agent_role_id: agentRoleId,
        criteria: newCriteria,
        description: newDescription || undefined,
        target_agent_role: newTargetRole || undefined,
        is_active: newActive,
      });
      setNewCriteria('');
      setNewDescription('');
      setNewTargetRole('');
      setNewActive(true);
      fetchCriteria();
    } catch (err) {
      alert('Failed to create');
      console.error(err);
    }
  };

  const handleUpdate = async (item: AgentHandoffCriteria) => {
    try {
      await handoffApi.update(item.id, {
        criteria: item.criteria,
        description: item.description ?? undefined,
        target_agent_role: item.target_agent_role ?? undefined,
        is_active: item.is_active,
      });
      fetchCriteria();
    } catch (err) {
      alert('Failed to update');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await handoffApi.delete(id);
      fetchCriteria();
    } catch (err) {
      alert('Failed to delete');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h3>Handoff Criteria</h3>
      {criteria.length === 0 ? (
        <p>No criteria.</p>
      ) : (
        <ul>
          {criteria.map((item) => (
            <li key={item.id}>
              <input
                aria-label="criteria"
                value={item.criteria}
                onChange={(e) =>
                  setCriteria((cs) =>
                    cs.map((c) =>
                      c.id === item.id ? { ...c, criteria: e.target.value } : c
                    )
                  )
                }
              />
              <input
                aria-label="description"
                value={item.description || ''}
                onChange={(e) =>
                  setCriteria((cs) =>
                    cs.map((c) =>
                      c.id === item.id
                        ? { ...c, description: e.target.value }
                        : c
                    )
                  )
                }
              />
              <input
                aria-label="target role"
                value={item.target_agent_role || ''}
                onChange={(e) =>
                  setCriteria((cs) =>
                    cs.map((c) =>
                      c.id === item.id
                        ? { ...c, target_agent_role: e.target.value }
                        : c
                    )
                  )
                }
              />
              <label>
                <input
                  type="checkbox"
                  aria-label="active"
                  checked={item.is_active}
                  onChange={(e) =>
                    setCriteria((cs) =>
                      cs.map((c) =>
                        c.id === item.id
                          ? { ...c, is_active: e.target.checked }
                          : c
                      )
                    )
                  }
                />
                Active
              </label>
              <button onClick={() => handleUpdate(item)}>Save</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <h4>Add Criteria</h4>
      <form onSubmit={handleCreate}>
        <input
          aria-label="new criteria"
          value={newCriteria}
          onChange={(e) => setNewCriteria(e.target.value)}
        />
        <input
          aria-label="new description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <input
          aria-label="new target role"
          value={newTargetRole}
          onChange={(e) => setNewTargetRole(e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            aria-label="new active"
            checked={newActive}
            onChange={(e) => setNewActive(e.target.checked)}
          />
          Active
        </label>
        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default AgentHandoffManager;
