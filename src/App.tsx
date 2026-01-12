import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import PublicMessage from './pages/PublicMessage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/m/:id" element={<PublicMessage />} />
    </Routes>
  );
}

export default App;
