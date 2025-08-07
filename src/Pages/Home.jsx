import React, { useState, useContext, useMemo, useEffect } from 'react'
import TopAlbums from '../Components/AlbumComponents/TopAlbums'
import TrendingSongs from '../Components/AlbumComponents/TrendingSongs'
import { AlbumContextAPI } from '../context/AlbumContext'
import { NavLink } from 'react-router-dom'
import MusicContainersDisplay from '../Components/MusicContainersDisplay'
import SongContainersDisplay from '../Components/SongContainersDisplay'
import Spinner from '../utilities/Spinner'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { __DB } from '../backend/firebase'

const Home = () => {
  const { allAlbums } = useContext(AlbumContextAPI)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOverlay, setShowOverlay] = useState(false)
  const [publicPlaylists, setPublicPlaylists] = useState([])
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false)

  useEffect(() => {
    const fetchPublicPlaylists = async () => {
      setIsLoadingPlaylists(true)
      try {
        const q = query(collection(__DB, 'playlists'), where('visibility', '==', 'public'))
        const snap = await getDocs(q)
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setPublicPlaylists(list)
      } catch (err) {
        console.error('Failed to fetch public playlists:', err)
      } finally {
        setIsLoadingPlaylists(false)
      }
    }
    fetchPublicPlaylists()
  }, [])

  const allSongs = useMemo(() => {
    if (!allAlbums) return []
    const songs = []
    allAlbums.forEach(album => {
      album.AllSongs?.forEach(song => {
        songs.push({
          ...song,
          albumTitle: album.albumTitle,
          songMusicDirector: song.songMusicDirector || '',
          albumId: album.id || album._id || null,
          albumPoster: album.albumPoster
        })
      })
    })
    return songs
  }, [allAlbums])

  const allMusicDirectors = useMemo(() => {
    if (!allAlbums) return []
    const directorsSet = new Set()
    allAlbums.forEach(album => {
      album.AllSongs?.forEach(song => {
        if (song.songMusicDirector) {
          directorsSet.add(song.songMusicDirector)
        }
      })
    })
    return Array.from(directorsSet)
  }, [allAlbums])

  const filteredAlbums = useMemo(() => {
    return searchTerm
      ? allAlbums.filter(album =>
          album.albumTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : []
  }, [allAlbums, searchTerm])

  const filteredSongs = useMemo(() => {
    return searchTerm
      ? allSongs.filter(song =>
          song.songName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.songMusicDirector.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : []
  }, [allSongs, searchTerm])

  const filteredMusicDirectors = useMemo(() => {
    return searchTerm
      ? allMusicDirectors.filter(director =>
          director.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : []
  }, [allMusicDirectors, searchTerm])

  const filteredPlaylists = useMemo(() => {
    return searchTerm
      ? publicPlaylists.filter(playlist =>
          playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : []
  }, [publicPlaylists, searchTerm])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowOverlay(value.length > 0)
  }

  const handleOverlayClose = () => {
    setSearchTerm('')
    setShowOverlay(false)
  }

  if (!allAlbums) {
    return <Spinner />
  }

  return (
    <section className="relative h-screen">
      {/* Main search input */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search by song, album, or music director"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-2 rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        

        {/* Main content (scrollable) */}
        <div className={`flex-1  p-4 transition-all duration-300 ${showOverlay ? 'blur-sm pointer-events-none' : ''}`}>
          <TopAlbums />
          <TrendingSongs />
          <MusicContainersDisplay />
          <SongContainersDisplay />
        </div>
      </div>

      {/* Overlay search results */}
      {showOverlay && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}
          />

          {/* Overlay content */}
          <div className="fixed inset-0 z-50 flex justify-center items-start pt-20 overflow-auto">
            <div className="bg-gray-900 text-white rounded-lg p-6 w-11/12 max-w-4xl max-h-[85vh] overflow-auto relative shadow-lg">
              {/* Close Button */}
              <button
                onClick={handleOverlayClose}
                className="absolute top-2 right-2 text-white text-xl font-bold hover:text-red-500"
                aria-label="Close search results"
              >
                &times;
              </button>

              {/* Search input inside overlay */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search again..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full p-2 rounded border border-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Search Results */}
              <h2 className="text-2xl font-semibold mb-4">Search Results</h2>

              {filteredSongs.length === 0 && filteredAlbums.length === 0 && filteredMusicDirectors.length === 0 && filteredPlaylists.length === 0 && (
                <p>No results found for "{searchTerm}"</p>
              )}

              {filteredSongs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Songs</h3>
                  <ul className="list-disc list-inside max-h-48 overflow-auto">
                    {filteredSongs.map((song, index) => (
                      <li key={index} className="mb-1">
                        <NavLink
                          to="/album-details"
                          state={allAlbums.find(album => album.albumTitle === song.albumTitle)}
                          className="hover:underline flex items-center gap-2"
                        >
                          <img src={song.albumPoster} alt={song.albumTitle} className="h-8 w-8 rounded" />
                          <span className="font-semibold">{song.songName}</span> - Music Director: {song.songMusicDirector}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {filteredAlbums.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Albums</h3>
                  <ul className="list-disc list-inside max-h-48 overflow-auto">
                    {filteredAlbums.map((album, index) => (
                      <li key={index} className="mb-1 font-semibold">
                        <NavLink
                          to="/album-details"
                          state={album}
                          className="hover:underline flex items-center gap-2"
                        >
                          <img src={album.albumPoster} alt={album.albumTitle} className="h-8 w-8 rounded" />
                          {album.albumTitle}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {filteredMusicDirectors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Music Directors</h3>
                  <ul className="list-disc list-inside max-h-48 overflow-auto">
                    {filteredMusicDirectors.map((director, index) => (
                      <li key={index} className="mb-1">{director}</li>
                    ))}
                  </ul>
                </div>
              )}

              {filteredPlaylists.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Playlists</h3>
                  <ul className="list-disc list-inside max-h-48 overflow-auto">
                    {filteredPlaylists.map((playlist, index) => (
                      <li
                        key={index}
                        className="mb-1 font-semibold cursor-pointer hover:underline"
                      >
                        <NavLink
                          to={`/playlist/${playlist.id}`}
                          className="flex items-center gap-2"
                        >
                          <img
                            src={playlist.imageUrl}
                            alt={playlist.name}
                            className="h-8 w-8 rounded"
                          />
                          {playlist.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default Home
