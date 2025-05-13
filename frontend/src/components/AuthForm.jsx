import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../utils/api";

export default function AuthForm({ type }) {
  const isLogin = type === "login";
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    fullname: "",
    organization: "",
    workEmail: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && (!form.email || !form.password || !form.fullname || !form.username || !form.organization)) {
      setError("All fields except Work Email are required.");
      return;
    }

    if (isLogin && (!form.email || !form.password)) {
      setError("Email and Password are required.");
      return;
    }

    try {
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;

      const response  = await apiRequest(`/${isLogin ? "login" : "signup"}`, "POST", payload);

      if (isLogin) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded-lg"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isLogin ? "Login" : "Signup"}
      </h2>

      {!isLogin && (
        <>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-2 border mb-4 rounded"
          />
          <input
            type="text"
            name="fullname"
            placeholder="Full Name"
            value={form.fullname}
            onChange={handleChange}
            className="w-full p-2 border mb-4 rounded"
          />
          <input
            type="text"
            name="organization"
            placeholder="Organization"
            value={form.organization}
            onChange={handleChange}
            className="w-full p-2 border mb-4 rounded"
          />
          <input
            type="email"
            name="workEmail"
            placeholder="Work Email (Optional)"
            value={form.workEmail}
            onChange={handleChange}
            className="w-full p-2 border mb-4 rounded"
          />
        </>
      )}

      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full p-2 border mb-4 rounded"
      />
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full p-2 border mb-4 rounded"
      />
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
        {isLogin ? "Login" : "Signup"}
      </button>

      <p className="mt-4 text-center text-sm text-gray-600">
        {isLogin ? (
          <>
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Login
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
