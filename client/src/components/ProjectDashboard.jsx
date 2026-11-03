import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProjectDashboard.css';

const formatBudget = (budget) => {
  if (budget === undefined || budget === null || budget === '') {
    return 'N/A';
  }
  const numeric = Number(budget);
  if (Number.isNaN(numeric)) {
    return 'N/A';
  }
  return `$${numeric.toLocaleString()}`;
};

export default function ProjectDashboard() {
  const { token, logout } = useAuth();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState('');

  // Project creation form state
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [budget, setBudget] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  // Milestone ingestion form state
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [addingMilestone, setAddingMilestone] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    fetch('/api/projects', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          return null;
        }
        const data = await res.json().catch(() => []);
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load projects');
        }
        return data;
      })
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setProjects(data);
          if (data.length > 0) {
            setSelectedProjectId((prev) => prev || data[0]._id);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Could not fetch projects');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const progressPercentage = useMemo(() => {
    if (!selectedProject || !Array.isArray(selectedProject.milestones)) {
      return 0;
    }
    const totalMilestones = selectedProject.milestones.length;
    if (totalMilestones === 0) {
      return 0;
    }
    const completedMilestones = selectedProject.milestones.filter(
      (m) => m.completed
    ).length;
    return Math.round((completedMilestones / totalMilestones) * 100);
  }, [selectedProject]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    setCreatingProject(true);

    const payload = {
      title: title.trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      ...(budget !== '' && { budget: Number(budget) }),
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (res.status !== 201 && !res.ok) {
        throw new Error(data.message || 'Failed to create project');
      }

      setProjects((prev) => [data, ...prev]);
      setSelectedProjectId(data._id);
      setTitle('');
      setClientName('');
      setClientEmail('');
      setBudget('');
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    setError('');
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete project');
      }

      setProjects((prev) => {
        const remaining = prev.filter((p) => p._id !== projectId);
        if (selectedProjectId === projectId) {
          setSelectedProjectId(remaining.length > 0 ? remaining[0]._id : null);
        }
        return remaining;
      });
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!selectedProject || !milestoneTitle.trim()) return;

    setError('');
    setAddingMilestone(true);

    try {
      const res = await fetch(`/api/projects/${selectedProject._id}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: milestoneTitle.trim() }),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const updatedProject = await res.json().catch(() => ({}));
      if (res.status !== 201 && !res.ok) {
        throw new Error(updatedProject.message || 'Failed to add milestone');
      }

      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );
      setMilestoneTitle('');
    } catch (err) {
      setError(err.message || 'Failed to add milestone');
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleToggleMilestone = async (milestone) => {
    if (!selectedProject) return;

    setError('');
    try {
      const res = await fetch(
        `/api/projects/${selectedProject._id}/milestones/${milestone._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ completed: !milestone.completed }),
        }
      );

      if (res.status === 401) {
        logout();
        return;
      }

      const updatedProject = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(updatedProject.message || 'Failed to update milestone');
      }

      setProjects((prev) =>
        prev.map((p) => (p._id === updatedProject._id ? updatedProject : p))
      );
    } catch (err) {
      setError(err.message || 'Failed to update milestone');
    }
  };

  return (
    <div className="project-dashboard">
      {error && (
        <div className="dashboard-alert" role="alert">
          {error}
        </div>
      )}

      <section className="dashboard-panel" aria-labelledby="create-project-heading">
        <h2 id="create-project-heading">Create New Project</h2>
        <form className="project-form" onSubmit={handleCreateProject}>
          <div className="form-field">
            <label htmlFor="project-title">Project Title</label>
            <input
              id="project-title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Website Redesign"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="client-name">Client Name</label>
            <input
              id="client-name"
              name="clientName"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Acme Corp"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="client-email">Client Email</label>
            <input
              id="client-email"
              name="clientEmail"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@acme.com"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="project-budget">Budget ($)</label>
            <input
              id="project-budget"
              name="budget"
              type="number"
              min="0"
              step="any"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <button type="submit" className="primary-btn" disabled={creatingProject}>
            {creatingProject ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-panel" aria-labelledby="projects-overview-heading">
          <h2 id="projects-overview-heading">Projects Overview</h2>
          {loadingProjects ? (
            <p className="empty-state" role="status">
              Loading projects...
            </p>
          ) : projects.length === 0 ? (
            <p className="empty-state">No projects yet. Create one above to get started.</p>
          ) : (
            <div className="project-list">
              {projects.map((project) => {
                const isSelected = project._id === selectedProjectId;
                return (
                  <article
                    key={project._id}
                    className={isSelected ? 'project-card selected' : 'project-card'}
                  >
                    <div className="project-card-header">
                      <h3 className="project-card-title">{project.title}</h3>
                      <span className="status-badge">{project.status}</span>
                    </div>

                    <div className="project-card-meta">
                      <div>
                        <strong>Client:</strong> {project.clientName}
                      </div>
                      <div>
                        <strong>Email:</strong> {project.clientEmail}
                      </div>
                      <div>
                        <strong>Budget:</strong> {formatBudget(project.budget)}
                      </div>
                    </div>

                    <div className="project-card-actions">
                      <button
                        type="button"
                        className={isSelected ? 'select-btn active' : 'select-btn'}
                        onClick={() => setSelectedProjectId(project._id)}
                      >
                        View / Manage
                      </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDeleteProject(project._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {selectedProject && (
          <section
            className="dashboard-panel milestone-board"
            aria-labelledby="milestone-board-heading"
          >
            <div className="milestone-board-header">
              <h2 id="milestone-board-heading">{selectedProject.title} — Milestone Board</h2>
              <p className="milestone-client-email">
                Client Email: <strong>{selectedProject.clientEmail}</strong>
              </p>
            </div>

            <div className="progress-section">
              <div className="progress-label-row">
                <span>Overall Progress</span>
                <span className="progress-percentage">{progressPercentage}%</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <form className="milestone-form" onSubmit={handleAddMilestone}>
              <div className="form-field">
                <label htmlFor="milestone-title">New Milestone</label>
                <input
                  id="milestone-title"
                  name="milestoneTitle"
                  type="text"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="e.g., Wireframes"
                  required
                />
              </div>
              <button type="submit" className="primary-btn" disabled={addingMilestone}>
                {addingMilestone ? 'Adding...' : 'Add Milestone'}
              </button>
            </form>

            {(!selectedProject.milestones || selectedProject.milestones.length === 0) ? (
              <p className="empty-state">No milestones added yet.</p>
            ) : (
              <ul className="milestone-checklist">
                {selectedProject.milestones.map((milestone) => (
                  <li
                    key={milestone._id}
                    className={
                      milestone.completed ? 'milestone-item completed' : 'milestone-item'
                    }
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={Boolean(milestone.completed)}
                        onChange={() => handleToggleMilestone(milestone)}
                      />
                      <span>{milestone.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
