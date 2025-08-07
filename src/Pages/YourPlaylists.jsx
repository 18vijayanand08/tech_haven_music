import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import { UserContextAPI } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const YourPlaylists = () => {
  const { userDataFromDB } = useContext(UserContextAPI);
  const [privatePlaylists, setPrivatePlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const navigate = useNavigate();

  const fetchPrivatePlaylists = async () => {
    if (!userDataFromDB?.uid) {
      setPrivatePlaylists([]);
      return;
    }
    setIsLoading(true);
    try {
      const q = query(
        collection(__DB, 'playlists'),
        where('createdBy', '==', userDataFromDB.uid),
        where('visibility', 'in', ['private', 'public'])
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPrivatePlaylists(list);
    } catch (err) {
      toast.error('Failed to fetch your playlists: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivatePlaylists();
  }, [userDataFromDB?.uid]);

  const handleDeleteClick = (playlistId) => {
    setConfirmDeleteId(playlistId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteDoc(doc(__DB, 'playlists', confirmDeleteId));
      setPrivatePlaylists((prev) => prev.filter((pl) => pl.id !== confirmDeleteId));
      toast.success('Playlist deleted successfully');
    } catch (err) {
      toast.error('Failed to delete playlist: ' + err.message);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return (
    <section className="w-full flex justify-center px-4 py-10">
      <article className="w-full max-w-5xl bg-slate-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-white mb-6">
          Your Private Playlists
        </h1>

        {isLoading ? (
          <p className="text-white text-center">Loading...</p>
        ) : privatePlaylists.length === 0 ? (
          <p className="text-gray-300 text-center">No private playlists found.</p>
        ) : (
          <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {privatePlaylists.map(p => (
              <div
                key={p.id}
                className="bg-slate-700 hover:bg-slate-600 transition rounded-lg p-4 flex flex-col justify-between shadow-md"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/playlist/${p.id}`)}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-[160px] w-full object-cover rounded-md"
                  />
                  <p className="text-white font-semibold text-lg mt-3 truncate">{p.name}</p>
                  <p className="text-sm text-gray-300">{p.songs?.length || 0} songs</p>
                </div>

                <div className="flex justify-between mt-4 gap-2">
                  <button
                    onClick={() => navigate('/create-playlist', { state: { playlistId: p.id } })}
                    className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-white w-full"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(p.id);
                    }}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white w-full"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </main>
        )}

        {/* Delete confirmation modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-slate-800 rounded-md p-6 max-w-sm w-full text-white">
              <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
              <p className="mb-6">Are you sure you want to delete this playlist?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelDelete}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </article>
    </section>
  );
};

export default YourPlaylists;
