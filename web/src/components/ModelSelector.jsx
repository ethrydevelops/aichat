import { useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { Link } from "react-router";
import './ModelSelector.css';

function ModelSelectDialog({ modelSelectorDialogOpen, onModelChange, activeModel }) {
    const cookies = new Cookies();

    const dialogRef = useRef(null);
    const [models, setModels] = useState([
        { id: 'loading', name: 'Loading', enabled: false }
    ]);

    const [lastModelScan, setLastModelScan] = useState(0);
    const [modelsLoadError, setModelsLoadError] = useState({ show: false, message: "" });
    const [modelsLoading, setModelsLoading] = useState(true);

    useEffect(() => {
        if (modelSelectorDialogOpen && dialogRef.current) {
            dialogRef.current.focus();
        }
        
        // if error state, reset on reopen & retry loading immediately
        if(modelSelectorDialogOpen && modelsLoadError.show) {
            setModelsLoadError({ show: false, message: "" });
            setModelsLoading(true);
            setModels([]);
            setLastModelScan(0);
        }

        // fetch models from the api every time reopened
        // 1 second debounce
        if(Date.now() - lastModelScan > 1000) {
            if(!cookies.get("askllm_tk")) {
                setModels([]);
                setModelsLoading(false);
                setModelsLoadError({ show: true, message: <>Please <Link to="/login" className="link-danger">log in</Link> to configure models.</> });
                return;
            }

            fetch((import.meta.env.VITE_API_URL.replace(/\/$/, "")) + "/models", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookies.get("askllm_tk")}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.models) {
                    setModelsLoading(false);
                    setModels(data.models);
                    setModelsLoadError({ show: false, message: "" });

                    // if active model doesn't exist in list, clear or correct it
                    if(activeModel) {
                        let currentModelAttempt = data.models.find(m => m.uuid === activeModel.uuid);
                        if(!currentModelAttempt) {
                            onModelChange({name: "Select a model", uuid: 0});
                        } else if(activeModel.name !== currentModelAttempt.name) {
                            onModelChange(currentModelAttempt); // correct name if changed
                        }
                    }
                }
            })
            .catch(error => {
                setModelsLoadError({ show: true, message: error.message });
                setModelsLoading(false);
                setModels([]);
                console.error("Error fetching models:", error);
            });

            setLastModelScan(Date.now());
        }
    }, [modelSelectorDialogOpen]);

    const handleModelChange = (selectedModel) => {
        if (onModelChange) {
            if(!models.find(m => m.uuid === selectedModel)) return alert("Selected model not found");
            selectedModel = models.find(m => m.uuid === selectedModel);

            onModelChange(selectedModel);
        }
    };

    return (
        <dialog className="model-select-dialog" ref={dialogRef} open={modelSelectorDialogOpen} tabIndex={-1}>
            <div className="modal-select-tag no-mobile">
                <span></span>
            </div>

            <div className="no-desktop">
                <div className="modal-top-flex">
                    <h3 className="m-0 p-0">Select a Model</h3>

                    <button className="modal-close-btn" type="button" aria-label="Close" onClick={() => onModelChange(null)}>
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>
            </div>

            <div className="model-select-options">
                {modelsLoading ?
                    <>
                        <div className="placeholder-glow model-option-btn-loader-outer">
                            <div className="placeholder model-option-btn-loader"></div>
                        </div>
                        <div className="placeholder-glow model-option-btn-loader-outer">
                            <div className="placeholder model-option-btn-loader"></div>
                        </div>
                        <div className="placeholder-glow model-option-btn-loader-outer">
                            <div className="placeholder model-option-btn-loader"></div>
                        </div>
                        <div className="placeholder-glow model-option-btn-loader-outer">
                            <div className="placeholder model-option-btn-loader"></div>
                        </div>
                    </> : (
                        models.length > 0 ? (
                            models.map((model) => (
                                <button type="button" key={model.uuid} className="model-option-btn" value={model.uuid} onClick={() => handleModelChange(model.uuid)} disabled={model.enabled ? !model.enabled : false}>
                                    <div className="model-option-circle" data-model-action-circle-active={activeModel.uuid === model.uuid}></div>
                                    <span>
                                        {model.name}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <section className="model-modal-no-models">
                                <div className="model-modal-no-models-warning">
                                    <span className="material-symbols-rounded">
                                        sentiment_dissatisfied
                                    </span>
                                    {modelsLoadError.show ? (
                                        <>
                                            <p className="m-0 p-0">Error loading models</p>
                                            <div className="modal-warning-hint text-danger">
                                                <span className="material-symbols-rounded">
                                                    error
                                                </span>
                                                <span>
                                                    {modelsLoadError.message}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="m-0 p-0">No models available</p>
                                            <div className="modal-warning-hint">
                                                <span className="material-symbols-rounded">
                                                    info
                                                </span>
                                                <span>
                                                    <Link to="/settings" className="link-secondary">Try adding one?</Link>
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>
                        )
                    )}
            </div>
        </dialog>
    );
}

export default ModelSelectDialog;
