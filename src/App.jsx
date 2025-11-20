import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Notfound from './routes/Notfound'
import New from './routes/New'
import Home from './routes/Home'
import OnOff from './routes/OnOff'
import Thanks from './routes/Thanks'
import './styles/App.css'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/new' element={<New />} />
        <Route path='/onoff' element={<OnOff />} />
        <Route path='/thanks' element={<Thanks />} />
        <Route path='*' element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
