import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import toast from 'react-hot-toast';
import Spinner from '../Utilities/Spinner'; // ✅ Import spinner

const AllAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const albumCollectionRef = collection(__DB, 'album_collections');
      const albumSnapshot = await getDocs(albumCollectionRef);
      const albumList = albumSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlbums(albumList);
    } catch (error) {
      toast.error('Failed to fetch albums: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this album?')) return;
    try {
      await deleteDoc(doc(__DB, 'album_collections', id));
      toast.success('Album deleted successfully');
      fetchAlbums();
    } catch (error) {
      toast.error('Failed to delete album: ' + error.message);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return (
    <section className="p-6 bg-slate-800 rounded-md min-h-[400px] text-white">
      <header>
        <h1 className="text-2xl font-semibold mb-4">All Albums</h1>
      </header>
      {loading ? (
        <Spinner />
      ) : albums.length === 0 ? (
        <p>No albums found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {albums.map((album) => (
            <div key={album.id} className="bg-slate-700 rounded-md p-4">
              <img
                src={album.albumPoster}
                alt={album.albumTitle}
                className="w-full h-48 object-contain rounded-md mb-2"
              />
              <h2 className="text-lg font-semibold">{album.albumTitle}</h2>
              <p className="text-sm mb-2">{album.albumDescription}</p>
              <button
                onClick={() => handleDelete(album.id)}
                className="bg-red-600 hover:bg-red-800 text-white py-1 px-3 rounded-md mr-2"
              >
                Delete
              </button>
              <NavLink
                to={`/admin/edit-album/${album.id}`}
                className="bg-blue-600 hover:bg-blue-800 text-white py-1 px-3 rounded-md"
              >
                Edit
              </NavLink>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AllAlbums;
