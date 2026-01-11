import { gql, useMutation, useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import TasksPage from "./TasksPage";
import "./styles/Board.css";

const PROJECTS = gql`
  query Projects {
    projects {
      id
      name
    }
  }
`;

const ME = gql`
  query Me {
    me {
      id
      username
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!) {
    createProject(name: $name) {
      id
      name
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export default function ProjectsPage() {
  const [name, setName] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const { data, loading, error, refetch } = useQuery(PROJECTS);
  const { data: meData } = useQuery(ME);
  const username = meData?.me?.username ?? "";

  const [createProject] = useMutation(CREATE_PROJECT);
  const [deleteProject] = useMutation(DELETE_PROJECT);

  const projects = data?.projects ?? [];

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedId) || null;
  }, [projects, selectedId]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createProject({ variables: { name } });
    setName("");
    refetch();
  };

  const onDelete = async (id) => {
    await deleteProject({ variables: { id } });
    if (selectedId === id) setSelectedId(null);
    refetch();
  };

  const onLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="board-bg">
      <div className="board-shell">
        {/* LEFT: Projects */}
        <aside className="board-sidebar">
          <div className="sidebar-header">
            <div>
              <h2 className="sidebar-title">Projects</h2>
              {username ? (
                <div className="sidebar-greeting">Hello, {username}</div>
              ) : (
                <p className="sidebar-subtitle">Pick one to see tasks</p>
              )}
            </div>
          </div>

          <form className="sidebar-form" onSubmit={onCreate}>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New project name"
            />
            <button className="btn btn-primary" type="submit">
              Add
            </button>
          </form>

          <div className="sidebar-list">
            {loading ? <p className="muted">Loading projects...</p> : null}
            {error ? <p className="errorText">{error.message}</p> : null}

            {!loading && !error && projects.length === 0 ? (
              <div className="empty">
                <div className="empty-title">No projects yet</div>
                <div className="empty-subtitle">
                  Create one on the left and start adding tasks.
                </div>
              </div>
            ) : null}

            {projects.map((p) => {
              const isActive = p.id === selectedId;
              return (
                <div
                  key={p.id}
                  className={`project-row ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedId(p.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="project-name" title={p.name}>
                    {p.name}
                  </div>

                  <button
                    className="icon-btn danger"
                    title="Delete project"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="sidebar-footer">
            <button className="btn btn-ghost" onClick={onLogout}>
              Logout
            </button>
          </div>
        </aside>

        {/* RIGHT: Tasks */}
        <main className="board-main">
          {!selectedProject ? (
            <div className="main-empty">
              <div className="main-empty-title">Select a project</div>
              <div className="main-empty-subtitle">
                Your tasks will show here.
              </div>
            </div>
          ) : (
            <TasksPage project={selectedProject} />
          )}
        </main>
      </div>
    </div>
  );
}
