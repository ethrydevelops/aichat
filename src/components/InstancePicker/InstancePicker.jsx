import { useState } from "preact/hooks";
import punycodeconv from "punycode/";
import Cookies from "universal-cookie";
import { toast } from "react-hot-toast";

export function InstancePicker({ instance, setInstance, actionType = "login" }) {
    const [instanceSetterVisible, setInstanceSetterVisible] = useState(false);
    const cookies = new Cookies(null, { path: "/" });

    function chooseNewInstance(e) {
        e.preventDefault();
        setInstanceSetterVisible(!instanceSetterVisible);
    }

    function saveInstanceUrl() {
        cookies.set("gronk_instance_url", instance, { path: "/" });
        toast.success("Instance URL saved successfully!");
    }

    const actionText = actionType === "login" ? "logging in" : "creating an account";

    return (
        <>
            <p className="login-form-instance-info us-none">
                You are {actionText} on the instance hosted at{" "}
                <i className="login-form-instance-info-emphasis">
                    {instance.includes("http://") ? (
                        <s className="text-danger"><b>http://</b></s>
                    ) : null}
                    {punycodeconv.toASCII(instance).replaceAll("https://", "").replaceAll("http://", "")}
                </i>
                .{" "}
                <a href="#" className="login-choose-another-instance-link" onClick={chooseNewInstance}>
                    Choose another instance.
                </a>
            </p>

            <div className={"choose-new-instance-url-login login-input-group " + (instanceSetterVisible ? "" : " d-none-important")}>
                <label htmlFor="instanceurl" className="us-none">Instance URL</label>
                
                <div className="login-instance-save-group-flex">
                    <input 
                        type="url" 
                        name="instanceurl" 
                        id="instanceurl" 
                        defaultValue={instance} 
                        onInput={(e) => setInstance(e.target.value)} 
                        className="input-form" 
                        required 
                    />

                    <button 
                        type="button" 
                        className="btn btn-primary h-100 square" 
                        title="Save Instance URL as a cookie" 
                        onClick={saveInstanceUrl}
                    >
                        <span className="material-symbols-rounded">save</span>
                    </button>
                </div>

                <p className="login-form-instance-info-w text-danger login-text-warning-spacing us-none">
                    <span className="material-symbols-rounded">warning</span> Please only use an instance you trust.
                </p>
            </div>
        </>
    );
}
