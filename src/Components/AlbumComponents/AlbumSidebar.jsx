import React from 'react'
import { NavLink } from 'react-router-dom'
import { LuDiscAlbum } from "react-icons/lu";
import { LuAlbum } from "react-icons/lu";
import { FaDownload, FaUserPlus } from "react-icons/fa";
import { TbLayoutDashboardFilled } from "react-icons/tb";




const AlbumSidebar = () => {
  return (
    <section className=' p-7'>
        <article>
            <ul className=' flex flex-col gap-4'>
                <li><NavLink end to={'/'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><TbLayoutDashboardFilled /></span><span>Dashboard</span></NavLink></li>
                <li><NavLink end to={'/favorites'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><LuDiscAlbum /></span><span>Favourites</span></NavLink></li>
                <li><NavLink end to={'/create-playlist'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}> 
                    <span><FaUserPlus /></span><span>Create Playlist</span></NavLink></li>
                <li><NavLink end to={'/playlists'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}> 
                    <span><LuAlbum /></span><span>Playlists</span></NavLink></li>
            <li><NavLink end to={'/your-playlists'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}> 
                <span><LuAlbum /></span><span>Your Playlists</span></NavLink></li>
            <li><NavLink end to={'/download-songs'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                <span><FaDownload /></span><span>Download Songs</span></NavLink></li>
            </ul>
        </article>
    </section>
  )
}

export default AlbumSidebar