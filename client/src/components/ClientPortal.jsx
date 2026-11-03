import { useEffect, useMemo, useState } from 'react';
import './ClientPortal.css';

export default function ClientPortal({ projectId, onBack }) {
  const [portalState, setPortalState] = useState({
    projectId: null,
    status: 'loading',
    project: null,
    error: '',
  });

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    fetch(`/api/projects/portal/${encodeURIComponent(projectId)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Project not found');
        }
        return data;
      })
      .then((data) => {
        if (!cancelled) {
          setPortalState({
            projectId,
            status: 'ready',
            project: data,
            error: '',
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPortalState({
            projectId,
            status: 'error',
            project: null,
            error: err.message || 'Unable to load client portal',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const isCurrent = portalState.projectId === projectId;
  const status = isCurrent ? portalState.status : 'loading';
  const project = isCurrent ? portalState.project : null;
  const error = isCurrent ? portalState.error : '';

  const progressPercentage = useMemo(() => {
    if (!project || !Array.isArray(project.milestones) || project.milestones.length === 0) {
      return 0;
    }
    const completedCount = project.milestones.filter((m) => m.completed).length;
    return Math.round((completedCount / project.milestones.length) * 100);
  }, [project]);

  return (
    <section className="client-portal-container" aria-labelledby="portal-heading">
      <div className="portal-topbar">
        <span className="portal-badge">Client Portal (Read-Only)</span>
        <button type="button" className="back-btn" onClick={onBack}>
          Back to Login
        </button>
      </div>

      {status === 'loading' && (
        <div className="portal-card" role="status">
          <p>Loading project portal...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="portal-card">
          <div className="dashboard-alert" role="alert">
            {error}
          </div>
        </div>
      )}

      {status === 'ready' && project && (
        <article className="portal-card">
          <header className="portal-header">
            <div>
              <h1 id="portal-heading" className="portal-title">
                {project.title}
              </h1>
              <p className="portal-client">
                Client: <strong>{project.clientName}</strong>
              </p>
            </div>
            <span className="status-badge">{project.status}</span>
          </header>

          <div className="portal-progress-section">
            <div className="progress-label-row">
              <span>Overall Completion</span>
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

          <section aria-labelledby="portal-milestones-title">
            <h2 id="portal-milestones-title" className="portal-milestones-heading">
              Milestones
            </h2>
            {(!project.milestones || project.milestones.length === 0) ? (
              <p className="empty-state">No milestones have been scheduled yet.</p>
            ) : (
              <ul className="portal-milestone-list">
                {project.milestones.map((milestone) => (
                  <li
                    key={milestone._id}
                    className={
                      milestone.completed
                        ? 'portal-milestone-item completed'
                        : 'portal-milestone-item'
                    }
                  >
                    <label className="portal-milestone-label">
                      <input
                        type="checkbox"
                        checked={Boolean(milestone.completed)}
                        disabled
                        readOnly
                      />
                      <span className="portal-milestone-title">{milestone.title}</span>
                    </label>
                    <span
                      className={
                        milestone.completed
                          ? 'milestone-state-tag done'
                          : 'milestone-state-tag pending'
                      }
                    >
                      {milestone.completed ? 'Completed' : 'Pending'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      )}
    </section>
  );
}
