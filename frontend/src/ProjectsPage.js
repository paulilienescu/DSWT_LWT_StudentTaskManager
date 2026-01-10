import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import TasksPage from "./TasksPage";

const PROJECTS = gql`
  query Projects {
    projects {
      id
      name
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
  const [selected, setSelected] = useState(null); // {id,name} or null

  const { data, loading, error, refetch } = useQuery(PROJECTS);
  const [createProject] = useMutation(CREATE_PROJECT);
  const [deleteProject] = useMutation(DELETE_PROJECT);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createProject({ variables: { name } });
    setName("");
    refetch();
  };

  const onDelete = async (id) => {
    await deleteProject({ variables: { id } });
    if (selected?.id === id) setSelected(null);
    refetch();
  };

  if (selected) {
    return <TasksPage project={selected} onBack={() => setSelected(null)} />;
  }

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p style={{ color: "red" }}>{error.message}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>Your Projects</h2>

      <form
        onSubmit={onCreate}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          style={{ flex: 1 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {data.projects.map((p) => (
          <li key={p.id} style={{ marginBottom: 10 }}>
            <button onClick={() => setSelected(p)} style={{ marginRight: 8 }}>
              Open
            </button>
            <b>{p.name}</b>{" "}
            <button onClick={() => onDelete(p.id)} style={{ marginLeft: 8 }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
