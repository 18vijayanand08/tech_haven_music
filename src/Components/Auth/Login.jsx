import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useContext, useState } from 'react'
import { IoEye, IoEyeOff } from 'react-icons/io5'
import { NavLink, useNavigate } from 'react-router-dom'
import { __AUTH } from '../../backend/firebase';
import toast from 'react-hot-toast';
import Spinner from '../../utilities/Spinner';
import { AuthContextAPI } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { __DB } from '../../backend/firebase';

const Login = () => {

  let {setAuthUser} = useContext(AuthContextAPI)

  let [passwordEye, setPasswordEye] = useState(false);
  let [isLoading, setisLoading] = useState(false);
  let navigate= useNavigate()


  let initialUserData ={
    email:"",
    password:"",
  }
  let [userData, setUserData] = useState(initialUserData);

  let {email,password}=userData

  let handleInputchange=(e)=>{
    let {name , value}=e.target;
    setUserData({
      ...userData ,[name]:value
    })
  }

  let handlesumbit=async(e)=>{
    e.preventDefault();

    try {
      setisLoading(true);

      let loginData = await signInWithEmailAndPassword(__AUTH,email,password);
      
      if(loginData?.user?.emailVerified){
        toast.success("Logged in successfully")
        setAuthUser(loginData?.user)

        // Fetch user profile to get role
        const userDocRef = doc(__DB, 'user_profile', loginData.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if(userDocSnap.exists()){
          const userDataFromDB = userDocSnap.data();
          if(userDataFromDB.role === 'admin'){
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          // If no user profile found, navigate to home page by default
          navigate('/');
        }

      }
      else{
        toast.error("verify Your Email‼")
      }
      
      
    } catch (error) {
      toast.error(error.message)
      
    }
    finally{
      setisLoading(false);
    }

  }


  return <section className='h-[calc(100vh-70px)] w-[100%] flex justify-center items-center'>
    <article className='w-[27%] bg-slate-700 py-4 px-6 rounded-md'>
      <header><h1 className='text-center text-[24px] font-semibold'>Log In</h1></header>
      <main>
        <form action="" onSubmit={handlesumbit} className=' flex flex-col gap-2'>
          <div>
            <label htmlFor="email" className=' block py-1 '>Email</label>
            <input type="email" name='email' value={email} placeholder='Enter Your Email' onChange={handleInputchange} className='outline-none border-1 w-full rounded-md py-1 px-2' required/>
          </div>
          <div className=' relative'>
            <label htmlFor="password" className=' block py-1 '>Password</label>
            <input type={passwordEye?"text":"password"} name='password' value={password} placeholder='Enter Your Password' onChange={handleInputchange} className='outline-none border-1 w-full rounded-md py-1 px-2' required/>
            <span onClick={()=>setPasswordEye(!passwordEye)} className=' absolute right-[15px] top-[39px] text-[20px]'>{passwordEye?<IoEye/>:<IoEyeOff/>}</span>
          </div>
          <div className='mt-3'>
            <button className=' bg-blue-600 w-full py-2 rounded-md cursor-pointer hover:bg-blue-800'>Log in</button>
          </div>
          <div className='flex flex-col justify-center items-center'>
            <NavLink to={"/register"}>
            Don't Have an Account?
            </NavLink>
            <NavLink to={"/reset-password"}>
            Forget Password
            </NavLink>
          </div>
        </form>
      </main>
    </article>
    {isLoading && <Spinner/>}
  </section>
}

export default Login
