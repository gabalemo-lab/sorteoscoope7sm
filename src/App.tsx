import React from 'react';
import { useRaffleStore } from './store/raffleStore';
import HomePage from './components/HomePage';
import AdminPanel from './components/AdminPanel';
import SalesRegistry from './components/SalesRegistry';

const App: React.FC = () => {
  const { currentPage } = useRaffleStore();

  return (
    <>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'admin' && <AdminPanel />}
      {currentPage === 'registry' && <SalesRegistry />}
    </>
  );
};

export default App;
