import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import NavbarContainer from '../Components/NavbarComponents/NavbarContainer'
import AlbumSidebar from '../Components/AlbumComponents/AlbumSidebar'
import { AudioPlayerContextAPI } from '../context/AudioPlayerContext'
import CustomAudioPlayer from 'react-pro-audio-player'

let Layout = () => {
  const { songs, isPlaying, setIsPlaying, currentSongIndex, setCurrentSongIndex } =
    useContext(AudioPlayerContextAPI)

  return (
    <section className="w-full h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-10 shadow-2xl">
        <NavbarContainer />
      </header>

      {/* Main layout below Navbar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Fixed height, scroll independent */}
        <aside className="w-[16%] bg-slate-700 h-full ">
          <AlbumSidebar />
        </aside>

        {/* Main content area: scrollable */}
        <main
          className="w-[84%] h-full p-6 overflow-y-auto"
          style={{
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE 10+
            overflow: 'scroll',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Audio player fixed to bottom */}
      <section className="w-full fixed bottom-0 left-0 z-20">
        {currentSongIndex !== null && (
          <CustomAudioPlayer
            songs={songs}
            isPlaying={isPlaying}
            currentSongIndex={currentSongIndex}
            onPlayPauseChange={setIsPlaying}
            onSongChange={setCurrentSongIndex}
            songUrlKey="songUrl"
            songNameKey="songName"
            songThumbnailKey="songThumbnail"
            songSingerKey="songSingers"
          />
        )}
      </section>
    </section>
  )
}

export default Layout
