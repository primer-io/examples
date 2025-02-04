import './App.css';
import { clientToken } from './clientToken.ts';

function App() {
  return (
    <main>
      <div className='container'>
        <primer-checkout clientToken={clientToken}></primer-checkout>
      </div>
    </main>
  );
}

export default App;
