import React, { useEffect, useState, useContext } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { __DB } from '../Backend/firebase';
import toast from 'react-hot-toast';
import { NavLink } from 'react-router-dom'; // ✅ import NavLink
import { UserContextAPI } from '../context/UserContext';

const MusicContainersDisplay = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userDataFromDB, addFavorite, removeFavorite } = useContext(UserContextAPI);

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const q = query(collection(__DB, 'music_containers'), orderBy('order'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(container => container.visible);
      setContainers(data);
    } catch (error) {
      toast.error('Error fetching music containers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const isFavorite = (albumId) => {
    return userDataFromDB?.favorites?.includes(albumId);
  };

  const toggleFavorite = (albumId) => {
    if (isFavorite(albumId)) {
      removeFavorite(albumId);
    } else {
      addFavorite(albumId);
    }
  };

  if (loading) {
    return <p>Loading music containers...</p>;
  }

  if (containers.length === 0) {
    return <p>No music containers available.</p>;
  }

  return (
    <section className="p-6">
      {containers.map(container => (
        <div key={container.id} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{container.name}</h2>
          {container.description && <p className="mb-4">{container.description}</p>}
          <div className="flex flex-wrap gap-4">
            {container.items && container.items.length > 0 ? (
              container.items
                .sort((a, b) => a.order - b.order)
                .map(item => (
                  <div
                    key={item.albumId}
                    className="h-[260px] w-[200px] p-3 bg-slate-800 rounded-md relative flex flex-col items-center"
                  >
                    <NavLink
                      to="/album-details"
                      state={{
                        albumId: item.albumId,
                        albumTitle: item.title,
                        albumPoster: item.image,
                        albumLanguage: item.albumLanguage,
                        albumDescription: item.albumDescription,
                        albumReleaseDate: item.albumReleaseDate,
                        AllSongs: item.AllSongs,
                      }}
                      className="block"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-[200px] w-[180px] rounded-lg"
                      />
                    </NavLink>
                    <div className="pt-2 w-full flex items-center justify-between">
                      <p className="font-semibold text-[16px] truncate">{item.title}</p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(item.albumId);
                        }}
                        className="text-white text-xl ml-2"
                        aria-label={isFavorite(item.albumId) ? "Remove from favorites" : "Add to favorites"}
                      >
                        {isFavorite(item.albumId) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <p>No albums in this container.</p>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default MusicContainersDisplay;
