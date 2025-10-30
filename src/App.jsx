import './App.css';
import { Routes, Route } from 'react-router-dom';
import ScanForm from './components/ScanForm';

function App() {
  return (
    <div className='App'>
      <Routes>
        {/* Route principale pour le scan */}
        <Route path="/" element={<ScanForm />} />
      </Routes>
    </div>
  );
}

export default App;
