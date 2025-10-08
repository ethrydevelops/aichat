import { useEffect } from "react";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router";

export default function Logout() {
    const cookies = new Cookies(null, { path: "/" });
    const navigate = useNavigate();

    useEffect(() => {
        const tk = cookies.get("askllm_tk");
        if (!tk) {
            navigate("/login");
            return;
        }

        fetch(`${import.meta.env.VITE_API_URL}accounts/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tk}`
            },
        }).catch((err) => {
            console.error("Logout error:", err);
        })
        
        cookies.remove("askllm_tk", { path: "/" });
        cookies.remove("askllm_favourite_model", { path: "/" });

        navigate("/login");
    }, []);

    return (
        <></>
    );
}