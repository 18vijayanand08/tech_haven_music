import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { collection, getDocs, updateDoc, doc, arrayUnion, addDoc, getDoc } from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import { UserContextAPI } from '../context/UserContext';

const AddToPlaylist = ({ song, onClose }) => {
  const { userDataFromDB } = useContext(UserContextAPI);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);
  const [visibilityOption, setVisibilityOption] = useState('private');

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      if (!userDataFromDB?.uid) {
        setUserPlaylists([]);
        return;
      }
      try {
        const q = collection(__DB, 'playlists');
        const snap = await getDocs(q);
        const playlists = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.createdBy === userDataFromDB.uid);
        setUserPlaylists(playlists);
      } catch (err) {
        toast.error('Failed to fetch playlists: ' + err.message);
      }
    };
    fetchUserPlaylists();
  }, [userDataFromDB?.uid]);

  const addToExistingPlaylist = async (playlistId) => {
    try {
      const playlistRef = doc(__DB, 'playlists', playlistId);
      const playlistSnap = await getDoc(playlistRef);
      if (playlistSnap.exists()) {
        const playlistData = playlistSnap.data();
        const existingSongs = playlistData.songs || [];
        const songExists = existingSongs.some(s => s.id === (song.id || ''));
        if (songExists) {
          toast.error('Song is already in the playlist.');
          return;
        }
      }
      await updateDoc(playlistRef, {
        songs: arrayUnion({
          id: song.id || '',
          title: song.title || song.songName || '',
          image: song.image || song.songThumbnail || '',
          albumId: song.albumId || '',
          albumTitle: song.albumTitle || '',
          songDetails: song.songDetails || {},
          order: 0,
        }),
      });
      toast.success('Song added to playlist!');
      setShowDropdown(false);
      if (onClose) onClose();
    } catch (err) {
      toast.error('Failed to add song: ' + err.message);
    }
  };

  const createNewPlaylistAndAddSong = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Playlist name is required');
      return;
    }
    setCreatingNew(true);
    try {
      const payload = {
        name: newPlaylistName.trim(),
        imageUrl: '',
        visibility: visibilityOption,
        createdBy: userDataFromDB.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        songs: [{
          id: song.id || '',
          title: song.title || song.songName || '',
          image: song.image || song.songThumbnail || '',
          albumId: song.albumId || '',
          albumTitle: song.albumTitle || '',
          songDetails: song.songDetails || {},
          order: 0,
        }],
      };
      const docRef = await addDoc(collection(__DB, 'playlists'), payload);
      toast.success('Playlist created and song added!');
      setUserPlaylists(prev => [...prev, { id: docRef.id, ...payload }]);
      setNewPlaylistName('');
      setShowDropdown(false);
      if (onClose) onClose();
    } catch (err) {
      toast.error('Failed to create playlist: ' + err.message);
    } finally {
      setCreatingNew(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Add to Playlist
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-800 text-white rounded-md shadow-xl z-50 p-4">
          <div>
            <h3 className="font-semibold mb-2">Add to existing playlist</h3>
            {userPlaylists.length === 0 ? (
              <p className="text-gray-400 text-sm">No playlists found.</p>
            ) : (
              <ul className="max-h-40 overflow-auto">
                {userPlaylists.map(pl => (
                  <li key={pl.id}>
                    <button
                      onClick={() => addToExistingPlaylist(pl.id)}
                      className="w-full text-left px-2 py-1 rounded hover:bg-slate-700"
                    >
                      {pl.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 border-t border-slate-600 pt-4">
            <h3 className="font-semibold mb-2">Or create new playlist</h3>
            <input
              type="text"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              placeholder="New playlist name"
              className="w-full border border-slate-600 px-2 py-1 rounded mb-2 bg-slate-700 text-white placeholder:text-gray-400"
            />
            <select
              value={visibilityOption}
              onChange={e => setVisibilityOption(e.target.value)}
              className="w-full border border-slate-600 px-2 py-1 rounded mb-2 bg-slate-700 text-white"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <button
              onClick={createNewPlaylistAndAddSong}
              disabled={creatingNew}
              className="w-full bg-green-600 text-white py-1 rounded hover:bg-green-700"
            >
              {creatingNew ? 'Creating...' : 'Create & Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToPlaylist;
