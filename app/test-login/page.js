"use client";

export default function TestLoginPage() {
  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "admin123" }),
      });

      const data = await res.json();
      alert(JSON.stringify(data));
      console.log(data);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Fetch error: " + err.message);
    }
  };

  return (
    <div>
      <h1>Test Login</h1>
      <button onClick={handleLogin}>Login as admin</button>
    </div>
  );
}
