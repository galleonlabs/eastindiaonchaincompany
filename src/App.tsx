import logo from './assets/logo.png';
import './App.css';

function App() {


  return (
    <div className='mx-auto max-w-4xl min-h-full text-theme-pan-navy rounded-sm mt-72 justify-center mb-32'>
      <div className='border border-theme-pan-navy rounded-xl py-8 m-auto text-center w-1/2'>
      <div className='justify-center flex'>
        <img src={logo} className="h-32 w-32" alt="logo" />
      </div>
      <div className='text-center pt-4'>
        <h1 className='text-2xl font-bold'>East India Onchain Company</h1>
        <p className='text-lg'>
          A Crypto Guild
        </p>
        </div>
      </div>
    </div>
  );
}

export default App;
