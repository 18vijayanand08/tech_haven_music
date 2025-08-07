import React, { useContext } from 'react'
import AlbumSidebar from '../Components/AlbumComponents/AlbumSidebar'
import NavbarContainer from '../Components/NavbarComponents/NavbarContainer'
import { Outlet } from 'react-router-dom'
import { AudioPlayerContextAPI } from '../context/AudioPlayerContext'
import CustomAudioPlayer from 'react-pro-audio-player'

const FavoritesLayout = () => {
  const { songs, isPlaying, setIsPlaying, currentSongIndex, setCurrentSongIndex } =
    useContext(AudioPlayerContextAPI)

  return (
    <section className="bg-slate-900 h-screen w-full flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-10 shadow-2xl">
        <NavbarContainer />
      </header>

      {/* Body: Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar */}
        <aside className="w-[16%] bg-slate-700 h-full overflow-hidden">
          <AlbumSidebar />
        </aside>

        {/* Scrollable Main Content */}
        <main className="w-[84%] h-full overflow-y-auto p-4">
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

export default FavoritesLayout
