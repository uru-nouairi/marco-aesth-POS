import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="min-h-screen w-full bg-marco-luxe">
      <Outlet />
    </div>
  );
};

export default MainLayout;
