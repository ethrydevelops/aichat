import { useEffect, useState } from "react";
import "./Login.css";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router";
import { Link } from "react-router";

export default function Login({ authType }) {
    const cookies = new Cookies(null, { path: "/" });

    const instance = import.meta.env.VITE_API_URL;

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        // check if already logged in
        const authToken = cookies.get("askllm_tk");
        if (!!authToken) {
            //alert("You are already logged in!");
            navigate("/");
            return;
        }
    }, []);

    function loginSubmit(e) {
        e.preventDefault();

        // send the login request, then get token
        fetch(`${instance}accounts/${authType == "login" ? "login" : "create"}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        }).then(response => {
            if (!response.ok) {
                if(response.status === 401 && authType == "login") {
                    alert("Invalid email or password.");
                    throw new Error("Invalid credentials");
                } else if(response.status === 409 && authType == "signup") {
                    alert("Account already exists.");
                    throw new Error("Account already exists");
                } else {
                    alert("Login failed.");
                    throw new Error("Login failed");
                }
            }
            return response.json();
        }).then(data => {
            if(authType == "login") {
                cookies.set("askllm_tk", data.session.token, { path: "/", maxAge: 30 * 24 * 60 * 60 });

                navigate("/");
            } else {
                fetch(`${instance}accounts/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }).then(response => {
                    if (!response.ok) {
                        if(response.status === 401) throw new Error("Error while logging in")
                    }
                    return response.json();
                }).then(data => {
                    cookies.set("askllm_tk", data.session.token, { path: "/", maxAge: 45 * 24 * 60 * 60 });
                    navigate("/");
                }).catch(err => {
                    console.error("Error logging in after signup:", err);
                    alert("There was an error logging in after signup. Please try logging in manually.");
                });
            }
        })

    }

    return (
        <div className="loginpage loginpage-container">
            <div className="login-modal-thing-container">
                <div className="login-header-container">
                    <img src="/logo.svg" alt="" className="login-logo us-none" />
                    <p className="m-0 p-0 login-header-subhead us-none">Welcome { authType == "login" ? "back " : "" }to AskLLM!</p>
                </div>

                <form className="login-form" action="/" method="GET" onSubmit={loginSubmit}>
                    <div className="login-input-group">
                        <label htmlFor="email" className="us-none">Email</label>
                        <input type="email" name="email" id="email" placeholder="Email" className="input-form form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    
                    <div className="login-input-group">
                        <label htmlFor="password" className="us-none">Password</label>
                        <input type="password" name="password" id="password" placeholder="********" className="input-form form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    
                    <button type="submit" className="btn btn-full btn-auth-primary">{authType == "login" ? "Sign in" : "Create account"}</button>

                    {authType == "login" ? (<Link to="/signup" className="link-secondary ul-none-h login-footer-link">Create an account</Link>) : (
                        <Link to="/login" className="link-secondary ul-none-h login-footer-link">Already have an account? Sign in</Link>
                    )}
                </form>
            </div>
        </div>
    );
}