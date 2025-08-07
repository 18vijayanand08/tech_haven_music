import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Spinner from '../utilities/Spinner';
import {
  addDoc, collection, getDocs, getDoc,
  deleteDoc, doc, updateDoc, query, where
} from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import { UserContextAPI } from '../context/UserContext';

const CreatePlaylist = () => {
  const initialPlaylistState = {
    name: '',
    imageUrl: '',
    visibility: 'public',
  };

  const [playlistState, setPlaylistState] = useState(initialPlaylistState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [overlaySearchTerm, setOverlaySearchTerm] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [createdPlaylists, setCreatedPlaylists] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);

  const { userDataFromDB } = useContext(UserContextAPI);
  const location = useLocation();

  // Fetch created playlists
  const fetchCreatedPlaylists = async () => {
    if (!userDataFromDB?.uid) {
      setCreatedPlaylists([]);
      return;
    }
    try {
      const q = query(collection(__DB, 'playlists'), where('createdBy', '==', userDataFromDB.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCreatedPlaylists(list);
    } catch (err) {
      toast.error('Failed to fetch playlists: ' + err.message);
    }
  };

  useEffect(() => {
    fetchCreatedPlaylists();
  }, [userDataFromDB?.uid]);

  // Song fetch
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(__DB, 'album_collections'));
        const albums = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const all = [];
        albums.forEach(album => {
          if (Array.isArray(album.AllSongs)) {
            album.AllSongs.forEach((song, idx) => {
              all.push({
                ...song,
                id: song.songUrl || `${album.id}_song_${idx}`,
                albumId: album.id,
                albumTitle: album.albumTitle,
                albumPoster: album.albumPoster,
              });
            });
          }
        });
        setAvailableSongs(all);
      } catch (err) {
        toast.error('Failed to fetch songs: ' + err.message);
      }
    })();
  }, []);

  // Load playlist details if editing from navigation state
  useEffect(() => {
    const playlistId = location.state?.playlistId;
    if (playlistId) {
      const loadPlaylist = async () => {
        setIsLoading(true);
        try {
          const docRef = doc(__DB, 'playlists', playlistId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const p = docSnap.data();
            setPlaylistState({
              name: p.name,
              imageUrl: p.imageUrl,
              visibility: p.visibility || 'public',
            });
            setImagePreviewUrl(p.imageUrl);
            setSelectedSongs(
              (p.songs || []).map((s, i) => ({ ...s, order: s.order ?? i }))
            );
            setEditMode(true);
            setEditingPlaylistId(playlistId);
          } else {
            toast.error('Playlist not found');
          }
        } catch (err) {
          toast.error('Failed to load playlist: ' + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      loadPlaylist();
    }
  }, [location.state]);

  // Memoized lists
  const allSongs = useMemo(
    () => availableSongs.map(s => ({ ...s, songMusicDirector: s.songMusicDirector || '' })),
    [availableSongs]
  );
  const allAlbums = useMemo(() => {
    const map = new Map();
    availableSongs.forEach(s => {
      if (!map.has(s.albumId)) {
        map.set(s.albumId, {
          albumId: s.albumId,
          albumTitle: s.albumTitle,
          albumPoster: s.albumPoster,
        });
      }
    });
    return Array.from(map.values());
  }, [availableSongs]);
  const allMusicDirectors = useMemo(() => {
    const set = new Set();
    availableSongs.forEach(s => {
      if (s.songMusicDirector) set.add(s.songMusicDirector);
    });
    return Array.from(set);
  }, [availableSongs]);

  // Filter overlay
  const filteredOverlaySongs = useMemo(() => {
    return overlaySearchTerm
      ? allSongs
          .filter(s =>
            s.songName.toLowerCase().includes(overlaySearchTerm.toLowerCase()) ||
            s.songMusicDirector.toLowerCase().includes(overlaySearchTerm.toLowerCase())
          )
          .filter(s => !selectedSongs.find(sel => sel.id === s.id))
      : [];
  }, [allSongs, overlaySearchTerm, selectedSongs]);

  const filteredOverlayAlbums = useMemo(
    () =>
      overlaySearchTerm
        ? allAlbums.filter(a =>
            a.albumTitle.toLowerCase().includes(overlaySearchTerm.toLowerCase())
          )
        : [],
    [allAlbums, overlaySearchTerm]
  );

  const filteredOverlayDirectors = useMemo(
    () =>
      overlaySearchTerm
        ? allMusicDirectors.filter(d =>
            d.toLowerCase().includes(overlaySearchTerm.toLowerCase())
          )
        : [],
    [allMusicDirectors, overlaySearchTerm]
  );

  // Handlers

  const handleInputChange = e => {
    const { name, value } = e.target;
    setPlaylistState(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = e => {
    const f = e.target.files[0];
    if (f) {
      setImageFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviewUrl(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const reindexSongs = arr => arr.map((s, i) => ({ ...s, order: i }));

  const handleSongAdd = songId => {
    if (selectedSongs.find(s => s.id === songId)) return toast.error('Already added');
    const s = availableSongs.find(song => song.id === songId);
    if (!s) return;
    setSelectedSongs(prev => [
      ...prev,
      {
        id: s.id,
        title: s.songName || s.title,
        image: s.songThumbnail,
        albumId: s.albumId,
        albumTitle: s.albumTitle,
        songDetails: s,
        order: prev.length,
      },
    ]);
  };

  const moveSong = (i, dir) => {
    const dup = [...selectedSongs];
    const j = dir === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= dup.length) return;
    [dup[i], dup[j]] = [dup[j], dup[i]];
    setSelectedSongs(reindexSongs(dup));
  };

  const removeSong = id => {
    const filtered = selectedSongs.filter(s => s.id !== id);
    setSelectedSongs(reindexSongs(filtered));
  };

  const handleDeletePlaylist = async id => {
    if (!window.confirm('Delete this playlist?')) return;
    try {
      await deleteDoc(doc(__DB, 'playlists', id));
      setCreatedPlaylists(prev => prev.filter(p => p.id !== id));
      toast.success('Deleted!');
    } catch (err) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const handleEditPlaylist = id => {
    const p = createdPlaylists.find(x => x.id === id);
    if (!p) return toast.error('Not found');
    setPlaylistState({
      name: p.name,
      imageUrl: p.imageUrl,
      visibility: p.visibility || 'public',
    });
    setImagePreviewUrl(p.imageUrl);
    setSelectedSongs(
      (p.songs || []).map((s, i) => ({ ...s, order: s.order ?? i }))
    );
    setEditMode(true);
    setEditingPlaylistId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    if (!playlistState.name.trim()) return toast.error('Name is required');
    if (!userDataFromDB?.uid) return toast.error('Not authenticated');
    if (selectedSongs.length === 0) return toast.error('Add at least one song');

    setIsLoading(true);
    try {
      let img = imagePreviewUrl || 'https://i.ibb.co/0j5wgtMv/person.png';
      if (imageFile) {
        const form = new FormData();
        form.append('file', imageFile);
        form.append('upload_preset', 'tech_haven_music');
        form.append('cloud_name', 'drmjqysow');
        const res = await fetch(
          'https://api.cloudinary.com/v1_1/drmjqysow/image/upload',
          { method: 'POST', body: form }
        );
        const json = await res.json();
        if (!json.url) throw new Error('Upload failed');
        img = json.url;
      }

      const payload = {
        ...playlistState,
        imageUrl: img,
        createdBy: userDataFromDB.uid,
        updatedAt: new Date(),
        songs: selectedSongs.map(s => ({
          id: s.id,
          title: s.title,
          image: s.image,
          albumId: s.albumId,
          albumTitle: s.albumTitle,
          order: s.order,
          songDetails: s.songDetails,
        })),
      };

      if (editMode) {
        await updateDoc(doc(__DB, 'playlists', editingPlaylistId), payload);
        toast.success('Playlist updated!');
      } else {
        payload.createdAt = new Date();
        await addDoc(collection(__DB, 'playlists'), payload);
        toast.success('Playlist created!');
      }

      setPlaylistState(initialPlaylistState);
      setImageFile(null);
      setImagePreviewUrl(null);
      setSelectedSongs([]);
      setEditMode(false);
      setEditingPlaylistId(null);
      fetchCreatedPlaylists();
    } catch (err) {
      toast.error('Submit failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full  justify-center px-100 py-10 ">
      <article className="w-full max-w-3xl bg-slate-800 rounded p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-white">
          {editMode ? 'Edit Playlist' : 'Create Playlist'}
        </h1>
        <hr className="my-4 border-slate-600" />

        <form onSubmit={handleFormSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-white">
              Playlist Name
            </label>
            <input
              name="name"
              value={playlistState.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded border"
              required
            />
          </div>
          {/* Image */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-white">
              Playlist Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={ref => (window.__imageInputRef = ref)}
              style={{ display: 'none' }}
            />
            <div className="flex gap-4 mb-2">
              <button
                type="button"
                onClick={() => window.__imageInputRef?.click()}
                className="bg-blue-600 px-3 py-1 rounded text-white"
              >
                Add Image
              </button>
              {imagePreviewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreviewUrl(null);
                  }}
                  className="bg-red-600 px-3 py-1 rounded text-white"
                >
                  Remove Image
                </button>
              )}
            </div>
            <div className="flex justify-center">
              <img
                src={imagePreviewUrl || 'https://i.ibb.co/0j5wgtMv/person.png'}
                alt="Playlist"
                className="h-48 w-48 object-cover rounded"
              />
            </div>
          </div>
          {/* Visibility */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-white">
              Visibility
            </label>
            <select
              name="visibility"
              value={playlistState.visibility}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded bg-white text-black"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          {/* Song search */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-white">
              Search & Add Songs
            </label>
            <input
              value={overlaySearchTerm}
              onChange={e => {
                setOverlaySearchTerm(e.target.value);
                setShowOverlay(e.target.value.length > 0);
              }}
              placeholder="Search songs, albums, directors"
              className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            />
          </div>
          {/* Selected songs */}
          {selectedSongs.length > 0 && (
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-white">
                Selected Songs
              </label>
              <ul>
                {selectedSongs
                  .sort((a, b) => a.order - b.order)
                  .map((s, idx) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-2 mb-2 text-white"
                    >
                      <img
                        src={s.image}
                        alt={s.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="flex-grow">{s.title}</span>
                      <button
                        onClick={() => moveSong(idx, 'up')}
                        disabled={idx === 0}
                      >
                        ⬆️
                      </button>
                      <button
                        onClick={() => moveSong(idx, 'down')}
                        disabled={idx === selectedSongs.length - 1}
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => removeSong(s.id)}
                        className="text-red-500"
                      >
                        ❌
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-grow bg-blue-600 py-2 rounded text-white font-semibold"
            >
              {isLoading
                ? editMode
                  ? 'Updating...'
                  : 'Creating...'
                : editMode
                ? 'Update Playlist'
                : 'Create Playlist'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  setPlaylistState(initialPlaylistState);
                  setImageFile(null);
                  setImagePreviewUrl(null);
                  setSelectedSongs([]);
                  setEditMode(false);
                  setEditingPlaylistId(null);
                }}
                disabled={isLoading}
                className="flex-shrink-0 bg-gray-600 py-2 px-4 rounded text-white font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </article>

      {/* Search Overlay */}
      {showOverlay && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-40" />
          <div className="fixed inset-0 z-50 flex justify-center items-start pt-20 overflow-auto">
            <div className="bg-gray-900 text-white p-6 rounded-lg w-11/12 max-w-3xl max-h-[85vh] overflow-auto shadow-lg relative">
              <button
                onClick={() => {
                  setOverlaySearchTerm('');
                  setShowOverlay(false);
                }}
                className="absolute top-2 right-2 text-xl font-bold hover:text-red-500"
              >
                &times;
              </button>
              <input
                value={overlaySearchTerm}
                onChange={e => setOverlaySearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full p-2 rounded mb-4 bg-gray-700"
              />
              {filteredOverlaySongs.length === 0 &&
              filteredOverlayAlbums.length === 0 &&
              filteredOverlayDirectors.length === 0 ? (
                <p>No results for "{overlaySearchTerm}"</p>
              ) : (
                <>
                  {filteredOverlaySongs.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-xl mb-2">Songs</h3>
                      <ul>
                        {filteredOverlaySongs.map(s => (
                          <li
                            key={s.id}
                            className="flex items-center gap-2 mb-2"
                          >
                            <img
                              src={s.songThumbnail}
                              alt={s.songName}
                              className="h-8 w-8 rounded"
                            />
                            <span className="flex-1">
                              {s.songName} - <em>{s.songMusicDirector}</em>
                            </span>
                            <button
                              className="bg-green-600 px-2 py-1 rounded"
                              onClick={() => {
                                handleSongAdd(s.id);
                                toast.success('Song added!');
                              }}
                            >
                              ➕
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {filteredOverlayAlbums.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-xl mb-2">Albums</h3>
                      <ul>
                        {filteredOverlayAlbums.map(a => (
                          <li key={a.albumId} className="flex items-center gap-2">
                            <img
                              src={a.albumPoster}
                              alt={a.albumTitle}
                              className="h-8 w-8 rounded"
                            />
                            <span>{a.albumTitle}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {filteredOverlayDirectors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-xl mb-2">
                        Music Directors
                      </h3>
                      <ul className="list-disc ml-4">
                        {filteredOverlayDirectors.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {isLoading && <Spinner />}

      {/* Created Playlists */}
      <div className="w-full max-w-3xl mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Your Playlists</h2>
        {createdPlaylists.length === 0 ? (
          <p className="text-gray-300">No playlists found.</p>
        ) : (
          <ul className="space-y-4">
            {createdPlaylists.map(p => (
              <li
                key={p.id}
                className="flex items-center justify-between bg-slate-700 p-4 rounded"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="text-white font-semibold">{p.name}</h3>
                    <p className="text-gray-300 text-sm">
                      {p.songs?.length || 0} songs
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPlaylist(p.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-white"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlaylist(p.id)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default CreatePlaylist;
