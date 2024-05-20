import { useState } from "react";


const GihubLogin = () => {
    const [token, setToken] = useState<string>("")
    const [open, setOpen] = useState<boolean>(false);
  
    if (!open) {
      return (
        <button className='bordered' onClick={() => setOpen(true)}>Login with Github</button>
      )
    }
  
    return (
      <div>
        <input type="text" value={token} placeholder="Paste your Github Token" onChange={(e) => setToken(e.target.value)} />
        <button className='bordered' onClick={() => {
          localStorage.setItem("github_token", token);
          setOpen(false);
        }}>Login</button>
      </div>
    )
  }
  