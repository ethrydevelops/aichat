import { useEffect, useState } from "preact/hooks";
import "./Login.css";
import Cookies from "universal-cookie";
import { toast } from "react-hot-toast";
import { useLocation } from "preact-iso";
import { InstancePicker } from "../../components/InstancePicker/InstancePicker.jsx";

export function Login() {
    const cookies = new Cookies(null, { path: "/" });

    const [instance, setInstance] = useState(__DEFAULT_INSTANCE_URL__);

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

    function loginSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get("username");
        const password = formData.get("password");

        // validate the instance URL
        if (!instance.startsWith("http://") && !instance.startsWith("https://")) {
            toast.error("Instance URL must start with http:// or https://");
            return;
        }

        // send the login request, then get token
        fetch(`${instance}/accounts/login`, {
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
                if(response.status === 401) {
                    toast.error("Invalid username or password.");
                    throw new Error("Invalid credentials");
                } else {
                    toast.error("Login failed.");
                    throw new Error("Login failed");
                }
            }
            return response.json();
        }).then(data => {
            // save the token in cookies for 30 days
            cookies.set("gronk_tk", data.session.string, { path: "/", maxAge: 30 * 24 * 60 * 60 });
            cookies.set("gronk_instance_url", instance, { path: "/", maxAge: 30 * 24 * 60 * 60 }); // save the instance URL in cookies

            toast.success("You are now logged in!");
            
            location.route("/"); // redirect to home page
        })

    }

    return (
        <div class="loginpage page-container">
            <div className="login-modal-thing-container">
                <div className="login-header-container">
                    <img src="/gronk.svg" alt="" className="login-logo us-none" />
                    <p className="m-0 p-0 login-header-subhead us-none">Welcome back to Gronk!</p>
                </div>

                <form className="login-form" action="/" method="GET" onSubmit={loginSubmit}>
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
                        actionType="login" 
                    />

                    <button type="submit" className="btn btn-full btn-primary">Login</button>
                    <a href="/signup" className="btn btn-full btn-secondary">Create an account</a>
                </form>
            </div>
        </div>
    );
}