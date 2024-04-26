import { Route, Routes } from 'react-router-dom';
import { AppSidebar } from './components/AppSidebar/AppSidebar.tsx';
import { Loading } from './components/Loading/Loading.tsx';
import { useCurrencyInformation } from './hooks/useCurrencyConfig.ts';
import { DropIn } from './pages/DropIn/DropIn.tsx';
import { Homepage } from './pages/Homepage/Homepage.tsx';

export function App() {
  const { isLoading } = useCurrencyInformation();
  return (
    <AppSidebar>
      {isLoading ? (
        <Loading page />
      ) : (
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/drop-in' element={<DropIn />} />
        </Routes>
      )}
    </AppSidebar>
  );
}
