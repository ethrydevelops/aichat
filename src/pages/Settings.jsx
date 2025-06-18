import { useLocation } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';
import Cookies from 'universal-cookie';

export function Settings({ category }) {
    const { url } = useLocation();
    const location = useLocation();
    
    const cookies = new Cookies(null, { path: "/" });
    const authToken = cookies.get("gronk_tk");
    const instanceUrl = cookies.get("gronk_instance_url");
    
    const [activeCategory, setActiveCategory] = useState(category || 'general');
    
    useEffect(() => {
        if (category) {
            setActiveCategory(category );
        }
    }, [category]);

    const handleBackBtnClick = (e) => {
        if (e.target === e.currentTarget) {
            location.route("/");
        }
    };

    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            location.route("/");
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, []);

    const renderCategoryContent = () => {
        if(category == "general" || !category) {
            return <div>General settings content</div>;
        } else if(category == "models") {
            return <div>Models settings content</div>;
        } else if(category == "account") {
            return <div>Account settings content</div>;
        } else {
            location.route("/settings/general");
            return <div></div>;
        }
    };

    return (
        <div className="settings-page-overlay">
            <div className="settings-page-nav">
                nav
            </div>
            <div className="settings-page-content">
                content
                {renderCategoryContent()}
            </div>
        </div>
    );
}