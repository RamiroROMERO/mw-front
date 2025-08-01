import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Home = require('@/views/home');

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path='/' element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
