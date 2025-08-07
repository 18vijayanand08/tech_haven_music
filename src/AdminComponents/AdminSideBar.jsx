import React from 'react'
import { NavLink } from 'react-router-dom'
import { LuDiscAlbum } from "react-icons/lu";
import { LuAlbum } from "react-icons/lu";
import { FaUserPlus } from "react-icons/fa";
import { TbLayoutDashboardFilled } from "react-icons/tb";




const AdminSideBar = () => {
  return (
    <section className=' p-7'>
        <article>
            <ul className=' flex flex-col gap-4'>
                <li><NavLink end to={'/admin'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><TbLayoutDashboardFilled /></span><span>Dashboard</span></NavLink></li>
                <li><NavLink end to={'/admin/create-album'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><LuDiscAlbum /></span><span>Create Album</span></NavLink></li>
                <li><NavLink end to={'/admin/all-albums'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><LuAlbum /></span><span>All Albums</span></NavLink></li>
                <li><NavLink end to={'/admin/music-containers'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><FaUserPlus /></span><span>Music Containers</span></NavLink></li>
                <li><NavLink end to={'/admin/song-containers'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><FaUserPlus /></span><span>Song Containers</span></NavLink></li>
            </ul>
        </article>
    </section>
  )
}

export default AdminSideBar