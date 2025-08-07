import React, { useContext, useState } from 'react'
import { Navigate, NavLink, useNavigate } from 'react-router-dom'
import { IoEye, IoEyeOff } from 'react-icons/io5'
import { signOut, updatePassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import Spinner from '../utilities/Spinner';
import { AuthContextAPI } from '../context/AuthContext';
import { __AUTH } from '../Backend/firebase';

const UpdatePassword= () => {
  

  let {authUser}=useContext(AuthContextAPI)

  let [isLoading, setisLoading] = useState(false);
  let [passwordEye, setPasswordEye] = useState(false);

  let navigate = useNavigate();

  let initialState={
    newPassword:"",
    confirmPassword:""
  }
  let [passwordData,setPasswordData]=useState(initialState)


  let handleInputchange=(e)=>{
    let {name,value}=e.target;
    setPasswordData({
      ...passwordData,[name]:value
    })
  }
  let{newPassword,confirmPassword}=passwordData

  let handleSumbit =async (e)=>{
    e.preventDefault()
    
    try {
        setisLoading(true);
        if(newPassword == confirmPassword){
          await updatePassword(authUser,newPassword)
          toast.success("Password changed successfully")
          signOut(__AUTH)
          navigate("/login")
        }else{
          toast.error("New password should match with confirm password")
        }
    } catch (error) {
        toast.error(error.message)
    }finally{
      setisLoading(false)
    }
    
  }


  return <section className='h-[calc(100vh-70px)] w-[100%] flex justify-center items-center'>
    <article className='w-[27%] bg-slate-700 py-4 px-6 rounded-md'>
      <header><h1 className='text-center text-[24px] font-semibold'>Update Password</h1></header>
      <main>
        <form action="" onSubmit={handleSumbit} className=' flex flex-col gap-2'>
          <div className=' relative'>
            <label htmlFor="newPassword" className=' block py-1 '>New Password</label>
            <input type={passwordEye?"text":"password"} name='newPassword' value={newPassword} placeholder='Enter Your Email' onChange={handleInputchange} className='outline-none border-1 w-full rounded-md py-1 px-2' required/>
            <span onClick={()=>setPasswordEye(!passwordEye)} className=' absolute right-[15px] top-[39px] text-[20px]'>{passwordEye?<IoEye/>:<IoEyeOff/>}</span>
          </div>
          <div className=' relative'>
            <label htmlFor="confirmNewPassword" className=' block py-1 '>Confirm Password</label>
            <input type={passwordEye?"text":"password"} name='confirmPassword' value={confirmPassword} placeholder='Enter Your Email' onChange={handleInputchange} className='outline-none border-1 w-full rounded-md py-1 px-2' required/>
            <span onClick={()=>setPasswordEye(!passwordEye)} className=' absolute right-[15px] top-[39px] text-[20px]'>{passwordEye?<IoEye/>:<IoEyeOff/>}</span>
          </div>
          <div className='mt-3'>
            <button className=' bg-blue-600 w-full py-2 rounded-md cursor-pointer hover:bg-blue-800'>Submit</button>
            
          </div>
          
        </form>
      </main>
    </article>
    {isLoading && <Spinner/>}
  </section>
}
export default UpdatePassword