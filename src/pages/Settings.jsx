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
            setActiveCategory(category);
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
    
    const categories = [
        { id: 'account', name: 'Account' },
        { id: 'security', name: 'Security' },
        { id: 'models', name: 'Keys' },
        { id: 'github', name: 'GitHub Repo' }
    ];

    const renderCategoryContent = () => {
        switch (activeCategory) {
            case 'general':
                return <div>General settings content</div>;
            case 'security':
                return <div>Models settings content</div>;
            case 'models':
                return <div>Account settings content</div>;
            default:
                return <div>Select a category</div>;
        }
    };

    return (
        <div className="settings-page-overlay">

        </div>
    );
}