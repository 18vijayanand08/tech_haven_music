import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { __DB } from '../backend/firebase';

const Playlists = () => {
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPublicPlaylists = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(__DB, 'playlists'), where('visibility', '==', 'public'));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPublicPlaylists(list);
    } catch (err) {
      toast.error('Failed to fetch public playlists: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicPlaylists();
  }, []);

  return (
    <section className="w-full flex justify-center px-4 py-10">
      <article className="w-full max-w-5xl bg-slate-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-semibold text-center text-white mb-6">Public Playlists</h1>

        {isLoading ? (
          <p className="text-white text-center">Loading...</p>
        ) : publicPlaylists.length === 0 ? (
          <p className="text-gray-300 text-center">No public playlists found.</p>
        ) : (
          <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {publicPlaylists.map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/playlist/${p.id}`)}
                className="bg-slate-700 hover:bg-slate-600 transition rounded-lg p-4 shadow-md cursor-pointer flex flex-col justify-between"
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-[160px] w-full object-cover rounded-md"
                />
                <p className="text-white font-semibold text-lg mt-3 truncate">{p.name}</p>
                <p className="text-sm text-gray-300">{p.songs?.length || 0} songs</p>
              </div>
            ))}
          </main>
        )}
      </article>
    </section>
  );
};

export default Playlists;
