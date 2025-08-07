import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import { UserContextAPI } from '../context/UserContext';
import { AudioPlayerContextAPI } from '../context/AudioPlayerContext';
import AddToPlaylist from '../Components/AddToPlaylist';

const SongContainersDisplay = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const { userDataFromDB, addFavorite, removeFavorite } = useContext(UserContextAPI);
  const { setSongs, setIsPlaying, setCurrentSongIndex } = useContext(AudioPlayerContextAPI);

  useEffect(() => {
    const fetchContainers = async () => {
      setLoading(true);
      try {
        const q = query(collection(__DB, 'song_containers'), orderBy('order'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(container => container.visible);
        setContainers(data);
      } catch (error) {
        toast.error('Error fetching song containers: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContainers();
  }, []);

  const getSongKey = (item) => {
    const songId = item.songDetails?.songId;
    const fallback = `${item.songDetails?.songName}-${item.songDetails?.songSingers}`;
    return `song_${songId ?? fallback}`;
  };

  const isFavorite = (songKey) => userDataFromDB?.favorites?.includes(songKey);

  const toggleFavorite = (songKey) => {
    if (isFavorite(songKey)) {
      removeFavorite(songKey);
    } else {
      addFavorite(songKey);
    }
  };

  const handleSongClick = (containerItems, index) => {
    const mappedSongs = containerItems.map(item => ({
      songUrl: item.songDetails?.songUrl || '',
      songName: item.songDetails?.songName || item.title || '',
      songThumbnail: item.songDetails?.songThumbnail || item.image || '',
      songSingers: item.songDetails?.songSingers || item.songDetails?.artist || item.songDetails?.albumTitle || '',
    }));
    setSongs(mappedSongs);
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  const openPlaylistModal = (song, e) => {
    e.stopPropagation();
    setSelectedSong(song);
    setIsPlaylistModalOpen(true);
  };

  const closePlaylistModal = () => {
    setIsPlaylistModalOpen(false);
    setSelectedSong(null);
  };

  if (loading) return <p className="text-white text-center py-10">Loading song containers...</p>;
  if (containers.length === 0) return <p className="text-white text-center py-10">No song containers available.</p>;

  return (
    <section className="p-6">
      {containers.map(container => (
        <div key={container.id} className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">{container.name}</h2>
          {container.description && (
            <p className="text-gray-400 mb-4">{container.description}</p>
          )}
          <div className="flex flex-wrap gap-5">
            {container.items && container.items.length > 0 ? (
              container.items
                .sort((a, b) => a.order - b.order)
                .map((item, index) => {
                  const songKey = getSongKey(item);
                  return (
                    <div
                      key={item.id}
                      className="h-[260px] w-[200px] p-3 bg-slate-800 rounded-md hover:bg-slate-700 transition cursor-pointer flex flex-col justify-between"
                      onClick={() => handleSongClick(container.items, index)}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-[200px] w-full object-cover rounded-md"
                      />
                      <div className="pt-2 w-full flex items-center justify-between">
                        <p className="font-semibold text-[16px] text-white truncate">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(songKey);
                            }}
                            className="text-white text-xl"
                            aria-label={isFavorite(songKey) ? "Remove from favorites" : "Add to favorites"}
                          >
                            {isFavorite(songKey) ? '❤️' : '🤍'}
                          </button>
                          <button
                            onClick={(e) => openPlaylistModal({
                              id: item.id,
                              title: item.title,
                              image: item.image,
                              songName: item.songDetails?.songName,
                              songThumbnail: item.songDetails?.songThumbnail,
                              songSingers: item.songDetails?.songSingers,
                              albumId: item.songDetails?.albumId,
                              albumTitle: item.songDetails?.albumTitle,
                              songDetails: item.songDetails,
                            }, e)}
                            className="text-white text-xl"
                            aria-label="Add to playlist"
                          >
                            ⋮
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-300">No songs in this container.</p>
            )}
          </div>
        </div>
      ))}

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
                  const response = await fetch(selectedSong.songDetails?.songUrl);
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
    </section>
  );
};

export default SongContainersDisplay;
