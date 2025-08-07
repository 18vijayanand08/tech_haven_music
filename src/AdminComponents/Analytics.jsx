import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import toast from 'react-hot-toast';
import Spinner from '../utilities/Spinner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'];

const Analytics = () => {
  const [userCount, setUserCount] = useState(0);
  const [albumCount, setAlbumCount] = useState(0);
  const [totalPlayCount, setTotalPlayCount] = useState(0);
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [albumPlayData, setAlbumPlayData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserCount = async () => {
    try {
      const userCollectionRef = collection(__DB, 'user_profile');
      const userSnapshot = await getDocs(userCollectionRef);
      setUserCount(userSnapshot.size);

      const growthData = [
        { date: 'Jan 2023', users: 10 },
        { date: 'Feb 2023', users: 20 },
        { date: 'Mar 2023', users: 35 },
        { date: 'Apr 2023', users: 50 },
        { date: 'May 2023', users: userSnapshot.size },
      ];
      setUserGrowthData(growthData);
    } catch (error) {
      toast.error('Failed to fetch user count: ' + error.message);
    }
  };

  const fetchAlbumData = async () => {
    try {
      const albumCollectionRef = collection(__DB, 'album_collections');
      const albumSnapshot = await getDocs(albumCollectionRef);
      setAlbumCount(albumSnapshot.size);

      let totalPlays = 0;
      const moodCountMap = {};
      const playData = [];

      albumSnapshot.docs.forEach(doc => {
        const data = doc.data();
        totalPlays += data.playCount || 0;
        if (data.mood) {
          moodCountMap[data.mood] = (moodCountMap[data.mood] || 0) + 1;
        }
        playData.push({ name: data.albumTitle || 'Unknown', plays: data.playCount || 0 });
      });
      setTotalPlayCount(totalPlays);

      const moodData = Object.entries(moodCountMap).map(([key, value]) => ({ name: key, value }));
      if (moodData.length === 0) {
        toast('No mood data available for distribution chart');
      }
      setMoodDistribution(moodData);

      playData.sort((a, b) => b.plays - a.plays);
      setAlbumPlayData(playData.slice(0, 5));
    } catch (error) {
      toast.error('Failed to fetch album data: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchUserCount(), fetchAlbumData()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  return (
    <section className="p-6 bg-slate-800 rounded-md min-h-[600px] text-white">
      <h1 className="text-3xl font-semibold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-700 rounded-md p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-4xl">{userCount}</p>
        </div>
        <div className="bg-slate-700 rounded-md p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Total Albums</h2>
          <p className="text-4xl">{albumCount}</p>
        </div>
        <div className="bg-slate-700 rounded-md p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Total Play Count</h2>
          <p className="text-4xl">{totalPlayCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-700 rounded-md p-4">
          <h2 className="text-xl font-semibold mb-4">User Growth Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#64748b', color: '#fff' }} />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-700 rounded-md p-4">
          <h2 className="text-xl font-semibold mb-4">Top 5 Most Played Albums</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={albumPlayData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#64748b', color: '#fff' }} />
              <Legend />
              <Bar dataKey="plays">
                {albumPlayData.map((entry, index) => (
                  <Cell key={index} fill={index === 0 ? '#f87171' : '#82ca9d'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-700 rounded-md p-4 mt-6">
        <h2 className="text-xl font-semibold mb-4">Mood Distribution</h2>
        {moodDistribution.length === 0 ? (
          <p>No mood data available for distribution chart.</p>
        ) : (
          <>
            <div className="mb-4 text-sm space-y-1">
              {moodDistribution.map((item, idx) => (
                <div key={idx}>
                  <span style={{ color: COLORS[idx % COLORS.length] }}>⬤</span> {item.name}: {item.value}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#64748b', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </section>
  );
};

export default Analytics;
