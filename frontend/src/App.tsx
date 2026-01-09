import React from 'react'
import Dashboard from './components/Dashboard'
import { GestureProvider } from './context/GestureContext'
import DigitalTwinCursor from './components/DigitalTwinCursor'
import GestureController from './components/GestureController'

function App() {
    return (
        <GestureProvider>
            <div className="w-full h-screen bg-automotive-900 text-white overflow-hidden relative">
                <GestureController />
                <DigitalTwinCursor />
                <Dashboard />
            </div>
        </GestureProvider>
    )
}

export default App
