import React, { useContext } from 'react';
import { AuthContextAPI } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { UserContextAPI } from '../context/UserContext';
import { FaUserEdit, FaEdit } from 'react-icons/fa';

const MyAccount = () => {
  const { authUser } = useContext(AuthContextAPI);
  const { userDataFromDB } = useContext(UserContextAPI);

  return (
    <section className='h-full w-full flex justify-center items-center'>
      <article className='h-[420px] w-[50%] bg-slate-800 rounded-md'>
        <header className='h-[120px] w-[95%] m-auto mt-3 bg-slate-700 rounded-md relative'>

          {/* Profile Picture - Centered */}
          <picture className='absolute top-[-55px] left-1/2 transform -translate-x-1/2'>
            <img src={authUser?.photoURL} className='h-[100px] w-[100px] rounded-full border' />
          </picture>

          {/* Edit Icon - Top Right */}
          <NavLink to='/user-profile/update-profile'>
            <span className='absolute right-4 top-4 text-[20px]'>
              <FaEdit />
            </span>
          </NavLink>

          {/* User Info - Moved Down to Make Space for Avatar */}
          <div className='pt-[50px] flex flex-col gap-1 items-center'>
            <span>{authUser?.displayName}</span>
            <span>{authUser?.email}</span>
          </div>
        </header>

        <main>
          {userDataFromDB == null ? (
            <div className='h-full w-full flex flex-col items-center gap-2 mt-4'>
              <picture>
                <img src='https://i.ibb.co/0j5wgtMv/person.png' className='h-[200px]' />
              </picture>
              <p>
                <NavLink to='/user-profile/add-profile'>
                  <button className='bg-blue-600 py-2 px-10 rounded-md hover:bg-blue-800 cursor-pointer'>
                    Add Profile
                  </button>
                </NavLink>
              </p>
            </div>
          ) : (
            <section className='h-[290px] w-full py-2 px-4'>
              <header className='flex items-center justify-between'>
                <h1 className='text-[24px] font-semibold'>Personal Details</h1>
                <NavLink end to='add-profile' state={userDataFromDB}>
                  <span className='text-[24px]'>
                    <FaUserEdit />
                  </span>
                </NavLink>
              </header>

              <article className='flex gap-x-6 gap-y-4 mt-2 flex-wrap'>
                <div className='flex flex-col bg-slate-700 py-1 px-2 rounded-md w-[48%]'>
                  <span className='text-[18px] font-semibold'>DOB</span>
                  <span>{userDataFromDB?.dob}</span>
                </div>
                <div className='flex flex-col bg-slate-700 py-1 px-2 rounded-md w-[48%]'>
                  <span className='text-[18px] font-semibold'>CONTACT</span>
                  <span>{userDataFromDB?.contact}</span>
                </div>
                <div className='flex flex-col bg-slate-700 py-1 px-2 rounded-md w-[48%]'>
                  <span className='text-[18px] font-semibold'>GENDER</span>
                  <span>{userDataFromDB?.gender}</span>
                </div>
                <div className='flex flex-col bg-slate-700 py-1 px-2 rounded-md w-[48%]'>
                  <span className='text-[18px] font-semibold'>LANGUAGE</span>
                  <span>{userDataFromDB?.languages}</span>
                </div>
                <div className='flex flex-col bg-slate-700 py-1 px-2 rounded-md w-full'>
                  <span className='text-[18px] font-semibold'>ADDRESS</span>
                  <span>{userDataFromDB?.address}</span>
                </div>
              </article>
            </section>
          )}
        </main>
      </article>
    </section>
  );
};

export default MyAccount;
