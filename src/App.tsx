import React from 'react';
import './App.css';
import FormularioAluno from './components/FormularioAluno';
import 'bootstrap/dist/css/bootstrap.min.css';


const App: React.FC = () => {
  return (
    <div className="App">
      <FormularioAluno />
    </div>
  );
};

export default App;
