import Cookies from "universal-cookie";
import { useLocation } from "preact-iso";

export async function Logout() {
    const cookies = new Cookies(null, { path: "/" });
    const location = useLocation();

    // if logged in, delete the session
    const authToken = cookies.get("gronk_tk");
    const instanceUrl = cookies.get("gronk_instance_url");
    if (!!authToken && !!instanceUrl) {
        await fetch(instanceUrl + "/accounts/logout", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + authToken,
                "Content-Type": "application/json"
            }
        }).catch(() => {});
    }
    
    cookies.remove("gronk_tk", { path: "/" });
    window.location.href = "/login";
}