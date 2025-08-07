import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const SongContainers = () => {
  const [containers, setContainers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingContainer, setEditingContainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    visible: true,
    items: [],
  });

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const q = query(collection(__DB, 'song_containers'), orderBy('order'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContainers(data);
    } catch (error) {
      toast.error('Error fetching containers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSongs = async () => {
    try {
      // Assuming songs are stored in album_collections under AllSongs array,
      // we flatten all songs from all albums for selection.
      const q = query(collection(__DB, 'album_collections'));
      const snapshot = await getDocs(q);
      const albums = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      let allSongs = [];
      albums.forEach(album => {
        if (album.AllSongs && Array.isArray(album.AllSongs)) {
          const songsWithAlbumId = album.AllSongs.map((song, index) => ({
            ...song,
            id: song.songUrl || `${album.id}_song_${index}`, // fallback id
            albumId: album.id,
            albumTitle: album.albumTitle,
          }));
          allSongs = allSongs.concat(songsWithAlbumId);
        }
      });
      setSongs(allSongs);
    } catch (error) {
      toast.error('Error fetching songs: ' + error.message);
    }
  };

  useEffect(() => {
    fetchContainers();
    fetchSongs();
  }, []);

  const resetForm = () => {
    setEditingContainer(null);
    setFormData({
      name: '',
      description: '',
      order: containers.length,
      visible: true,
      items: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddItem = (songId) => {
    if (!songId) return;
    if (formData.items.find(item => item.id === songId)) {
      toast.error('Song already added');
      return;
    }
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    const newItem = {
      id: song.id,
      title: song.songName || song.title || '',
      image: song.songThumbnail || '',
      order: formData.items.length,
      albumId: song.albumId || '',
      albumTitle: song.albumTitle || '',
      songDetails: song,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (songId) => {
    setFormData(prev => {
      const filtered = prev.items.filter(item => item.id !== songId);
      const reordered = filtered.map((item, index) => ({ ...item, order: index }));
      return { ...prev, items: reordered };
    });
  };

  const moveItem = (index, direction) => {
    setFormData(prev => {
      const items = [...prev.items];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
      items[index].order = index;
      items[targetIndex].order = targetIndex;
      return { ...prev, items };
    });
  };

  const saveContainer = async () => {
    const { name, description, order, visible, items } = formData;
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      if (editingContainer) {
        const ref = doc(__DB, 'song_containers', editingContainer.id);
        await updateDoc(ref, { name, description, order: Number(order), visible, items });
        toast.success('Container updated');
      } else {
        await addDoc(collection(__DB, 'song_containers'), {
          name,
          description,
          order: Number(order),
          visible,
          createdAt: new Date(),
          items,
        });
        toast.success('Container created');
      }
      await fetchContainers();
      resetForm();
    } catch (error) {
      toast.error('Error saving container: ' + error.message);
    }
  };

  const editContainer = (container) => {
    setEditingContainer(container);
    setFormData({
      name: container.name || '',
      description: container.description || '',
      order: container.order || 0,
      visible: container.visible ?? true,
      items: container.items || [],
    });
  };

  const deleteContainer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this container?')) return;
    try {
      await deleteDoc(doc(__DB, 'song_containers', id));
      toast.success('Container deleted');
      await fetchContainers();
    } catch (error) {
      toast.error('Error deleting container: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-slate-800 rounded-md text-white min-h-[500px]">
      <h1 className="text-3xl font-semibold mb-6">Song Content Containers</h1>

      {/* Container Form */}
      <div className="mb-6 bg-slate-700 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">{editingContainer ? 'Edit Container' : 'Create Container'}</h2>
        <div className="mb-4">
          <label className="block mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 rounded border border-gray-400 text-black"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 rounded border border-gray-400 text-black"
          />
        </div>
        <div className="mb-4 flex items-center gap-4">
          <label className="block">Order</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleInputChange}
            className="w-20 p-2 rounded border border-gray-400 text-black"
            min={0}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="visible"
              checked={formData.visible}
              onChange={handleInputChange}
            />
            Visible
          </label>
        </div>

        {/* Items Management */}
        <div className="mb-4">
          <label className="block mb-1">Add Song</label>
          <select
            onChange={(e) => {
              handleAddItem(e.target.value);
              e.target.value = '';
            }}
            className="w-full p-2 rounded border border-gray-400 text-black"
            defaultValue=""
          >
            <option value="" disabled>Select a song</option>
            {songs.map(song => (
              <option key={song.id} value={song.id}>{song.songName || song.title}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Songs in Container</label>
          {formData.items.length === 0 ? (
            <p>No songs added.</p>
          ) : (
            <ul>
              {formData.items
                .sort((a, b) => a.order - b.order)
                .map((item, index) => (
                  <li key={item.id} className="flex items-center gap-2 mb-2">
                    <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded" />
                    <span className="flex-grow">{item.title}</span>
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 bg-gray-600 rounded disabled:opacity-50"
                      title="Move Up"
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === formData.items.length - 1}
                      className="p-1 bg-gray-600 rounded disabled:opacity-50"
                      title="Move Down"
                    >
                      <FaArrowDown />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 bg-red-600 rounded"
                      title="Remove"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={saveContainer}
            className="bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded"
          >
            {editingContainer ? 'Update Container' : 'Create Container'}
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-600 hover:bg-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Existing Containers List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Containers</h2>
        {loading ? (
          <p>Loading containers...</p>
        ) : containers.length === 0 ? (
          <p>No containers found.</p>
        ) : (
          <ul>
            {containers.map(container => (
              <li key={container.id} className="mb-4 p-4 bg-slate-700 rounded">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{container.name}</h3>
                    <p className="text-sm">{container.description}</p>
                    <p className="text-xs">Order: {container.order}</p>
                    <p className="text-xs">Visible: {container.visible ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editContainer(container)}
                      className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 rounded"
                      title="Edit Container"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteContainer(container.id)}
                      className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                      title="Delete Container"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                {container.items && container.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Songs:</h4>
                    <ul className="grid grid-cols-3 gap-2">
                      {container.items
                        .sort((a, b) => a.order - b.order)
                        .map(item => (
                          <li key={item.id} className="flex flex-col items-center">
                            <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                            <span className="text-sm mt-1">{item.title}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SongContainers;
