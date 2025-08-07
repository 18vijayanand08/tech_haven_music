import React, { useContext, useMemo } from 'react'
import { AlbumContextAPI } from '../../context/AlbumContext'
import { UserContextAPI } from '../../context/UserContext'
import { NavLink } from 'react-router-dom'

const TopAlbums = () => {
  const { allAlbums } = useContext(AlbumContextAPI)
  const { userDataFromDB, addFavorite, removeFavorite } = useContext(UserContextAPI)

  const filteredAlbums = useMemo(() => {
    if (!allAlbums) return []
    const albums = [...allAlbums].sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    return albums.slice(0, 12)
  }, [allAlbums])

  const isFavorite = (albumId) => {
    return userDataFromDB?.favorites?.includes(albumId)
  }

  const toggleFavorite = (albumId) => {
    if (isFavorite(albumId)) {
      removeFavorite(albumId)
    } else {
      addFavorite(albumId)
    }
  }

  return (
    <section>
      <article>
        <header className="mb-4">
          <h1 className="text-2xl font-semibold mb-4">Top </h1>
        </header>
        <main className="flex gap-4 flex-wrap">
          {filteredAlbums.map((album, index) => (
            <div
              key={index}
              className="h-[260px] w-[200px] p-3 bg-slate-800 rounded-md relative flex flex-col items-center"
            >
              <NavLink to="/album-details" state={album} className="block">
                <img
                  src={album?.albumPoster}
                  className="h-[200px] w-[180px] rounded-lg"
                  alt={album?.albumTitle}
                />
              </NavLink>
              <div className="flex items-center justify-between pt-2 w-full">
                <p className="font-semibold text-[16px] truncate">{album?.albumTitle}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite(album.id)
                  }}
                  className="text-white text-xl"
                  aria-label={isFavorite(album.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite(album.id) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          ))}
        </main>
      </article>
    </section>
  )
}

export default TopAlbums
