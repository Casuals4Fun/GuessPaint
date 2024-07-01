import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Room from './pages/Room'
import Toast from './components/Toast'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path=':roomID' element={<Room />} />
        </Routes>
      </BrowserRouter>
      <Toast />
    </>
  )
}