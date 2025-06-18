import { useLocation } from 'preact-iso';
import { useEffect, useState } from 'preact/hooks';
import Cookies from 'universal-cookie';
import { toast } from 'react-hot-toast';

export function Settings({ category }) {
    const { url } = useLocation();
    const location = useLocation();
    
    const cookies = new Cookies(null, { path: "/" });
    const authToken = cookies.get("gronk_tk");
    const instanceUrl = cookies.get("gronk_instance_url");

    const [models, setModels] = useState([]);
    const [titleModel, setTitleModel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [settingsNavVisible, setSettingsNavVisible] = useState(true);
    
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

    async function useTemplate(template) {
        if(template === "openrouter") {
            document.getElementById("model_url").value = "https://openrouter.ai/api/v1/chat/completions";
            document.getElementById("authorization").value = "Bearer (key starting with sk-or-v1... goes here)";
        } else if(template === "ollama") {
            const ipResponse = await fetch("https://api.ipify.org");
            const ip = await ipResponse.text();

            document.getElementById("model_url").value = "http://"+ip+":11434/api/chat";
            document.getElementById("authorization").value = "";
        }
    }
    const fetchModels = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${instanceUrl}/models`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + authToken,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                toast.error('Failed to fetch models: ' + response.statusText);
                throw new Error('Failed to fetch models');
            }
            
            const data = await response.json();

            let models = [];
            if(data.models && Array.isArray(data.models)) {
                models = data.models;
                models.sort((a, b) => b.usage_count - a.usage_count); // sort by most messages -> least
            }

            setTitleModel(data.titles?.uuid || null);
            setModels(data.models || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {    
        if (instanceUrl) {
          fetchModels();
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
    }, []);

    function editModelInfo(newValue, field, uuid) {
        if(newValue == null) {
            // cancelled
            return false;
        }
        
        if((newValue.trim() === "") && (field !== "authorization")) {
            toast.error("Please provide a valid value.");
            return false;
        }

        const data = {};
        data[field] = newValue.trim();

        fetch(`${instanceUrl}/models/${uuid}`, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + authToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to update model");
            }
            return response.json();
        })
        .then(data => {
            setModels(models.map(model => model.uuid === uuid ? { ...model, [field]: newValue.trim() } : model));
            toast.success("Model updated successfully!");
        })
        .catch(error => {
            console.error("Error updating model:", error);
            toast.error("Failed to update model: " + error.message);
        });
    }

    function submitNewModel(e) {
        e.preventDefault();

        const formdata = new FormData(e.target);
        const modelName = formdata.get("model_name").toString().trim();
        const modelUrl = formdata.get("model_url").toString().trim();
        const modelModel = formdata.get("model_model").toString().trim();
        let authorization = formdata.get("authorization").toString().trim();

        if (!modelName || !modelUrl || !modelModel) {
            toast.error("Please fill in all fields.");
            return;
        }

        if(authorization == "") {
            authorization = null;
        }

        const modelData = {
            name: modelName,
            url: modelUrl,
            model: modelModel,
            authorization: authorization
        };

        fetch(`${instanceUrl}/models`, {
            method: "POST",
            headers: {
				"Authorization": "Bearer " + authToken,
				"Content-Type": "application/json"
			},
            body: JSON.stringify(modelData)
        })
        .then(resp => resp.json())
        .then(data => {
            if(data.error) {
                throw new Error(data.error);
            }

            toast.success("Model added successfully!");

            // reset models
            setModels([]);
            fetchModels();
            e.target.reset(); // reset the form
        })
        .catch((error) => {
            console.error("Error adding model:", error);
            toast.error("Failed to add model: " + error);
        });
    }

    function deleteModel(uuid) {
        fetch(`${instanceUrl}/models/${uuid}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + authToken,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to delete model");
            }
            return response.json();
        })
        .then(() => {
            setModels(models.filter(model => model.uuid !== uuid));
            toast.success("Model deleted successfully!");
        })
        .catch(error => {
            console.error("Error deleting model:", error);
            toast.error("Failed to delete model: " + error.message);
        });
    }

    function setTitleGenerationModel(e) {
        e.preventDefault();
        const formdata = new FormData(e.target);
        const titleGenerationModel = formdata.get("title_generation_model").toString().trim();

        if (!titleGenerationModel && titleGenerationModel !== "") {
            toast.error("Please select a model for title generation.");
            return;
        }

        fetch(`${instanceUrl}/models/title`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + authToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ modelUuid: (titleGenerationModel == "" ? null : titleGenerationModel) })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to set title generation model");
            }
            return response.json();
        })
        .then(data => {
            toast.success("Title generation model set successfully!");
        })
        .catch(error => {
            console.error("Error setting title generation model:", error);
            toast.error("Failed to set title generation model: " + error.message);
        });
    }

    const renderCategoryContent = () => {
        if(category == "general" || !category) {
            return <div>
                <h1>General</h1>
                <h2 className="m-0 p-0">Instance</h2>
                <p className="text-secondary">You must <a href="/logout">log out</a> to sign into another Gronk instance.</p>                
                <p className="login-form-instance-info-w login-form-instance-info-w-left text-danger login-text-warning-spacing us-none">
                    <span className="material-symbols-rounded">warning</span> Please only use an instance you trust.
                </p>
                
            </div>;
        } else if(category == "models") {
            return (<div>
                <h1 className="mb-0 pb-0">Models</h1>
                <p>Configure models that will be used with Gronk. Gronk supports API routes from  <a href="https://openrouter.ai/" target="_blank">OpenRouter (hosted)</a>, and <a href="https://ollama.com/" target="_blank">Ollama (self-hosted, advanced)</a> or any Chat Completions API-compatible service.</p>

                <div>
                    <form action="/" method="post" onSubmit={submitNewModel} className="add-settings-page-model-form">
                        <h2 className="m-0 p-0 mb-1">Add new model</h2>

                        <p>Templates: <a href="javascript:void(0)" onClick={(e) => useTemplate("openrouter")} className="blue-link">OpenRouter</a>, <a href="javascript:void(0)" onClick={(e) => useTemplate("ollama")} className="blue-link">Local Ollama (port-forwarded)</a></p>

                        <br />
                        
                        <div className="settings-model-form-grid">
                            <div className="settings-model-input-group">
                                <label htmlFor="model_name" className="us-none">Nickname: <span className="text-danger">*</span></label>
                                <input type="text" name="model_name" id="model_name" placeholder="Deepseek R1" className="input-form" autoComplete="off" required />
                            </div>
                        </div>

                        <hr className="hr-tiny-dash" />

                        <div className="settings-model-form-grid">
                            <div className="settings-model-input-group">
                                <label htmlFor="model_url" className="us-none">API URL: <span className="text-danger">*</span></label>
                                <input type="url" name="model_url" id="model_url" placeholder="https://openrouter.ai/api/v1/chat/completions" className="input-form" autoComplete="off" required />
                            </div>
                            <div className="settings-model-input-group">
                                <label htmlFor="model_model" className="us-none">Model: <span className="text-danger">*</span></label>
                                <input type="text" name="model_model" id="model_model" placeholder="deepseek/deepseek-r1" className="input-form" autoComplete="off" required />
                            </div>
                            <div className="settings-model-input-group">
                                <label htmlFor="authorization" className="us-none">Authorization: <a href="https://openrouter.ai/settings/keys" className="blue-link" target="_blank"><small>(Create an OpenRouter key)</small></a></label>
                                <input type="text" name="authorization" id="authorization" autoComplete="off" placeholder="Bearer sk-or-v1-abc..." className="input-form" />
                            </div>
                        </div>

                        <hr className="hr-tiny-dash opacity-0" />

                        <div className="flex-wide-center">
                            <button type="submit" className="btn btn-primary btn-wide">Add</button>
                        </div>
                    </form>
                </div>     

                <h2>Configure ({models.length} models)</h2>      

                {loading ? <div>Loading models...</div> : ""}
                {error ? <div>Error: {error}</div> : ""}

                <div className="configuration-table">
                    <table className="models-table">
                        <thead>
                            <tr>
                                <th>Nickname</th>
                                <th>Model</th>
                                <th>URL</th>
                                <th>Authorization</th>
                                <th>Messages</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {models.map((model) => (
                                <tr key={model.uuid}>
                                    <td>
                                        <div className="model-table-td-flex">
                                            {model.name}
                                            <a href="javascript:void();" className="delete-text-btn" onClick={() => {editModelInfo(window.prompt("Change model URL:", model.name), 'name', model.uuid);}} title="Edit model name" aria-label="Edit model name">
                                                <span className="material-symbols-rounded">edit</span>
                                            </a>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="model-table-td-flex">
                                            {model.model}
                                            <a href="javascript:void();" className="delete-text-btn" onClick={() => {editModelInfo(window.prompt("Change model `model` parameter:", model.model), 'model', model.uuid);}} title="Edit model" aria-label="Edit model">
                                                <span className="material-symbols-rounded">edit</span>
                                            </a>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="model-table-td-flex">
                                            {model.url}
                                            <a href="javascript:void();" className="delete-text-btn" onClick={() => {editModelInfo(window.prompt("Change model URL:", model.url), 'url', model.uuid);}} title="Edit model URL" aria-label="Edit model URL">
                                                <span className="material-symbols-rounded">edit</span>
                                            </a>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="model-table-td-flex">
                                            {model.authorization ? '••••' : 'None'}
                                            <a href="javascript:void();" className="delete-text-btn" onClick={() => {editModelInfo(window.prompt("Change model API key:\n\n(Example: \"Bearer sk-or-v1-abc123\", or leave blank for none)"), 'authorization', model.uuid);}} title="Edit model API key" aria-label="Edit model API key">
                                                <span className="material-symbols-rounded">edit</span>
                                            </a>
                                        </div>
                                    </td>
                                    <td>{model.usage_count}</td>
                                    <td>
                                        <a href="javascript:void();" className="delete-text-btn" onClick={() => {if(window.confirm("Are you sure you want to delete this model? This action cannot be undone.")) {deleteModel(model.uuid);}}} title="Delete model" aria-label="Delete model">
                                            <span className="material-symbols-rounded">
                                                delete
                                            </span>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2 className="mb-0">Titles</h2>
                <p>Choose a model for chat title generation.</p>

                <div className="tip-message">
                    <p className="top-message-tip"><span class="material-symbols-rounded">lightbulb</span> TIP:</p>
                    <p>It's probably best to use a free or cheap model if you don't want to rack up huge fees, but also, try not to use a dumb model like Gemma. During testing, I've had good, fast, and accurate results with Llama-2:7B and Gemini 2.0 Flash-Lite.</p>
                </div>

                <form action="/" method="POST" onSubmit={setTitleGenerationModel}>
                    <div>
                        <div>
                            <label htmlFor="title_generation_model" className="us-none title-generation-model-title">Title generation model:</label>

                            <div className="d-flex-small-form">
                                <select name="title_generation_model" id="title_generation_model" className="input-form">
                                    <option value="" selected={titleModel == null}>None</option>
                                    {models.map((model) => (
                                        <option value={model.uuid} key={model.uuid} selected={titleModel == model.uuid}>{model.name}</option>
                                    ))}
                                </select>
                                <button type="submit" className="btn btn-primary btn-wide">Set</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>);
        } else {
            location.route("/settings/general");
            return <div></div>;
        }
    };

    function handleCloseNavbarClickSettings(e) {
        setSettingsNavVisible(!settingsNavVisible);
    }

    return (
        <div className="settings-page-overlay">
            <button className="settings-opener" onClick={handleCloseNavbarClickSettings}>
                <span class="material-symbols-rounded">
                    menu
                </span>
            </button>

            <div className="settings-page-nav" data-settingsnav-hidden={settingsNavVisible ? "true" : "false"}>
                <div className="settings-nav-flex">
                    <button className="settings-page-back-btn" onClick={handleBackBtnClick}>
                        <span className="material-symbols-rounded">arrow_back</span>
                        Back
                    </button>
                    
                    <button className="settings-page-back-btn settings-page-mobile-close-btn" onClick={handleCloseNavbarClickSettings}>
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                <div className="settings-page-category-btns">
                    <a href="/settings/" className="settings-page-category-btn" data-active={activeCategory === 'general' ? 'true' : 'false'}>
                        General
                    </a>

                    <a href="/settings/models" className="settings-page-category-btn" data-active={activeCategory === 'models' ? 'true' : 'false'}>
                        Models
                    </a>
                </div>

                <button onClick={() => window.location.href = '/logout'} className="settings-page-signout-btn">
                    Sign out
                </button>
            </div>
            <div className="settings-page-content">
                {renderCategoryContent()}
            </div>
        </div>
    );
}