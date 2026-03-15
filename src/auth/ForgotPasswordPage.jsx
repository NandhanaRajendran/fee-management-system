import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    alert("Password reset link sent (demo)");
  }

  return (
    <div className="login-container">
      <h2>Forgot Password</h2>

      <form onSubmit={handleSubmit}>
        <label>Email</label>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
}