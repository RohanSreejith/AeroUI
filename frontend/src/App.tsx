import React from 'react'
import { GestureProvider } from './context/GestureContext'
import DigitalTwinCursor from './components/DigitalTwinCursor'
import GestureController from './components/GestureController'
import LayoutGrid from './components/LayoutGrid'
import MapWidget from './components/MapWidget'
import StatusPanel from './components/StatusPanel'
import ContactsPanel from './components/ContactsPanel'
import ClimateControl from './components/ClimateControl'
import VolumeControl from './components/VolumeControl'
import MusicPlayer from './components/MusicPlayer'

function App() {
    const [activeKnob, setActiveKnob] = React.useState<'climate' | 'volume' | null>(null);

    return (
        <GestureProvider>
            <div className="w-full h-screen bg-automotive-900 text-white overflow-hidden relative selection:bg-automotive-highlight selection:text-black">
                {/* Background ambient glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-automotive-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

                <GestureController />
                <DigitalTwinCursor />

                <LayoutGrid>
                    {/* LEFT COLUMN: NAVIGATION */}
                    <div className="col-span-8 h-full">
                        <MapWidget />
                    </div>

                    {/* RIGHT COLUMN: STATUS & CONTROLS */}
                    <div className="col-span-4 flex flex-col h-full gap-4">
                        {/* 1. Status Panel */}
                        <div className="shrink-0">
                            <StatusPanel />
                        </div>

                        {/* 2. Contacts & Music (Middle Area) */}
                        {/* 2. Contacts (Middle Area) */}
                        <div className="flex-1 min-h-0">
                            <ContactsPanel />
                        </div>

                        {/* 3. Controls (Knobs) */}
                        <div className="grid grid-cols-2 gap-4 shrink-0 mt-2 h-44">
                            <ClimateControl
                                isActive={activeKnob === 'climate'}
                                onActivate={() => setActiveKnob(activeKnob === 'climate' ? null : 'climate')}
                            />
                            <VolumeControl
                                isActive={activeKnob === 'volume'}
                                onActivate={() => setActiveKnob(activeKnob === 'volume' ? null : 'volume')}
                            />
                        </div>

                        {/* 4. Music Player (Bottom) */}
                        <div className="shrink-0 mt-2">
                            <MusicPlayer />
                        </div>
                    </div>
                </LayoutGrid>
            </div>
        </GestureProvider>
    )
}

export default App
