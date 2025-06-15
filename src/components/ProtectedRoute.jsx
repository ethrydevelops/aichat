import { useLocation } from "preact-iso";
import Cookies from "universal-cookie";
import { useEffect } from "preact/hooks";

const ProtectedRoute = ({ children }) => {
    const cookies = new Cookies(null, { path: "/" });
    const authToken = cookies.get("gronk_tk");

    const location = useLocation();
    const { url } = useLocation();

    useEffect(() => {
        if (!authToken) {
            location.route("/login");
        }
    }, [authToken, url]);

    return authToken ? children : null;
};

export default ProtectedRoute;