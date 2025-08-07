import React, { useEffect, useState, useContext } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import { NavLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import Spinner from '../utilities/Spinner';
import { AuthContextAPI } from '../context/AuthContext';
import {
  FaUser,
  FaCompactDisc,
  FaPlay,
  FaSmile,
  FaChartBar,
  FaUsers
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { authUser } = useContext(AuthContextAPI);

  const [userCount, setUserCount] = useState(0);
  const [albumCount, setAlbumCount] = useState(0);
  const [totalPlayCount, setTotalPlayCount] = useState(0);
  const [moodCount, setMoodCount] = useState(0);
  const [mostPlayedAlbum, setMostPlayedAlbum] = useState(null);
  const [recentAlbums, setRecentAlbums] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch total user count
  const fetchUserCount = async () => {
    try {
      const userSnapshot = await getDocs(collection(__DB, 'user_profile'));
      setUserCount(userSnapshot.size);
    } catch (error) {
      toast.error('Error fetching users: ' + error.message);
    }
  };

  // Fetch total albums and process stats
  const fetchRecentAlbums = async () => {
    try {
      const albumSnapshot = await getDocs(collection(__DB, 'album_collections'));
      const albums = albumSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      albums.sort((a, b) => (a.id < b.id ? 1 : -1));
      setRecentAlbums(albums.slice(0, 3));

      let totalPlays = 0;
      let moods = new Set();
      let topAlbum = null;

      albums.forEach(album => {
        totalPlays += album.playCount || 0;
        if (album.mood) moods.add(album.mood);
        if (!topAlbum || (album.playCount || 0) > (topAlbum.playCount || 0)) {
          topAlbum = album;
        }
      });

      setAlbumCount(albums.length);
      setTotalPlayCount(totalPlays);
      setMoodCount(moods.size);
      setMostPlayedAlbum(topAlbum);
    } catch (error) {
      toast.error('Error fetching albums: ' + error.message);
    }
  };

  // Fetch last 3 users
  const fetchRecentUsers = async () => {
    try {
      const userSnapshot = await getDocs(collection(__DB, 'user_profile'));
      const users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      users.sort((a, b) => (a.id < b.id ? 1 : -1));
      setRecentUsers(users.slice(0, 3));
    } catch (error) {
      toast.error('Error fetching users: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserCount(),
        fetchRecentAlbums(),
        fetchRecentUsers()
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="w-full h-full overflow-y-auto p-6 text-white bg-slate-900">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">
          Welcome, {authUser?.displayName || authUser?.email || 'Admin'}!
        </h1>
      </header>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <DashboardCard icon={<FaUsers />} label="Total Users" value={userCount} />
        <DashboardCard icon={<FaCompactDisc />} label="Total Albums" value={albumCount} />
        <DashboardCard icon={<FaPlay />} label="Total Play Count" value={totalPlayCount} />
        <DashboardCard icon={<FaSmile />} label="Unique Moods" value={moodCount} />
        <DashboardCard
          icon={<FaChartBar />}
          label="Most Played Album"
          value={mostPlayedAlbum?.albumTitle || 'N/A'}
          isSmall
        />
      </div>

      {/* Recent Albums */}
      <Section title="Recent Albums">
        {recentAlbums.length === 0 ? (
          <p>No recent albums found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentAlbums.map(album => (
              <NavLink
                key={album.id}
                to={`/admin/edit-album/${album.id}`}
                className="bg-slate-700 hover:bg-slate-600 rounded-md p-4 block"
              >
                <img
                  src={album.albumPoster}
                  alt={album.albumTitle}
                  className="w-48 h-64 object-cover rounded-md mb-2 mx-auto"
                />
                <h3 className="text-lg font-semibold text-center">{album.albumTitle}</h3>
              </NavLink>
            ))}
          </div>
        )}
      </Section>

      {/* Recent Users */}
      <Section title="Recent Users">
        {recentUsers.length === 0 ? (
          <p>No recent users found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentUsers.map(user => (
              <div key={user.id} className="bg-slate-700 rounded-md p-4 text-center">
                <FaUser className="text-4xl mb-2 mx-auto" />
                <p className="text-lg font-semibold">{user.displayName || user.email || 'User'}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Navigation */}
      <Section title="Navigation">
        <div className="flex flex-wrap gap-4">
          <NavLink
            to="/admin/analytics"
            className="bg-blue-600 hover:bg-blue-800 py-2 px-4 rounded-md flex items-center gap-2"
          >
            <FaChartBar /> Analytics
          </NavLink>
        </div>
      </Section>
    </div>
  );
};

export default AdminDashboard;

// Utility components

const DashboardCard = ({ icon, label, value, isSmall = false }) => (
  <div className="bg-slate-700 rounded-md p-4 text-center flex flex-col items-center">
    <div className="text-4xl mb-2">{icon}</div>
    <h2 className="text-xl font-semibold mb-2">{label}</h2>
    <p className={`font-bold ${isSmall ? 'text-lg' : 'text-4xl'}`}>{value}</p>
  </div>
);

const Section = ({ title, children }) => (
  <section className="mb-6">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    {children}
  </section>
);
