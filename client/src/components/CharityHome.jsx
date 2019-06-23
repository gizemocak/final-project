import React, { useState, useEffect } from 'react';
import MapContainer from './MapContainer'
import NavBar from "./NavBar";

function CharityHome () {
  const [apiKey, setApiKey] = useState(null)
  
  useEffect(() => {
    fetch('/api/getApiKey')
    .then(res => {
      console.log(res) 
      return res.json()
    })
    .then(data => { 
      console.log(data.apiKey)
      setApiKey(data.apiKey)
    })
    .catch(error => {
      console.log(error)
    })
  }, [])

return (
<>
<NavBar />
{ apiKey && <MapContainer apiKey={apiKey} /> } 
</>
)
}

export default CharityHome
