import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import toast from 'react-hot-toast';
import { FaDownload } from 'react-icons/fa';

const DownloadSongs = () => {
  const [albums, setAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const snapshot = await getDocs(collection(__DB, 'album_collections'));
        const albumsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlbums(albumsData);
        // Initialize filteredSongs with all songs
        const allSongs = albumsData.flatMap(album =>
          (album.AllSongs || []).map(song => ({
            ...song,
            albumId: album.id,
            albumTitle: album.albumTitle,
          }))
        );
        setFilteredSongs(allSongs);
      } catch (error) {
        toast.error('Failed to fetch albums: ' + error.message);
      }
    };
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      // Show all songs if no search term
      const allSongs = albums.flatMap(album =>
        (album.AllSongs || []).map(song => ({
          ...song,
          albumId: album.id,
          albumTitle: album.albumTitle,
        }))
      );
      setFilteredSongs(allSongs);
    } else {
      // Filter songs by search term (case-insensitive)
      const lowerSearch = searchTerm.toLowerCase();
      const matchedSongs = albums.flatMap(album =>
        (album.AllSongs || [])
          .filter(song => song.songName?.toLowerCase().includes(lowerSearch))
          .map(song => ({
            ...song,
            albumId: album.id,
            albumTitle: album.albumTitle,
          }))
      );
      setFilteredSongs(matchedSongs);
    }
  }, [searchTerm, albums]);

  const downloadSong = async (song) => {
    try {
      const response = await fetch(song.songUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = song.songName || 'song.mp3';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Song downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed');
    }
  };

  // Group filtered songs by album
  const songsByAlbum = filteredSongs.reduce((acc, song) => {
    if (!acc[song.albumId]) {
      acc[song.albumId] = {
        albumTitle: song.albumTitle,
        songs: [],
      };
    }
    acc[song.albumId].songs.push(song);
    return acc;
  }, {});

  return (
    <section className="p-6 bg-slate-800 rounded-md max-w-6xl mx-auto text-white mt-10">
      <h1 className="text-3xl font-semibold mb-6">Download your Favourite Songs</h1>

      <input
        type="text"
        placeholder="Search songs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 rounded-md border-2 border-white placeholder-gray-300 text-white
            focus:outline-none focus:ring-2 focus:ring-white"      />

      {Object.keys(songsByAlbum).length === 0 ? (
        <p>No songs found.</p>
      ) : (
        Object.entries(songsByAlbum).map(([albumId, { albumTitle, songs }]) => (
          <div key={albumId} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">{albumTitle}</h2>
            <ul>
              {songs.map((song) => (
                <li key={song.songUrl || song.id} className="flex justify-between items-center mb-2 bg-slate-700 p-3 rounded-md">
                  <div className="flex items-center space-x-4">
                    <img
                      src={song.songThumbnail || song.thumbnail || ''}
                      alt={song.songName || 'Song thumbnail'}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                    <div>
                      <p className="font-semibold">{song.songName}</p>
                      <p className="text-sm text-gray-300">{song.songSingers}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadSong(song)}
                    className="bg-green-600 hover:bg-green-700 text-white py-1 px-4 rounded-md"
                  >
                    <FaDownload />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
};

export default DownloadSongs;