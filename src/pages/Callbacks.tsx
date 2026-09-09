import type { Callback } from "../types"; 
function Callbacks({callbacks, handleCancel}: {
    callbacks: Callback[]
    handleCancel: (callback: Callback) => void
}) {
    return(
        <>
        <ul className="callback-list">
            {callbacks.filter((callback) => callback.status === "pending")
            .map((callback) => (
                <li className="callback-item" key={callback.id}>
                    <span>{callback.patient}</span>
                    <span>{callback.date}</span>
                    <span>{callback.reason}</span>
                    <button onClick={() => handleCancel(callback)}>
                        Cancelar
                        </button>
                        
                </li>
                
            ))}
        </ul>
        </>
    )
} export default Callbacks;