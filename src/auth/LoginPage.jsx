import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {

  const navigate = useNavigate();

  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");

  function handleLogin(e){
    e.preventDefault();

    if(username === "mess-sec" && password === "1234"){
      localStorage.setItem("role","mess");
      navigate("/mess/dashboard");
    }

    else if(username === "admin" && password === "1234"){
      localStorage.setItem("role","admin");
      navigate("/admin/dashboard");
    }

    else{
      alert("Invalid username or password");
    }
  }

  return(

    <div className="login-wrapper">

      <div className="login-card">

        <h2>Mess Management System</h2>

        <form onSubmit={handleLogin}>

          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        <p
          className="forgot-link"
          onClick={()=>navigate("/forgot-password")}
        >
          Forgot Password?
        </p>

      </div>

    </div>

  );
}