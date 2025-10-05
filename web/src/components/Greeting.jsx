import { useEffect, useState } from 'react';
import Cookies from 'universal-cookie';

function Greeting() {
    const cookies = new Cookies();

    const [username, setUsername] = useState(cookies.get('askllm_usernameoverride') || "");

    useEffect(() => {
        // get username from account if logged in
        if(cookies.get("askllm_tk")) {
            fetch((import.meta.env.VITE_API_URL.replace(/\/$/, "")) + "/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${cookies.get("askllm_tk")}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.user.username && !cookies.get('askllm_usernameoverride')) {
                    setUsername(data.user.username);
                }
            });
        }
    }, []);

    return (
        <>How can I help you{username ? (", " + username) : ""}?</>
    );
}

export default Greeting;