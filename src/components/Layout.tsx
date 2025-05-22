
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Navbar />
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
