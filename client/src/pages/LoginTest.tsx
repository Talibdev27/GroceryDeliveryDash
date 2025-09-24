import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginTest() {
  const { login, user } = useAuth();
  const [username, setUsername] = useState("superadmin");
  const [password, setPassword] = useState("SuperAdmin123!");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleTestLogin = async () => {
    setLoading(true);
    setResult("");
    
    try {
      console.log("Attempting login with:", { username, password });
      const success = await login(username, password);
      console.log("Login result:", success);
      
      if (success) {
        setResult("✅ Login successful!");
      } else {
        setResult("❌ Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button
          onClick={handleTestLogin}
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Login"}
        </button>
        
        {result && (
          <div className={`p-3 rounded ${result.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {result}
          </div>
        )}
        
        {user && (
          <div className="p-3 bg-blue-100 text-blue-800 rounded">
            <h3 className="font-bold">Current User:</h3>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
}
