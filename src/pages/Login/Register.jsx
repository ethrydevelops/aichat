import { useEffect, useState } from "preact/hooks";
import "./Login.css";
import Cookies from "universal-cookie";
import { toast } from "react-hot-toast";
import { useLocation } from "preact-iso";
import { InstancePicker } from "../../components/InstancePicker/InstancePicker.jsx";

export function Register() {
    const cookies = new Cookies(null, { path: "/" });

    const [instance, setInstance] = useState("https://localhost"); // TODO: replace with actual default instance URL

    const location = useLocation();

    useEffect(() => {
        // check if the instance URL is stored in cookies
        const storedInstance = cookies.get("gronk_instance_url");
        if (storedInstance) {
            setInstance(storedInstance);
        }

        // check if already logged in
        const authToken = cookies.get("gronk_tk");
        if (!!authToken) {
            toast.error("You are already logged in!");
            location.route("/");
        }
    }, []);

    function signupSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get("username");
        const password = formData.get("password");

        // validate the instance URL
        if (!instance.startsWith("http://") && !instance.startsWith("https://")) {
            toast.error("Instance URL must start with http:// or https://");
            return;
        }

        // send the signup request
        fetch(`${instance}/accounts/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        }).then(response => {
            if (!response.ok) {
                if(response.status === 409) {
                    toast.error("An account with this username already exists.");
                    throw new Error("User already exists");
                } else if(response.status === 400) {
                    toast.error("Invalid registration data.");
                    throw new Error("Invalid data");
                } else {
                    toast.error("Account creation failed.");
                    throw new Error("Signup failed");
                }
            }
            return response.json();
        }).then(data => {
            // account created, now login
            toast.success("Account created successfully!");
            
            return fetch(`${instance}/accounts/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });
        }).then(response => {
            if (!response.ok) {
                if(response.status === 401) {
                    throw new Error("Login failed after registration");
                } else {
                    throw new Error("Login failed after registration");
                }
            }
            return response.json();
        }).then(data => {
            // save the token in cookies for 30 days
            cookies.set("gronk_tk", data.session.string, { path: "/", maxAge: 30 * 24 * 60 * 60 });
            cookies.set("gronk_instance_url", instance, { path: "/", maxAge: 30 * 24 * 60 * 60 }); // save the instance URL in cookies
            
            location.route("/"); // redirect to home page
        }).catch(error => {
            console.error("Signup/Login error:", error);
            
            if (error.message.includes("Login failed after registration")) {
                location.route("/login");
            }
        });
    }

    return (
        <div class="loginpage page-container">
            <div className="login-modal-thing-container">
                <div className="login-header-container">
                    <img src="/gronk.svg" alt="" className="login-logo us-none" />
                    <p className="m-0 p-0 login-header-subhead us-none">Join Gronk to start chatting!</p>
                </div>

                <form className="login-form" action="/" method="GET" onSubmit={signupSubmit}>
                    <div className="login-input-group">
                        <label htmlFor="username" className="us-none">Username</label>
                        <input type="text" name="username" id="username" placeholder="Username" className="input-form" required />
                    </div>
                    
                    <div className="login-input-group">
                        <label htmlFor="password" className="us-none">Password</label>
                        <input type="password" name="password" id="password" placeholder="********" className="input-form" required />
                    </div>

                    <InstancePicker 
                        instance={instance} 
                        setInstance={setInstance} 
                        actionType="signup" 
                    />

                    <button type="submit" className="btn btn-full btn-primary">Create Account</button>
                    <a href="/login" className="btn btn-full btn-secondary">Already have an account?</a>
                </form>
            </div>
        </div>
    );
}