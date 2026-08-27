
function PendingCallbacks() {
    const callbacks = [
        {
            id: 1, patient: "dan", date: "2026-10-12 10:30", reason: "lorem ipsum xdxd"
        },
        {
            id: 2, patient: "juan", date: "2026-10-12 10:30", reason: "lorem ipsum xdxd"
        },
        {
            id: 3, patient: "meme", date: "2026-10-12 10:30", reason: "lorem ipsum xdxd"
        }
    ]
    return(
        <section>
            <h2>Pending</h2>
            <div className="callback-list">
                {callbacks.map((callback) => (
                <div className="callback-dataR" key={callback.id}>
                    
                    <span>{callback.patient}</span>
                    <strong>{callback.date}</strong>
                    <span>{callback.reason}</span>
                    <button type="button">Boton</button>
                </div>
                ))}
            </div>    
        </section>
    )
}export default PendingCallbacks;