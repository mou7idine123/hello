import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import NeedsCatalog from './components/NeedsCatalog';
import Dashboard from './components/Dashboard';
import BlockchainVerify from './components/BlockchainVerify';
import Footer from './components/Footer';
import Auth from './pages/Auth';
import DonorDashboard from './pages/DonorDashboard';
import NeedDetail from './pages/NeedDetail';
import DonateTunnel from './pages/DonateTunnel';
import ImpactProof from './pages/ImpactProof';
import ConfirmDelivery from './pages/ConfirmDelivery';
import PartnerDashboard from './pages/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminNeeds from './pages/AdminNeeds';
import AdminSettings from './pages/AdminSettings';
import ValidatorDashboard from './pages/ValidatorDashboard';
import CreateNeed from './pages/CreateNeed';
import HederaVerify from './pages/HederaVerify';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function Home() {
  return (
    <>
      <Hero />
      <NeedsCatalog />
      <Dashboard />
      <BlockchainVerify />
    </>
  );
}

function App() {
  return (
    <div className="app-container" style={{ paddingTop: "70px" }}>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/needs" element={<NeedsCatalog />} />
          <Route path="/needs/:id" element={<NeedDetail />} />
          <Route path="/hedera-verify" element={<HederaVerify />} />

          {/* Protected Routes: Donor */}
          <Route path="/donor-dashboard" element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>} />
          <Route path="/donate/:id" element={<ProtectedRoute allowedRoles={['donor']}><DonateTunnel /></ProtectedRoute>} />
          <Route path="/impact/:donationId" element={<ProtectedRoute allowedRoles={['donor']}><ImpactProof /></ProtectedRoute>} />

          {/* Protected Routes: Validator */}
          <Route path="/validator-dashboard" element={<ProtectedRoute allowedRoles={['validator']}><ValidatorDashboard /></ProtectedRoute>} />
          <Route path="/validator/create-need" element={<ProtectedRoute allowedRoles={['validator']}><CreateNeed /></ProtectedRoute>} />
          <Route path="/confirm-delivery/:id" element={<ProtectedRoute allowedRoles={['validator']}><ConfirmDelivery /></ProtectedRoute>} />

          {/* Protected Routes: Partner */}
          <Route path="/partner/dashboard" element={<ProtectedRoute allowedRoles={['partner']}><PartnerDashboard /></ProtectedRoute>} />

          {/* Protected Routes: Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/needs" element={<ProtectedRoute allowedRoles={['admin']}><AdminNeeds /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
