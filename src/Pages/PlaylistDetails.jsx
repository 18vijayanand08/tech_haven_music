import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import { AudioPlayerContextAPI } from '../context/AudioPlayerContext';
import AddToPlaylist from '../Components/AddToPlaylist';

const PlaylistDetails = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setSongs, setIsPlaying, setCurrentSongIndex } = useContext(AudioPlayerContextAPI);

  useEffect(() => {
    const fetchPlaylist = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(__DB, 'playlists', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPlaylist(docSnap.data());
        } else {
          toast.error('Playlist not found');
        }
      } catch (err) {
        toast.error('Failed to load playlist: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylist();
  }, [id]);

  const handleSongClick = (index) => {
    if (!playlist?.songs) return;

    const transformedSongs = playlist.songs.map(song => ({
      id: song.id,
      songName: song.title,
      songThumbnail: song.image,
      albumId: song.albumId,
      albumTitle: song.albumTitle,
      order: song.order,
      songDetails: song.songDetails,
      songUrl: song.songDetails?.songUrl || song.songUrl || '',
      songSingers: song.songDetails?.songSingers || '',
    }));

    setSongs(transformedSongs);
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  if (isLoading) {
    return <p className="text-white text-center mt-10">Loading playlist...</p>;
  }

  if (!playlist) {
    return <p className="text-white text-center mt-10">Playlist not found.</p>;
  }

  return (
    <section className="w-full flex justify-center px-4 py-10">
      <article className="w-full max-w-5xl bg-slate-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">{playlist.name}</h1>

        {playlist.songs && playlist.songs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlist.songs.map((song, index) => (
              <div
                key={song.id}
                className="bg-slate-700 hover:bg-slate-600 transition rounded-lg p-4 shadow-md flex flex-col justify-between cursor-pointer"
              >
                <div onClick={() => handleSongClick(index)} className="flex flex-col gap-2">
                  <img
                    src={song.image}
                    alt={song.title}
                    className="h-[160px] w-full object-cover rounded"
                  />
                  <div>
                    <h3 className="text-white font-semibold text-lg truncate">{song.title}</h3>
                    <p className="text-sm text-gray-300">{song.albumTitle}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <AddToPlaylist song={song} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300 text-center">No songs in this playlist.</p>
        )}
      </article>
    </section>
  );
};

export default PlaylistDetails;
