import React, { useContext, useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { AudioPlayerContextAPI } from '../../context/AudioPlayerContext';
import { doc, getDoc } from 'firebase/firestore';
import { __DB } from '../../Backend/firebase';
import { UserContextAPI } from '../../context/UserContext';
import AddToPlaylist from '../AddToPlaylist';

const AlbumDetails = () => {
  const navigate = useNavigate();
  const { setSongs, setIsPlaying, setCurrentSongIndex } = useContext(AudioPlayerContextAPI);
  const { userDataFromDB, addFavorite, removeFavorite } = useContext(UserContextAPI);

  const location = useLocation();
  const [album, setAlbum] = useState(location?.state || null);
  const [loading, setLoading] = useState(false);

  // State to track which song's options menu is open
  // const [openOptionsIndex, setOpenOptionsIndex] = useState(null);
  const optionsRef = useRef(null);

  // New state for modal open and selected song
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    const fetchAlbumById = async (albumId) => {
      setLoading(true);
      try {
        const albumRef = doc(__DB, 'album_collections', albumId);
        const albumSnap = await getDoc(albumRef);
        if (albumSnap.exists()) {
          setAlbum(albumSnap.data());
        } else {
          console.warn('Album not found in database.');
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Error fetching album:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!location?.state) {
      console.warn('Album not passed via navigation state.');
      // Optionally handle fetch using URL params
    } else {
      if (!location.state.AllSongs || location.state.AllSongs.length === 0) {
        fetchAlbumById(location.state.albumId);
      }
    }
  }, [location, navigate]);

  // Close options menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        // setOpenOptionsIndex(null);
        setIsPlaylistModalOpen(false);
        setSelectedSong(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isAlbumFavorite = (albumId) => {
    return userDataFromDB?.favorites?.includes(albumId);
  };

  const toggleFavoriteAlbum = (albumId) => {
    if (isAlbumFavorite(albumId)) {
      removeFavorite(albumId);
    } else {
      addFavorite(albumId);
    }
  };

  // Remove toggleOptionsMenu and replace with open modal handler
  const openPlaylistModal = (song, e) => {
    e.stopPropagation();
    setSelectedSong(song);
    setIsPlaylistModalOpen(true);
  };

  const closePlaylistModal = () => {
    setIsPlaylistModalOpen(false);
    setSelectedSong(null);
  };

  if (loading) {
    return (
      <section className="text-white p-6">
        <h2 className="text-2xl font-semibold mb-4">Loading Album Details...</h2>
      </section>
    );
  }

  if (!album) {
    return (
      <section className="text-white p-6">
        <h2 className="text-2xl font-semibold mb-4">Album Details</h2>
        <p>No album data available. Please navigate from the album list.</p>
      </section>
    );
  }

  return (
    <section className="h-full w-full text-white">
      <article className="h-full w-full">
        <header className="h-[370px] w-full bg-slate-800 rounded-md flex p-6 gap-10">
          <aside className="w-[50%]">
            <img
              src={album?.albumPoster}
              alt={album?.albumTitle}
              className="h-[280px] w-[280px] rounded-sm object-cover"
            />
          </aside>
          <aside className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between">
              <h1 className="text-[24px] font-thin">{album?.albumTitle}</h1>
              <button
                onClick={() => toggleFavoriteAlbum(album.id)}
                className="text-white text-xl"
                aria-label={isAlbumFavorite(album.id) ? "Remove from favorites" : "Add to favorites"}
              >
                {isAlbumFavorite(album.id) ? '❤' : '🤍'}
              </button>
            </div>
            <p className="flex gap-2 items-center">
              <span>No of Tracks :</span>
              <span className="bg-blue-600 py-1 px-4 rounded-md">{album?.AllSongs?.length || 0}</span>
            </p>
            <p className="flex gap-2 items-center">
              <span>Language :</span>
              <span>{album?.albumLanguage}</span>
            </p>
            <p className="flex gap-2 items-center">
              <span>Album Release Date :</span>
              <span>{album?.albumReleaseDate}</span>
            </p>
            <div className="flex gap-2 items-start">
              <span>Album Description :</span>
              <p className="w-[80%]">{album?.albumDescription}</p>
            </div>
          </aside>
        </header>

        <main className="mt-10 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-2">#</th>
                <th className="px-1 py-3">Thumbnail</th>
                <th className="px-1 py-3">Song Name</th>
                <th className="px-1 py-3">Singers</th>
                <th className="px-1 py-3">Music Director</th>
                <th className="px-1 py-3">Mood</th>
                <th className="px-1 py-3">Duration</th>
                <th className="px-1 py-3 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {album?.AllSongs?.map((song, index) => {
                const songKey = song.id ?? `${song.songName}-${song.songSingers}`;
                const songIdWithPrefix = `song_${songKey}`;
                const isSongFavorite = userDataFromDB?.favorites?.includes(songIdWithPrefix);

                return (
                  <tr
                    key={songKey}
                    className="bg-slate-800 hover:bg-slate-700 cursor-pointer"
                    onClick={() => {
                      setSongs(album.AllSongs);
                      setCurrentSongIndex(index);
                      setIsPlaying(true);
                    }}
                  >
                    <td className="py-2 text-center">{index + 1}</td>
                    <td className="py-2 text-center">
                      <img
                        src={song?.songThumbnail}
                        alt={song?.songName}
                        className="h-[60px] w-[60px] rounded object-cover"
                      />
                    </td>
                    <td className="py-2 text-center">{song?.songName}</td>
                    <td className="py-2 text-center">{song?.songSingers}</td>
                    <td className="py-2 text-center">{song?.songMusicDirector}</td>
                    <td className="py-2 text-center">{song?.songMood}</td>
                    <td className="py-2 text-center">{formatDuration(song?.songDuration || 0)}</td>
                    <td className="py-2 text-center flex flex-col items-center justify-center gap-2 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          isSongFavorite
                            ? removeFavorite(songIdWithPrefix)
                            : addFavorite(songIdWithPrefix);
                        }}
                        className="text-white text-xl"
                        aria-label={isSongFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isSongFavorite ? '❤' : '🤍'}
                      </button>
                      <button
                        onClick={(e) => openPlaylistModal(song, e)}
                        className="text-white text-xl"
                        aria-label="More options"
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </main>

        {/* Global modal for AddToPlaylist */}
        {isPlaylistModalOpen && selectedSong && (
          <div
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
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
                    const response = await fetch(selectedSong.songUrl);
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

export default AlbumDetails;
