import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";

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

export default function TasksPage({ project, onBack }) {
  const [title, setTitle] = useState("");

  const { data, loading, error, refetch } = useQuery(TASKS, {
    variables: { projectId: project.id },
  });

  const [createTask] = useMutation(CREATE_TASK);
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);
  const [deleteTask] = useMutation(DELETE_TASK);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTask({ variables: { projectId: project.id, title } });
    setTitle("");
    refetch();
  };

  const cycleStatus = async (task) => {
    const next =
      task.status === "TODO"
        ? "IN_PROGRESS"
        : task.status === "IN_PROGRESS"
        ? "DONE"
        : "TODO";

    await updateTaskStatus({ variables: { taskId: task.id, status: next } });
    refetch();
  };

  const onDelete = async (taskId) => {
    await deleteTask({ variables: { taskId } });
    refetch();
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "Arial" }}>
      <button onClick={onBack}>← Back</button>
      <h2 style={{ marginTop: 12 }}>Tasks — {project.name}</h2>

      <form
        onSubmit={onCreate}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          style={{ flex: 1 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task title"
        />
        <button type="submit">Add</button>
      </form>

      {loading ? <p>Loading tasks...</p> : null}
      {error ? <p style={{ color: "red" }}>{error.message}</p> : null}

      <ul>
        {(data?.tasks || []).map((t) => (
          <li key={t.id} style={{ marginBottom: 10 }}>
            <b>{t.title}</b> — {t.status}{" "}
            <button onClick={() => cycleStatus(t)}>Change status</button>{" "}
            <button onClick={() => onDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
