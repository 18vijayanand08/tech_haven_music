import React, { useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AlbumContextAPI } from '../context/AlbumContext';
import { UserContextAPI } from '../context/UserContext';
import { AudioPlayerContextAPI } from '../context/AudioPlayerContext';
import { NavLink } from 'react-router-dom';
import AddToPlaylist from '../Components/AddToPlaylist';

const enhancedEmptyAnimations = `
@keyframes bounceGlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes fadeInSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

if (!document.getElementById('favorites-empty-anim')) {
  const style = document.createElement('style');
  style.id = 'favorites-empty-anim';
  style.innerHTML = enhancedEmptyAnimations;
  document.head.appendChild(style);
}

const Favorites = () => {
  const { allAlbums } = useContext(AlbumContextAPI);
  const { userDataFromDB, removeFavorite } = useContext(UserContextAPI);
  const { setSongs, setCurrentSongIndex, setIsPlaying } = useContext(AudioPlayerContextAPI);

  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const getSongKey = (song) => {
    return song.id ?? `${song.songName}-${song.songSingers}`;
  };

  const favoriteAlbums = useMemo(() => {
    if (!allAlbums || !userDataFromDB?.favorites) return [];
    return allAlbums.filter(album =>
      userDataFromDB.favorites.includes(`album_${album.id}`) ||
      userDataFromDB.favorites.includes(album.id)
    );
  }, [allAlbums, userDataFromDB]);

  const favoriteSongs = useMemo(() => {
    if (!userDataFromDB?.favorites || !allAlbums) return [];

    const favoriteSongKeys = userDataFromDB.favorites
      .filter(fav => fav.startsWith('song_'))
      .map(fav => fav.replace('song_', ''));

    const matched = [];

    allAlbums.forEach(album => {
      if (album.AllSongs) {
        album.AllSongs.forEach(song => {
          const key = getSongKey(song);
          if (favoriteSongKeys.includes(key)) {
            matched.push({
              ...song,
              key,
              albumTitle: album.albumTitle,
              albumId: album.id
            });
          }
        });
      }
    });

    return matched;
  }, [userDataFromDB, allAlbums]);

  if (!userDataFromDB) {
    return <p className="text-white text-lg p-4">Loading user data...</p>;
  }

  const openPlaylistModal = (song, e) => {
    e.stopPropagation();
    setSelectedSong(song);
    setIsPlaylistModalOpen(true);
  };

  const closePlaylistModal = () => {
    setIsPlaylistModalOpen(false);
    setSelectedSong(null);
  };

  return (
    <section className="p-4 min-h-[300px]">
      <article className="space-y-10">

        {/* Favorite Albums */}
        <section className="bg-slate-800 rounded-md p-4">
          <header className="mb-4">
            <h1 className="text-2xl font-semibold text-white">My Favorite Albums</h1>
          </header>

          {favoriteAlbums.length > 0 ? (
            <main className="flex gap-4 flex-wrap">
              {favoriteAlbums.map(album => (
                <div key={album.id} className="relative h-[260px] w-[200px] p-3 bg-slate-700 rounded-md flex flex-col justify-between">
                  <NavLink to="/album-details" state={album} className="block">
                    <img src={album.albumPoster} alt={album.albumTitle} className="h-[200px] w-[180px] rounded-lg mx-auto" />
                    <p className="text-left font-semibold py-2 text-[18px] text-white truncate">{album.albumTitle}</p>
                  </NavLink>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (userDataFromDB?.favorites.includes(`album_${album.id}`)) {
                        removeFavorite(`album_${album.id}`);
                      } else {
                        removeFavorite(`${album.id}`);
                      }
                    }}
                    className="absolute bottom-2 right-2 text-white text-xl"
                    aria-label="Remove album from favorites"
                  >
                    ❤️
                  </button>
                </div>
              ))}
            </main>
          ) : (
            <div className="text-center mt-12 text-white flex flex-col items-center space-y-4">
              <div
                className="text-6xl"
                style={{
                  animation: 'bounceGlow 2s infinite ease-in-out',
                  filter: 'drop-shadow(0 0 10px #f0f) drop-shadow(0 0 20px #0ff)',
                }}
              >
                💿
              </div>

              <p
                className="text-xl font-semibold opacity-0"
                style={{
                  animation: 'fadeInSlideUp 1s ease-out forwards',
                  animationDelay: '0.5s',
                }}
              >
                No favorite albums yet!
              </p>

              <p
                className="text-base text-gray-400 opacity-0"
                style={{
                  animation: 'fadeInSlideUp 1s ease-out forwards',
                  animationDelay: '1.2s',
                }}
              >
                Start exploring and tap ❤️ to add albums.
              </p>
            </div>
          )}
        </section>

        {/* Favorite Songs */}
        <section className="bg-slate-800 rounded-md p-4">
          <header className="mb-4">
            <h1 className="text-2xl font-semibold text-white">My Favorite Songs</h1>
          </header>

          {favoriteSongs.length > 0 ? (
            <main className="flex gap-4 flex-wrap">
              {favoriteSongs.map(song => (
                <div
                  key={song.key}
                  className="relative h-[260px] w-[200px] p-3 bg-slate-700 rounded-md flex flex-col justify-between hover:bg-slate-600 cursor-pointer transition"
                  onClick={() => {
                    const songIndex = favoriteSongs.findIndex(s => s.key === song.key);
                    if (songIndex !== -1) {
                      setSongs(favoriteSongs);
                      setCurrentSongIndex(songIndex);
                      setIsPlaying(true);
                    }
                  }}
                >
                  <img src={song.songThumbnail} alt={song.songName} className="h-[200px] w-[180px] rounded-lg mx-auto" />
                  <div className="mt-2">
                    <p className="text-center font-semibold text-white text-[16px] truncate">{song.songName}</p>
                    <p className="text-center text-gray-400 text-sm truncate">{song.albumTitle}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFavorite(`song_${song.key}`);
                    }}
                    className="absolute bottom-2 right-2 text-white text-xl"
                    aria-label="Remove song from favorites"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={(e) => openPlaylistModal(song, e)}
                    className="absolute bottom-2 left-2 text-white text-xl"
                    aria-label="More options"
                  >
                    ⋮
                  </button>
                </div>
              ))}
            </main>
          ) : (
            <div className="text-center mt-12 text-white flex flex-col items-center space-y-4">
              <div className="text-6xl animate-bounce" style={{ animationDuration: '1.3s' }}>🎶</div>

              <p
                className="text-xl font-semibold opacity-0"
                style={{
                  animation: 'fadeIn 1.5s ease-in-out forwards',
                  animationDelay: '0.5s',
                }}
              >
                No favorite songs yet!
              </p>

              <p
                className="text-base text-gray-400 opacity-0"
                style={{
                  animation: 'fadeIn 2s ease-in-out forwards',
                  animationDelay: '1s',
                }}
              >
                Explore and tap the ❤️ to start vibing!
              </p>
            </div>
          )}
        </section>

        {/* Global modal for AddToPlaylist */}
        {isPlaylistModalOpen && selectedSong && (
          <div
            className="fixed inset-0 bg-black/40 bg-opacity-70 flex justify-center items-center z-50"
            onClick={closePlaylistModal}
          >
            <div
              className="bg-slate-700 rounded-md p-4 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="text-white text-xl mb-2 float-right"
                onClick={closePlaylistModal}
                aria-label="Close playlist modal"
              >
                ✕
              </button>
              <AddToPlaylist song={selectedSong} onClose={closePlaylistModal} />
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const response = await fetch(selectedSong.songUrl || selectedSong.songDetails?.songUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = selectedSong.songName || 'song.mp3';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    toast.success('Song downloaded successfully');
                    closePlaylistModal();
                  } catch (error) {
                    console.error('Download failed:', error);
                    toast.error('Download failed');
                  }
                }}
                className="block mt-4 w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-md"
              >
                Download Song
              </button>
            </div>
          </div>
        )}
      </article>
    </section>
  );
};

export default Favorites;
