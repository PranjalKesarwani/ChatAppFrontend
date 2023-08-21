import { Button, ButtonGroup } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChatPage from './Pages/ChatPage'
import Homepage from './Pages/Homepage'
import ChatProvider from './Context/chatProvider.jsx'
import { BrowserRouter as Router } from 'react-router-dom';

import './index.css';


function App() {


  return (
    <div className="App">

      <Router>
        <ChatProvider>    {/*ChatProvider is the global storage */}
          <Routes>
            <Route exact path='/' element={<Homepage />} />
            <Route exact path='/chats' element={<ChatPage />} />
          </Routes>
        </ChatProvider>
      </Router>
    </div>
  )
}

export default App
