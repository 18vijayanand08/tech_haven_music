import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { __AUTH } from '../../Backend/firebase';
import Spinner from '../../utilities/Spinner';
import { sendPasswordResetEmail } from 'firebase/auth';
import toast from 'react-hot-toast';

const ResetPassword= () => {

  let [isLoading, setisLoading] = useState(false);

  let navigate= useNavigate();

  let [email,setEmail]=useState('');

  let handleInputchange=(e)=>{
    setEmail(e.target.value)
  }

  let handleSumbit =async (e)=>{
    e.preventDefault()
    
    try {

        setisLoading(true);

        await sendPasswordResetEmail(__AUTH,email)

        toast.success(`Reset link has been sent to ${email}`)

        setisLoading(false)

        setEmail("")

        navigate("/login")

    } catch (error) {
        toast.error(error.message)
        
    }
    
  }


  return <section className='h-[calc(100vh-70px)] w-[100%] flex justify-center items-center'>
    <article className='w-[27%] bg-slate-700 py-4 px-6 rounded-md'>
      <header><h1 className='text-center text-[24px] font-semibold'>Reset Password</h1></header>
      <main>
        <form action="" onSubmit={handleSumbit} className=' flex flex-col gap-2'>
          <div>
            <label htmlFor="email" className=' block py-1 '>Email</label>
            <input type="email" name='email' value={email} placeholder='Enter Your Email' onChange={handleInputchange} className='outline-none border-1 w-full rounded-md py-1 px-2' required/>
          </div>
          <div className='mt-3'>
            <button className=' bg-blue-600 w-full py-2 rounded-md cursor-pointer hover:bg-blue-800'>Reset Password</button>
          </div>
          <div className='mt-1'>
            <NavLink to={"/login"}><button className=' bg-red-600 w-full py-2 rounded-md cursor-pointer hover:bg-red-800'>Cancel</button></NavLink>
          </div>
          
        </form>
      </main>
    </article>
    {isLoading && <Spinner/>}
  </section>
}

export default ResetPassword