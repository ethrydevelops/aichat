import { useState } from "preact/hooks";
import punycodeconv from "punycode/";
import "./Login.css";

export function Login() {
    const [instance, setInstance] = useState("https://localhost"); // TODO: replace with actual default instance URL
    const [instanceSetterVisible, setInstanceSetterVisible] = useState(false);

    function chooseNewLoginInstance(e) {
        e.preventDefault();
        /*const newInstance = prompt("Enter the URL of the instance you want to log in to:", instance);
        if (newInstance) {
            setInstance(newInstance);
        }*/
        setInstanceSetterVisible(!instanceSetterVisible);
    }

    function loginSubmit(e) {
        e.preventDefault();    
    }

	return (
		<div class="loginpage page-container">
            <div className="login-modal-thing-container">
                <div className="login-header-container">
                    <img src="/gronk.svg" alt="" className="login-logo us-none" />
                    <p className="m-0 p-0 login-header-subhead us-none">Welcome to Gronk Chat!</p>
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

                    <p className="login-form-instance-info us-none">You are creating an account on the instance hosted at <i className="login-form-instance-info-emphasis">{instance.includes("http://") ? <s className="text-danger"><b>http://</b></s> : null}{punycodeconv.toASCII(instance).replaceAll("https://", "").replaceAll("http://", "")}</i>. <a href="#" className="login-choose-another-instance-link" onClick={chooseNewLoginInstance}>Choose another instance.</a></p>
                
                    <div className={"choose-new-instance-url-login login-input-group " + (instanceSetterVisible ? "" : " d-none-important")}>                        
                        <label htmlFor="instanceurl" className="us-none">Instance URL</label>
                        
                        <input type="url" name="instanceurl" id="instanceurl" value={instance} onInput={(e) => {setInstance(e.target.value)}} className="input-form" required />

                        <p className="login-form-instance-info login-text-warning-spacing us-none">
                            <b>Please only use an instance you trust.</b>
                        </p>
                    </div>

                    <button type="submit" className="btn btn-full btn-primary">Sign Up</button>
                </form>
            </div>
		</div>
	);
}