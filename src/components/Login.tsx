import { useState } from "react";
import { supabase } from "../lib/supabase";
import esthetixDentalLogo from "../assets/esthetixDentalSidebar.png";
import "../styles/Login.css";

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
        setError("Incorrect email or password");
        console.log("LOGIN ERROR:", error);
    }

    setLoading(false);
};

return (
    <main className="login-page">
        <section className="login-card">
            <header className="login-header">
                <img
                    className="login-logo"
                    src={esthetixDentalLogo}
                    alt="Esthetix Dental Spa"
                />
                <h1>Welcome</h1>
            </header>

    <form className="login-form" onSubmit={handleLogin}>
        <div className="login-field">
            <label>Email</label>

        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jhondoe@email.com"
            required
        />
        </div>

        <div className="login-field">
            <label>Password</label>

        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
        />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button className="login-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
        </button>
    </form>
        </section>
    </main>
    );
}

export default Login;
