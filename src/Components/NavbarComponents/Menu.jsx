import React, { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth';
import { __AUTH } from '../../Backend/firebase';
import toast from 'react-hot-toast';
import { AuthContextAPI } from '../../context/AuthContext';
import { UserContextAPI } from '../../context/UserContext';

const Menu = () => {

  let {authUser, setAuthUser}=useContext(AuthContextAPI)
  let {userDataFromDB} = useContext(UserContextAPI)

  let navigate= useNavigate()


  let handleLogout =async()=>{
    try {
      await signOut(__AUTH)
      setAuthUser(null)
      window.localStorage.clear()
      toast.success("Logout Successfully")
      navigate("/")
    } catch (error) {
      toast.error(error.message)
      
    }
    console.log("logout function");
    
  }
  
  
  return <aside>
    <ul className='flex gap-3 '>

        <li><NavLink to={'/'} className={({isActive})=>`${isActive && "bg-blue-600"} px-4 py-2 rounded-md`}>Home</NavLink></li>

      {authUser==null?<>
        <li><NavLink to={'register'} className={({isActive})=>`${isActive && "bg-blue-600"} px-4 py-2 rounded-md`}>Register</NavLink></li>
        <li><NavLink to={'login'} className={({isActive})=>`${isActive && "bg-blue-600"} px-4 py-2 rounded-md`}>Login</NavLink></li>
      </>:<>
        {userDataFromDB?.role === "admin" && (
          <li><NavLink to={'/admin'} className={({isActive})=>`${isActive && "bg-blue-600"} px-4 py-2 rounded-md`}>Admin</NavLink></li>
        )}
        <li><NavLink onClick={handleLogout} className={'px-4 py-2'}>Logout</NavLink></li>
        <li><NavLink to={'/user-profile'}><picture><img src={authUser?.photoURL} alt=''className='h-[35px] w-[35px] rounded-full'/></picture></NavLink></li>
      </>}
     </ul>

  </aside>
}

export default Menu
