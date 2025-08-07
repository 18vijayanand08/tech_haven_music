import { deleteUser } from 'firebase/auth';
import React, { useState }  from 'react'
import { __AUTH } from '../Backend/firebase';


const DeleteAccount = () => {

  let [inputText, setInputText] =useState("")

  let handleInputChange=(e)=>{
    let inputText=e.target.value;
    setInputText(inputText);
  }
  let handleSubmit =(e)=>{
    e.preventDefault();
    console.log(inputText)
    deleteUser(__AUTH)
  }

  return (
    <section className=' h-full w-full flex justify-center items-center'>
      <article className='h-[260px] w-[50%] bg-slate-700 rounded-md p-6 flex flex-col gap-6'>
        <header className='text-[32px]'>
          <h1>
            Deleting Account
          </h1>
        </header>
        <main>
          <p className='w-[80%]'>
          Deleting Account will remove all the information database and <b>it cant be reversed</b>
          </p>
        </main>
        <form action="" onSubmit={handleSubmit} className="flex justify-between items-end">
          <div className='flex flex-col w-[255px] gap-2'>
            <label htmlFor="">To delete this account type <b>DELETE</b></label>
            <input type="text" onChange={handleInputChange} className='  outline-none border py-1 px-2 rounded-md text-red-600' />
          </div>
          <div>
            <button disabled={inputText!="DELETE"} className={`px-16 py-2 rounded-md ${inputText !='DELETE'?"bg-slate-500 cursor-not-allowed":"bg-red-500 cursor-pointer"}`}>Delete Account</button>
          </div>
        </form>
        
        
      </article>
    </section>
  )
}

export default DeleteAccount