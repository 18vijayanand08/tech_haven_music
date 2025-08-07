
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { __DB } from '../backend/firebase';
import toast from 'react-hot-toast';

const EditAlbums = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [albumData, setAlbumData] = useState({
    albumTitle: '',
    albumReleaseDate: '',
    albumLanguage: '',
    albumDescription: '',
    songName: '',
    songSingers: '',
    songMood: '',
    songMusicDirector: '',
    albumPoster: '', // added albumPoster url string
  });

  const [albumThumbnailPoster, setAlbumThumbnailPoster] = useState(null); // for new album thumbnail file

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchAlbum = async () => {
    setLoading(true);
    try {
      const albumRef = doc(__DB, 'album_collections', id);
      const albumSnap = await getDoc(albumRef);
      if (albumSnap.exists()) {
        const data = albumSnap.data();
        setAlbumData({
          albumTitle: data.albumTitle || '',
          albumReleaseDate: data.albumReleaseDate || '',
          albumLanguage: data.albumLanguage || '',
          albumDescription: data.albumDescription || '',
          songName: data.songName || '',
          songSingers: data.songSingers || '',
          songMood: data.songMood || '',
          songMusicDirector: data.songMusicDirector || '',
          albumPoster: data.albumPoster || '',
        });

        // Fetch songs from AllSongs array field
        const songsList = data.AllSongs || [];
        setSongs(songsList);
      } else {
        toast.error('Album not found');
        navigate('/admin/all-albums');
      }
    } catch (error) {
      toast.error('Failed to fetch album: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlbumData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAlbumPoster = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAlbumThumbnailPoster(file);
    }
  };

  const handleSongFieldChange = (index, e) => {
    const { name, value } = e.target;
    setSongs((prev) =>
      prev.map((song, i) => (i === index ? { ...song, [name]: value } : song))
    );
  };

  const handleSongFileChange = (index, name, e) => {
    const file = e.target.files[0];
    if (file) {
      setSongs((prev) =>
        prev.map((song, i) => (i === index ? { ...song, [name]: file } : song))
      );
    }
  };

  const deleteSong = (index) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;
    setSongs((prev) => prev.filter((_, i) => i !== index));
    toast.success('Song deleted successfully');
  };

  const uploadFileToCloudinary = async (file, resourceType = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'tech_haven_music');
    formData.append('cloud_name', 'drmjqysow');

    const url = `https://api.cloudinary.com/v1_1/drmjqysow/${resourceType}/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // Upload album thumbnail if new file selected
      let albumPosterUrl = albumData.albumPoster;
      if (albumThumbnailPoster) {
        const albumPosterUpload = await uploadFileToCloudinary(albumThumbnailPoster, 'image');
        albumPosterUrl = albumPosterUpload.url || albumPosterUrl;
      }

      // Upload song files if new files selected
      const updatedSongs = await Promise.all(
        songs.map(async (song) => {
          let songUrl = song.songUrl;
          let songThumbnail = song.songThumbnail;

          // If songUrl is a File object, upload it
          if (song.songUrl instanceof File) {
            const songUrlUpload = await uploadFileToCloudinary(song.songUrl, 'video');
            songUrl = songUrlUpload.url || songUrl;
          }

          // If songThumbnail is a File object, upload it
          if (song.songThumbnail instanceof File) {
            const songThumbnailUpload = await uploadFileToCloudinary(song.songThumbnail, 'image');
            songThumbnail = songThumbnailUpload.url || songThumbnail;
          }

          return {
            ...song,
            songUrl,
            songThumbnail,
          };
        })
      );

      const albumRef = doc(__DB, 'album_collections', id);
      await updateDoc(albumRef, { ...albumData, albumPoster: albumPosterUrl, AllSongs: updatedSongs });
      toast.success('Album and songs updated successfully');
      navigate('/admin/all-albums');
    } catch (error) {
      toast.error('Failed to update album: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading album data...</div>;
  }

  return (
    <section className="p-6 bg-slate-800 rounded-md max-w-5xl mx-auto text-white mt-20">
      <h1 className="text-2xl font-semibold text-center mb-8">Edit Album</h1>

      {/* Album Section */}
      <div className="bg-slate-700 rounded-md p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Album Title</label>
            <input
              type="text"
              name="albumTitle"
              value={albumData.albumTitle}
              onChange={handleChange}
              className="p-2 rounded-md bg-gray-600 text-white border border-gray-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Album Poster</label>
            <input
              type="file"
              name="albumPoster"
              onChange={handleAlbumPoster}
              className="p-2 rounded-md bg-gray-600 text-white border border-gray-500 file:bg-blue-600 file:rounded-sm file:px-2"
            />
            {albumData.albumPoster && !albumThumbnailPoster && (
              <img src={albumData.albumPoster} alt="Album Poster" className="mt-2 w-32 h-32 object-cover rounded-md" />
            )}
            {albumThumbnailPoster && (
              <p className="mt-2 text-sm">New album poster selected: {albumThumbnailPoster.name}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Album Release Date</label>
            <input
              type="date"
              name="albumReleaseDate"
              value={albumData.albumReleaseDate}
              onChange={handleChange}
              className="p-2 rounded-md bg-gray-600 text-white border border-gray-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Album Language</label>
            <input
              type="text"
              name="albumLanguage"
              value={albumData.albumLanguage}
              onChange={handleChange}
              className="p-2 rounded-md bg-gray-600 text-white border border-gray-500"
              required
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-semibold">Album Description</label>
            <textarea
              name="albumDescription"
              value={albumData.albumDescription}
              onChange={handleChange}
              rows={5}
              className="p-2 rounded-md bg-gray-600 text-white border border-gray-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Songs Section */}
      <div className="w-full">
        <h2 className="text-xl font-semibold mb-4">Songs</h2>

        <button
          type="button"
          onClick={() => setSongs(prev => [...prev, {
            songName: '',
            songUrl: '',
            songThumbnail: '',
            songSingers: '',
            songMood: '',
            songMusicDirector: '',
          }])}
          className="mb-4 bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-md"
        >
          Add New Song
        </button>

        {songs.length === 0 ? (
          <p className="text-center">No songs added yet.</p>
        ) : (
          songs.map((song, index) => (
            <div key={index} className="bg-slate-700 rounded-md p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="mb-1 font-semibold">Song Name</label>
                  <input
                    type="text"
                    name="songName"
                    value={song.songName || ''}
                    onChange={(e) => handleSongFieldChange(index, e)}
                    className="p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 font-semibold">Song URL</label>
                  <input
                    type="file"
                    name="songUrl"
                    onChange={(e) => handleSongFileChange(index, 'songUrl', e)}
                    className="p-2 rounded-md bg-gray-600 text-white border border-gray-500 file:bg-blue-600 file:rounded-sm file:px-2"
                  />
                  {typeof song.songUrl === 'string' && !song.songUrl.startsWith('blob:') && (
                    <audio controls className="mt-2">
                      <source src={song.songUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                  {song.songUrl instanceof File && (
                    <p className="mt-2 text-sm">New song file selected: {song.songUrl.name}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 font-semibold">Song Thumbnail</label>
                  <input
                    type="file"
                    name="songThumbnail"
                    onChange={(e) => handleSongFileChange(index, 'songThumbnail', e)}
                    className="p-2 rounded-md bg-gray-600 text-white border border-gray-500 file:bg-blue-600 file:rounded-sm file:px-2"
                  />
                  {typeof song.songThumbnail === 'string' && (
                    <img
                      src={song.songThumbnail}
                      alt="Song Thumbnail"
                      className="mt-2 w-24 h-24 object-cover rounded-md"
                    />
                  )}
                  {song.songThumbnail instanceof File && (
                    <p className="mt-2 text-sm">New song thumbnail selected: {song.songThumbnail.name}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 font-semibold">Song Singers</label>
                  <input
                    type="text"
                    name="songSingers"
                    value={song.songSingers || ''}
                    onChange={(e) => handleSongFieldChange(index, e)}
                    className="p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 font-semibold">Song Mood</label>
                  <input
                    type="text"
                    name="songMood"
                    value={song.songMood || ''}
                    onChange={(e) => handleSongFieldChange(index, e)}
                    className="p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 font-semibold">Music Director</label>
                  <input
                    type="text"
                    name="songMusicDirector"
                    value={song.songMusicDirector || ''}
                    onChange={(e) => handleSongFieldChange(index, e)}
                    className="p-2 rounded-md bg-gray-600 text-white border border-gray-500"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => deleteSong(index)}
                  className="bg-red-600 hover:bg-red-800 text-white py-1 px-4 rounded-md"
                >
                  Delete Song
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Update Button After Song Section */}
      <div className="flex justify-end mt-10 space-x-4">
        <button
          type="button"
          onClick={() => navigate('/admin/all-albums')}
          className="bg-gray-600 hover:bg-gray-800 py-2 px-6 rounded-md font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={updating}
          className="bg-blue-600 hover:bg-blue-800 py-2 px-6 rounded-md font-semibold"
        >
          {updating ? 'Updating...' : 'Update Album'}
        </button>
      </div>
    </section>
  );
};

export default EditAlbums;
