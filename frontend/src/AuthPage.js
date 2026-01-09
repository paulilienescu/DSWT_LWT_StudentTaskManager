import { useEffect, useMemo, useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";

import "./styles/page.css";
import "./styles/AuthPage.css";

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

const ME = gql`
  query Me {
    me {
      id
      username
    }
  }
`;

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState(null);

  // field errors
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    password2: "",
    general: "",
  });

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const isLogin = mode === "login";

  const [doRegister, { loading: loadingRegister }] = useMutation(REGISTER);
  const [doLogin, { loading: loadingLogin }] = useMutation(LOGIN);

  const loading = loadingRegister || loadingLogin;

  const {
    data,
    loading: meLoading,
    error: meError,
  } = useQuery(ME, {
    skip: !token,
  });

  const title = isLogin ? "Welcome back" : "Create account";
  const subtitle = isLogin ? "Sign in to your account" : "Create your account";

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setMsg("Logged out.");
    setMode("login");
    setEmail("");
    setPassword("");
    setPassword2("");
    setShowPass(false);
    setShowPass2(false);
    setErrors({ email: "", password: "", password2: "", general: "" });
  };

  const clearErrors = () =>
    setErrors({ email: "", password: "", password2: "", general: "" });

  const validate = () => {
    const e = { email: "", password: "", password2: "", general: "" };

    const trimmed = email.trim();
    if (!trimmed) e.email = "Email is required.";
    else if (!isValidEmail(trimmed))
      e.email = "Please enter a valid email address.";

    if (!password) e.password = "Password is required.";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters.";

    if (!isLogin) {
      if (!password2) e.password2 = "Please confirm your password.";
      else if (password2 !== password) e.password2 = "Passwords do not match.";
    }

    setErrors(e);
    return !e.email && !e.password && !e.password2;
  };

  const mapBackendError = (rawMsg) => {
    if (rawMsg.includes("Invalid credentials"))
      return { password: "Wrong email or password." };
    if (rawMsg.includes("Username already exists"))
      return { email: "Email already exists." };
    if (rawMsg.includes("Password must be at least 6"))
      return { password: "Password must be at least 6 characters." };
    if (rawMsg.includes("Username is required"))
      return { email: "Email is required." };
    return { general: rawMsg || "Something went wrong." };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    clearErrors();

    if (!validate()) return;

    try {
      const username = email.trim();

      if (isLogin) {
        const res = await doLogin({ variables: { username, password } });
        const t = res.data.login;
        localStorage.setItem("token", t);
        setToken(t);
        setMsg("Logged in!");
      } else {
        const res = await doRegister({ variables: { username, password } });
        const t = res.data.register;
        localStorage.setItem("token", t);
        setToken(t);
        setMsg("Registered!");
      }
    } catch (err) {
      const mapped = mapBackendError(err.message);
      setErrors((prev) => ({ ...prev, ...mapped }));
    }
  };

  if (token) {
    return (
      <div className="page-bg">
        <div className="auth-card">
          <h2 className="auth-title">You are logged in</h2>
          <div className="auth-subtitle" style={{ marginBottom: 12 }}>
            {meLoading
              ? "Loading user..."
              : meError
              ? `Error: ${meError.message}`
              : data?.me
              ? `User: ${data.me.username} (id: ${data.me.id})`
              : "No user returned (token invalid?)"}
          </div>

          <button className="auth-primaryBtn" onClick={logout}>
            Logout
          </button>

          {msg ? <div className="auth-info">{msg}</div> : null}
        </div>
      </div>
    );
  }

  const emailInputClass = `auth-input ${errors.email ? "error" : ""}`;
  const passInputClass = `auth-input hasEye ${errors.password ? "error" : ""}`;
  const pass2InputClass = `auth-input hasEye ${
    errors.password2 ? "error" : ""
  }`;

  return (
    <div className="page-bg">
      <div className="auth-card">
        <h2 className="auth-title">{title}</h2>
        <div className="auth-subtitle">{subtitle}</div>

        <div className="auth-toggleRow">
          <button
            type="button"
            className={`auth-toggleBtn ${isLogin ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setMsg("");
              clearErrors();
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={`auth-toggleBtn ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setMsg("");
              clearErrors();
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label className="auth-label">Email</label>
          <input
            className={emailInputClass}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: "" }));
            }}
            placeholder="you@example.com"
            autoComplete="username"
          />
          {errors.email ? (
            <div className="auth-errorText">{errors.email}</div>
          ) : null}

          <label className="auth-label">Password</label>
          <div className="auth-passRow">
            <input
              className={passInputClass}
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: "" }));
              }}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <button
              type="button"
              className="auth-eyeBtn"
              onClick={() => setShowPass((v) => !v)}
              aria-label="Toggle password visibility"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password ? (
            <div className="auth-errorText">{errors.password}</div>
          ) : null}

          {!isLogin ? (
            <>
              <label className="auth-label">Confirm password</label>
              <div className="auth-passRow">
                <input
                  className={pass2InputClass}
                  type={showPass2 ? "text" : "password"}
                  value={password2}
                  onChange={(e) => {
                    setPassword2(e.target.value);
                    if (errors.password2)
                      setErrors((p) => ({ ...p, password2: "" }));
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eyeBtn"
                  onClick={() => setShowPass2((v) => !v)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showPass2 ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password2 ? (
                <div className="auth-errorText">{errors.password2}</div>
              ) : null}
            </>
          ) : null}

          {errors.general ? (
            <div className="auth-errorText" style={{ marginTop: 12 }}>
              {errors.general}
            </div>
          ) : null}

          <button className="auth-primaryBtn" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign in"
              : "Create account"}
          </button>

          {msg ? <div className="auth-info">{msg}</div> : null}
        </form>
      </div>
    </div>
  );
}
