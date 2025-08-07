import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../Pages/Layout";
import Home from "../Pages/Home";
import Login from "../Components/Auth/Login";
import Register from "../Components/Auth/Register";
import ResetPassword from "../Components/Auth/ResetPassword";
import UserMainContainer from "../userComponents/UserMainContainer";
import MyAccount from "../userComponents/MyAccount";
import UpdateProfile from "../userComponents/UpdateProfile";
import AddProfile from "../userComponents/AddProfile";
import UpdatePassword from "../userComponents/UpdatePassword";
import DeleteAccount from "../userComponents/DeleteAccount";
import PageNotFound from "../Pages/PageNotFound";
import AdminMainContainer from "../AdminComponents/AdminMainContainer";
import AdminDashboard from "../AdminComponents/AdminDashboard";
import CreateAlbum from "../AdminComponents/CreateAlbum";
import AllAlbums from "../AdminComponents/AllAlbums";
import PublicRoutes from "./PublicRoutes";
import PrivateRoutes from "./PrivateRoutes";
import AdminRoutes from "./AdminRoutes";
import AlbumDetails from "../Components/AlbumComponents/AlbumDetails";
import EditAlbums from "../AdminComponents/EditAlbums";
import Analytics from "../AdminComponents/Analytics";
import Favorites from "../Pages/Favorites";
import FavoritesLayout from "../Pages/FavoritesLayout";
import MusicContainers from "../AdminComponents/MusicContainers";
import SongContainers from "../AdminComponents/SongContainers";
import CreatePlaylist from "../Pages/CreatePlaylist";
import Playlists from "../Pages/Playlists";
import YourPlaylists from "../Pages/YourPlaylists";
import PlaylistDetails from "../Pages/PlaylistDetails";
import DownloadSongs from "../Pages/DownloadSongs";

let Myroutes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "album-details",
        element: <AlbumDetails />,
      },
      {
      path: "create-playlist", 
      element: (
        <PrivateRoutes>
          <CreatePlaylist />
        </PrivateRoutes>
      ),
      },
      {
        path: "playlists",
        element: <Playlists />,
      },
      {
        path: "your-playlists",
        element: (
          <PrivateRoutes>
            <YourPlaylists />
          </PrivateRoutes>
        ),
      },
      {
        path: "playlist/:id",
        element: <PlaylistDetails />,
      },
      {
        path: "login",
        element: (
          <PublicRoutes>
            <Login />
          </PublicRoutes>
        ),
      },
      {
        path: "register",
        element: (
          <PublicRoutes>
            <Register />
          </PublicRoutes>
        ),
      },
      {
        path: "reset-password",
        element: (
          <PublicRoutes>
            <ResetPassword />
          </PublicRoutes>
        ),
      },
      {
        path: "download-songs",
        element: <DownloadSongs />,
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
  {
    path: "user-profile",
    element: (
      <PrivateRoutes>
        <UserMainContainer />
      </PrivateRoutes>
    ),
    children: [
      {
        index: true,
        element: <MyAccount />,
      },
      {
        path: "update-profile",
        element: <UpdateProfile />,
      },
      {
        path: "add-profile",
        element: <AddProfile />,
      },
      {
        path: "update-password",
        element: <UpdatePassword />,
      },
      {
        path: "delete-account",
        element: <DeleteAccount />,
      },
      
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
  {
    path: "favorites",
    element: (
      <PrivateRoutes>
        <FavoritesLayout />
      </PrivateRoutes>
    ),
    children: [
      {
        index: true,
        element: <Favorites />,
      },
    ],
  },
      
      {
        path: "create-playlist",
        element: <CreatePlaylist />,
      },
  {
    path: "admin",
    element: (
      <AdminRoutes>
        <AdminMainContainer />
      </AdminRoutes>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "create-album",
        element: <CreateAlbum />,
      },
      {
        path: "all-albums",
        element: <AllAlbums />,
      },
      {
        path: "edit-album/:id",
        element: <EditAlbums />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "music-containers",
        element: <MusicContainers/>
      },
      {
        path: "song-containers",
        element: <SongContainers/>
      },
    ],
  },
]);

export default Myroutes;
