import { useEffect, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";

const ME = gql`
  query Me {
    me {
      id
      username
    }
  }
`;

const REGISTER = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password)
  }
`;

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  const isLogin = mode === "login";

  const [doRegister, { loading: loadingRegister }] = useMutation(REGISTER);
  const [doLogin, { loading: loadingLogin }] = useMutation(LOGIN);

  const {
    data,
    loading: meLoading,
    error: meError,
  } = useQuery(ME, {
    skip: !token,
  });

  const loading = loadingRegister || loadingLogin;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const variables = { username, password };

      if (isLogin) {
        const res = await doLogin({ variables });
        const t = res.data.login;
        localStorage.setItem("token", t);
        setToken(t);
        setMsg(`Logged in!`);
      } else {
        const res = await doRegister({ variables });
        const t = res.data.register;
        localStorage.setItem("token", t);
        setToken(t);
        setMsg(`Registered!`);
      }
    } catch (err) {
      setMsg(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUsername("");
    setPassword("");
    setMsg("Logged out.");
    setMode("login");
  };

  // If logged in, show simple logged-in view
  if (token) {
    return (
      <div style={{ maxWidth: 360, margin: "60px auto", fontFamily: "Arial" }}>
        <h2>You are logged in</h2>

        {meLoading ? <p>Loading user...</p> : null}
        {meError ? <p>Error: {meError.message}</p> : null}

        {data?.me ? (
          <p>
            <b>User:</b> {data.me.username} (id: {data.me.id})
          </p>
        ) : !meLoading && !meError ? (
          <p>No user returned (token invalid?)</p>
        ) : null}

        <button
          style={{ width: "100%", padding: 10, marginTop: 10 }}
          onClick={logout}
        >
          Logout
        </button>

        {msg ? <p style={{ marginTop: 12 }}>{msg}</p> : null}
      </div>
    );
  }

  // Otherwise show login/register form
  return (
    <div style={{ maxWidth: 360, margin: "60px auto", fontFamily: "Arial" }}>
      <h2>{isLogin ? "Login" : "Register"}</h2>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => {
            setMode("login");
            setMsg("");
          }}
          disabled={isLogin}
        >
          Login
        </button>{" "}
        <button
          onClick={() => {
            setMode("register");
            setMsg("");
          }}
          disabled={!isLogin}
        >
          Register
        </button>
      </div>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Username</label>
          <input
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </div>

        <button
          style={{ width: "100%", padding: 10 }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Create account"}
        </button>
      </form>

      {msg ? <p style={{ marginTop: 12 }}>{msg}</p> : null}
    </div>
  );
}
