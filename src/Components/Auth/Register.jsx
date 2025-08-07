import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import React, { useState } from 'react';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { NavLink, useNavigate } from 'react-router-dom';
import { __AUTH } from '../../Backend/firebase';
import toast from 'react-hot-toast';
import Spinner from '../../utilities/Spinner';

const Register = () => {
  const [passwordEye, setPasswordEye] = useState(false);
  const [confirmPasswordEye, setConfirmPasswordEye] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const initialUserData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  const [userData, setUserData] = useState(initialUserData);
  const { username, email, password, confirmPassword } = userData;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Password Mismatch');
      return;
    }

    setIsLoading(true);
    try {
      const registerData = await createUserWithEmailAndPassword(__AUTH, email, password);
      const user = registerData.user;

      // First update the display name
      await updateProfile(user, {
        displayName: username,
        photoURL: 'https://i.ibb.co/fdjdkDLz/user-White.png',
      });

      // Then send the verification email
      await sendEmailVerification(user);

      toast.success('User registered successfully');
      toast.success(`Email verification sent to ${email}`);

      setUserData(initialUserData);
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="h-[calc(100vh-70px)] w-full flex justify-center items-center">
      <article className="w-[27%] bg-slate-700 py-4 px-6 rounded-md">
        <header>
          <h1 className="text-center text-[24px] font-semibold">Register</h1>
        </header>
        <main>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div>
              <label htmlFor="username" className="block py-1">Name</label>
              <input
                type="text"
                name="username"
                value={username}
                placeholder="Enter Your Name"
                onChange={handleInputChange}
                className="outline-none border-1 w-full rounded-md py-1 px-2"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block py-1">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                placeholder="Enter Your Email"
                onChange={handleInputChange}
                className="outline-none border-1 w-full rounded-md py-1 px-2"
                required
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block py-1">Password</label>
              <input
                type={passwordEye ? 'text' : 'password'}
                name="password"
                value={password}
                placeholder="Enter Your Password"
                onChange={handleInputChange}
                className="outline-none border-1 w-full rounded-md py-1 px-2"
                required
              />
              <span onClick={() => setPasswordEye(!passwordEye)} className="absolute right-[15px] top-[39px] text-[20px] cursor-pointer">
                {passwordEye ? <IoEye /> : <IoEyeOff />}
              </span>
            </div>
            <div className="relative">
              <label htmlFor="confirmPassword" className="block py-1">Confirm Password</label>
              <input
                type={confirmPasswordEye ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                placeholder="Confirm Your Password"
                onChange={handleInputChange}
                className="outline-none border-1 w-full rounded-md py-1 px-2"
                required
              />
              <span onClick={() => setConfirmPasswordEye(!confirmPasswordEye)} className="absolute right-[15px] top-[39px] text-[20px] cursor-pointer">
                {confirmPasswordEye ? <IoEye /> : <IoEyeOff />}
              </span>
            </div>
            <div className="mt-3">
              <button className="bg-blue-600 w-full py-2 rounded-md cursor-pointer hover:bg-blue-800">
                Sign up
              </button>
            </div>
            <div className="flex justify-center items-center">
              <NavLink to="/login">
                Already Have an Account?
              </NavLink>
            </div>
          </form>
        </main>
      </article>
      {isLoading && <Spinner />}
    </section>
  );
};

export default Register;
