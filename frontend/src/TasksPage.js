import { gql, useMutation, useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import "./styles/Board.css";

const TASKS = gql`
  query Tasks($projectId: ID!, $status: TaskStatus) {
    tasks(projectId: $projectId, status: $status) {
      id
      title
      status
    }
  }
`;

const CREATE_TASK = gql`
  mutation CreateTask($projectId: ID!, $title: String!) {
    createTask(projectId: $projectId, title: $title) {
      id
      title
      status
    }
  }
`;

const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: TaskStatus!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      id
      status
    }
  }
`;

const DELETE_TASK = gql`
  mutation DeleteTask($taskId: ID!) {
    deleteTask(taskId: $taskId)
  }
`;

const STATUS_OPTIONS = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
];

export default function TasksPage({ project }) {
  const [title, setTitle] = useState("");

  const { data, loading, error, refetch } = useQuery(TASKS, {
    variables: { projectId: project.id },
    fetchPolicy: "cache-and-network",
  });

  const [createTask] = useMutation(CREATE_TASK);
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);
  const [deleteTask] = useMutation(DELETE_TASK);

  const tasks = data?.tasks ?? [];

  const grouped = useMemo(() => {
    const g = { TODO: [], IN_PROGRESS: [], DONE: [] };
    for (const t of tasks) g[t.status]?.push(t);
    return g;
  }, [tasks]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({ variables: { projectId: project.id, title } });
    setTitle("");
    refetch();
  };

  const onChangeStatus = async (taskId, status) => {
    await updateTaskStatus({ variables: { taskId, status } });
    refetch();
  };

  const onDelete = async (taskId) => {
    await deleteTask({ variables: { taskId } });
    refetch();
  };

  return (
    <div className="tasks-wrap">
      <div className="tasks-header">
        <div>
          <h2 className="tasks-title">{project.name}</h2>
          <p className="tasks-subtitle">Task board</p>
        </div>
      </div>

      <form className="tasks-form" onSubmit={onCreate}>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
        />
        <button className="btn btn-primary" type="submit">
          Add task
        </button>
      </form>

      {loading ? <p className="muted">Loading tasks...</p> : null}
      {error ? <p className="errorText">{error.message}</p> : null}

      <div className="columns">
        {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
          <div className="col" key={status}>
            <div className="col-head">
              <div className="col-title">
                {STATUS_OPTIONS.find((s) => s.value === status)?.label}
              </div>
              <div className="col-count">{grouped[status].length}</div>
            </div>

            <div className="col-body">
              {grouped[status].length === 0 ? (
                <div className="col-empty">No tasks</div>
              ) : null}

              {grouped[status].map((t) => (
                <div className="task-card" key={t.id}>
                  <div className="task-top">
                    <div className="task-title" title={t.title}>
                      {t.title}
                    </div>

                    <button
                      className="icon-btn danger"
                      title="Delete task"
                      onClick={() => onDelete(t.id)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="task-actions">
                    <select
                      className="select"
                      value={t.status}
                      onChange={(e) => onChangeStatus(t.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
