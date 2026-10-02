import { useState } from "react";
import { supabase } from "../lib/supabase";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        setError("Correo o contraseña incorrectos");
        console.log("LOGIN ERROR:", error);
    }

    setLoading(false);
};

return (
    <div>
        <h1>Callback Clinic</h1>

    <form onSubmit={handleLogin}>
        <div>
            <label>Email</label>

        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
        />
        </div>

        <div>
            <label>Password</label>

        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
        />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
    </form>
    </div>
    );
}

export default Login;