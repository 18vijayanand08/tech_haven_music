import React, { useContext, useMemo } from 'react';
import { AlbumContextAPI } from '../../context/AlbumContext';
import { AudioPlayerContextAPI } from '../../context/AudioPlayerContext';
import { UserContextAPI } from '../../context/UserContext';

const TrendingSongs = () => {
  const { allAlbums } = useContext(AlbumContextAPI);
  const { setSongs, setCurrentSongIndex, isPlaying, setIsPlaying } = useContext(AudioPlayerContextAPI);
  const { userDataFromDB, addFavorite, removeFavorite } = useContext(UserContextAPI);

  // ✅ Generate consistent key without using index
  const getSongKey = (song) => {
    return song.id ?? `${song.songName}-${song.songSingers}`;
  };

  const allSongs = useMemo(() => {
    if (!allAlbums) return [];
    let songs = [];
    allAlbums.forEach(album => {
      if (album.AllSongs && album.albumReleaseDate) {
        album.AllSongs.forEach(song => {
          songs.push({ ...song, albumReleaseDate: album.albumReleaseDate });
        });
      }
    });
    return songs;
  }, [allAlbums]);

  const trendingSongs = useMemo(() => {
    return allSongs
      .sort((a, b) => new Date(b.albumReleaseDate) - new Date(a.albumReleaseDate))
      .slice(0, 10);
  }, [allSongs]);

  const formatDuration = (durationInSeconds) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSongClick = (index) => {
    setSongs(trendingSongs);
    setCurrentSongIndex(index);
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="w-full p-4">
      <h2 className="text-2xl font-semibold mb-4">Trending Songs</h2>
      {trendingSongs.length === 0 ? (
        <p>No trending songs available.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="px-2 py-1">#</th>
              <th className="px-2 py-1">Thumbnail</th>
              <th className="px-2 py-1">Song Name</th>
              <th className="px-2 py-1">Singers</th>
              <th className="px-2 py-1">Music Director</th>
              <th className="px-2 py-1">Mood</th>
              <th className="px-2 py-1">Duration</th>
              <th className="px-2 py-1">Favorite</th>
            </tr>
          </thead>
          <tbody>
            {trendingSongs.map((song, index) => {
              const songKey = getSongKey(song);
              const songIdWithPrefix = `song_${songKey}`;
              const isFavorite = userDataFromDB?.favorites?.includes(songIdWithPrefix);

              return (
                <tr
                  key={songKey}
                  className="cursor-pointer hover:bg-gray-600"
                  onClick={() => handleSongClick(index)}
                >
                  <td className="px-2 py-1">{index + 1}</td>
                  <td className="px-2 py-1">
                    <img
                      src={song.songThumbnail}
                      alt={song.songName}
                      className="h-12 w-12 rounded-sm"
                    />
                  </td>
                  <td className="px-2 py-1">{song.songName}</td>
                  <td className="px-2 py-1">{song.songSingers}</td>
                  <td className="px-2 py-1">{song.songMusicDirector}</td>
                  <td className="px-2 py-1">{song.songMood}</td>
                  <td className="px-2 py-1">{formatDuration(song.songDuration)}</td>
                  <td className="px-2 py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFavorite) {
                          removeFavorite(songIdWithPrefix);
                        } else {
                          addFavorite(songIdWithPrefix);
                        }
                      }}
                      className="text-white text-xl"
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite ? '❤️' : '🤍'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default TrendingSongs;
