import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <Outlet />
    </div>
  );
}
