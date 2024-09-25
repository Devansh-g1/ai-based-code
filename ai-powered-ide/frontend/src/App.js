import logo from './logo.svg';
import './App.css';
import React from 'react';
import CodeEditor from './components/CodeEditor';
function App() {
  return (
    <div className="App">
       <h1>AI-Powered IDE</h1>
       <CodeEditor />
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
