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
          <Route path="/donor-dashboard" element={<DonorDashboard />} />
          <Route path="/needs/:id" element={<NeedDetail />} />
          <Route path="/donate/:id" element={<DonateTunnel />} />
          <Route path="/impact/:donationId" element={<ImpactProof />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
