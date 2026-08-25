import { useState } from "react";
import { useEffect} from 'react'
function Counter({initialCount}: {initialCount: number}) {
    const [count, setCount] = useState(initialCount)
    const [name, setName] = useState("")
    
    const [clientes, setClientes] = useState(
        [
            { name: "Dan", phone: "123456" },
            { name: "Maria", phone: "789012" },
            {name: "Juan", phone: "11121314"}
        ]
        
    )
    useEffect(() => {
            console.log("Counter se monto")
            }, [])
    return(
    <>  
        
        <h1>{count}</h1>
        <form onSubmit={(e) => {e.preventDefault()
            setClientes([...clientes, {name, phone: ""}])
            setName("")}}>
                
        <input type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}/>
        <p>{name}</p>
        <button type="submit"
        onClick={() => setClientes([...clientes, 
                {name, phone: ""}])}>Add new</button>
        </form>

        <h2>{count}</h2>

        <ul>
        {clientes.map((cliente, index) => (
        <li key={index}> {` ${cliente.name} - ${cliente.phone}`}</li>
        ))}
        </ul>
        <button type = "button"
            onClick={() => setClientes([...clientes,
                { name: "Robert", phone: "999999" }
                ])}
                >
                    Add clients 
        </button>
        <button type = "button"
            onClick={() => 
                setClientes(
                    clientes.filter((cliente) => cliente.name !== "Robert"))}
                >
                    agregar cliente
        </button>
        <button
    type="button"
    onClick={() =>
    setClientes(
        clientes.map((cliente) =>
            cliente.name === "Maria"
                ? { ...cliente, phone: "999999" }
                    : cliente
        )
    )
    }
>

</button>
        
        <button type = "button"
            onClick={() => setCount((count) => count + 1)}>
                +1
        </button>
        <button
        type = "button"   
        onClick={() => setCount((count) => count - 1)}>
                -1
        </button>
        <p>{count > 0 ? "positivo" : " cero o negativo"} </p>
    </>
    )
}export default Counter;