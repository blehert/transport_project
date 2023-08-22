//  Импорты библиотек
import { Routes, Route } from 'react-router-dom';

//  Импорт компонентов
import MapPage from './pages/MapPage';
import TsTablePage from './pages/TsTablePage';
import ThTablePage from './pages/ThTablePage';

//  Импорты стилей
import './scss/app.scss';
import MainLayout from './components/Layout';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route path="/" element={<MapPage />} />
          <Route path="/table_ts" element={<TsTablePage />} />
          <Route path="/table_th" element={<ThTablePage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
