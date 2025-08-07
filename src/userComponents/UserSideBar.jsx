import React from 'react'
import { NavLink } from 'react-router-dom'
import { MdAccountBalanceWallet } from 'react-icons/md'
import { CgProfile } from "react-icons/cg";
import { FaUserPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { MdLockPerson } from "react-icons/md";



const UserSideBar = () => {
  return (
    <section className=' p-7'>
        <article>
            <ul className=' flex flex-col gap-4'>
                <li><NavLink end to={'/user-profile'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><MdAccountBalanceWallet/></span><span>My Account</span></NavLink></li>
                <li><NavLink end to={'update-profile'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><CgProfile/></span><span>Update Profile</span></NavLink></li>
                <li><NavLink end to={'add-profile'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><FaUserPlus/></span><span>Add Profile</span></NavLink></li>
                <li><NavLink end to={'update-password'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><MdLockPerson /></span><span>Update Password</span></NavLink></li>
                <li><NavLink end to={'delete-account'} className={({isActive})=>`${isActive && "bg-blue-600"} flex items-center gap-2 px-2 py-1 rounded-md`}>
                    <span><MdDeleteForever /></span><span>Delete Account</span></NavLink></li>
            </ul>
        </article>
    </section>
  )
}

export default UserSideBar