import { useState } from 'react'

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            Count is {count}, <button onClick={() => setCount((count) => count + 1)}>+1</button>
        </>
    )
}

export default App
