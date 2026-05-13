import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminItemForm from './pages/AdminItemForm';
import ItemDetail from './pages/ItemDetail';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/items/new" element={<AdminItemForm />} />
        <Route path="/admin/items/:id/edit" element={<AdminItemForm />} />
      </Routes>
    </div>
  );
}
