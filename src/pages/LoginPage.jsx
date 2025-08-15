import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  FaFacebookF,
  FaTwitter,
  FaGoogle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "../styles/LoginPage.css";

const Login = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL; // your env variable
  const [values, setValues] = useState({ Email: "", Password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await axios.post(`${backendURL}/login`, {
        Email: values.Email,
        Password: values.Password,
      });

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Login successful!", { autoClose: 2000 });
        setTimeout(() => navigate("/dashboard"), 2200);
      } else {
        toast.error(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-background">
      <img src="/login-background.jpg" alt="Background" className="bg-gif" />
      <div className="content">
        <div className="left-message text-center text-md-start mb-4 mb-md-0">
          <h1>Welcome!</h1>
          <p>
            Effortlessly write, manage, and send custom emails all from one
            place. Choose your sender email, type your message, and hit send.
          </p>
        </div>

        <div className="right-box">
          <div className="login-box p-4">
            <h2 className="mb-3 text-center">Login</h2>
            <p className="text-muted text-center">
              Don’t have an account? <a href="#">Create your account</a>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Email address</label>
                <input
                  type="email"
                  name="Email"
                  className="form-control"
                  placeholder="Enter email"
                  value={values.Email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3 position-relative">
                <label>Password</label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="Password"
                    className="form-control"
                    placeholder="Enter password"
                    value={values.Password}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div className="mt-2">
                  <a href="#">Forgot Password?</a>
                </div>
              </div>

              <button className="btn btn-danger w-100 mt-3" type="submit">
                LOGIN
              </button>

              <div className="text-center mt-3">or login with</div>
              <div className="d-flex justify-content-center gap-3 mt-2">
                <button className="btn btn-primary" type="button">
                  <FaFacebookF />
                </button>
                <button className="btn btn-info text-white" type="button">
                  <FaTwitter />
                </button>
                <button className="btn btn-danger" type="button">
                  <FaGoogle />
                </button>
              </div>

              <div className="text-center mt-3">
                <p className="text-muted">
                  New here? <a href="#">Sign up</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default Login;
