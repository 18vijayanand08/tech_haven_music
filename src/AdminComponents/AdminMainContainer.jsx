import React from 'react';
import NavbarContainer from '../Components/NavbarComponents/NavbarContainer';
import AdminSideBar from './AdminSideBar';
import { Outlet } from 'react-router-dom';

function AdminMainContainer() {
  return (
    <section className="h-screen w-full bg-slate-900 flex flex-col">
      {/* Fixed Navbar */}
      <header className="h-[71px] sticky top-0 z-50 shadow-2xl bg-slate-900">
        <NavbarContainer />
      </header>

      {/* Main Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Sidebar (non-scrollable) */}
        <aside className="w-[16%] bg-slate-700 h-full overflow-hidden">
          <AdminSideBar />
        </aside>

        {/* Scrollable Content Area */}
        <main className="w-[84%] h-full overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </section>
  );
}

export default AdminMainContainer;
