import React, { useState } from 'react';
import Background from '../src/abschlusspenguin.png';
import './App.css';
import { jwtDecode } from 'jwt-decode';
import { View } from 'lucide-react';

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    upperAndLower: false,
    number: false,
    special: false,
    length: false
  });
  
  const handleRegister = async () => {
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.error) {
      setMessage('Error: ' + data.error);
    } else {
      setMessage('Success! ' + data.message);
      setEmail('');
      setPassword('');
      let previousEmails = JSON.parse(localStorage.getItem('usedEmails') || '[]');
      if (!previousEmails.includes(email)) {
        previousEmails.push(email);
      localStorage.setItem('usedEmails', JSON.stringify(previousEmails));
    }

    }
  };

React.useEffect(() => {
  const savedToken = localStorage.getItem('token');

  if (savedToken) {
    try {
      const decoded = jwtDecode(savedToken);

      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        localStorage.removeItem('token');
        setToken('');
        setMessage('Session expired. Please log in again.');
      } else {
        setToken(savedToken);
        setMessage('Welcome back! You are still logged in.');
      }
    } catch (e) {
      localStorage.removeItem('token');
      setToken('');
      setMessage('Invalid session. Please log in again.');
    }
  }
}, []);

  
  const handleLogin = async () => {
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.error) {
      setMessage('Error: ' + data.error);
    } else {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setMessage('Success! ' + data.message);
      setEmail('');
      setPassword('');
      let previousEmails = JSON.parse(localStorage.getItem('usedEmails') || '[]');
      if (!previousEmails.includes(email)) {
        previousEmails.push(email);
      localStorage.setItem('usedEmails', JSON.stringify(previousEmails));
    }}
  };
  const usedEmails = JSON.parse(localStorage.getItem('usedEmails') || '[]');

  return (
    <div className="logincontainer">
      <div className="loginbox">
      {/* Left side (image) */}
      <div style={{
        height: '100%',
        flex: 1,
        backgroundImage: `url(${Background})`,
        backgroundPosition: 'center',
        backgroundSize: 'contain',
          borderRadius: '10px',
          textAlign: 'right',
          textShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
          paddingRight: '20px'
      }}><h1 style={{marginBottom: '0px'}}>Abschlusspinguin</h1>Weil auch Pinguine Prüfungen bestehen.</div>
    
      {/* Right side (form) */}
      <div style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column', // Make sure items stack vertically
  alignItems: 'flex-start', // Align items to the top vertically
  justifyContent: 'flex-start', // Align container itself to the top
  height: '100%',
  top: 0,
  padding: '2rem'
}}>
        <div style={{
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      {!token && (
  <>
    <h1 style={{
      fontWeight: '100',
    }}>{showLogin ? 'Sign into your account' : 'Create an account'}</h1>
    <p style={{ marginTop: '1rem' }}>
      {showLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
      <a className="register-link" onClick={() => setShowLogin(!showLogin)}>
        {showLogin ? 'Create one' : 'Sign in'}
      </a>.
    </p>
    <form onSubmit={e => {
      e.preventDefault(); // stops the page from reloading
      if (showLogin) {
        handleLogin();
      } else {
        handleRegister();
      }
    }}>
      <input
  type="email"
  placeholder="Email"
  list="email-suggestions"
  value={email}
  onChange={e => setEmail(e.target.value)}
  className="input-style"
/>
<datalist id="email-suggestions">
  {usedEmails.map((email, index) => (
    <option key={index} value={email} />
  ))}
</datalist>

<div style={{ position: 'relative', marginBottom: '1rem' }}>
  <input
    type={showPassword ? 'text' : 'password'}
    placeholder="Password"
    value={password}
    onChange={e => {
      const newPassword = e.target.value;
      setPassword(newPassword);

      if (!showLogin) {
        setPasswordValidations({
          upperAndLower: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
          number: /\d/.test(newPassword),
          special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
          length: newPassword.length >= 8
        });
      }
    }}
    className="input-style"

  />

  <button
    type="button"
    onMouseDown={() => setShowPassword(true)}
    onMouseUp={() => setShowPassword(false)}
    onMouseLeave={() => setShowPassword(false)}
    className="show-password-button"
    title="Hold to show password"
  >
        <View />

  </button>
</div>


{!showLogin && (
  <>
    <div style={{ marginBottom: '1rem' }}>
      <strong>Password must contain:</strong>
      <ul style={{ fontSize: '0.9rem' }}>
        <li style={{ color: passwordValidations.upperAndLower ? 'green' : 'red' }}>
          Lowercase <strong>and</strong> Uppercase letter
        </li>
        <li style={{ color: passwordValidations.number ? 'green' : 'red' }}>
          A number (0–9)
        </li>
        <li style={{ color: passwordValidations.special ? 'green' : 'red' }}>
          A special character (!@#$%^&...)
        </li>
        <li style={{ color: passwordValidations.length ? 'green' : 'red' }}>
          At least 8 characters
        </li>
      </ul>
    </div>

    <div style={{ background: '#eee', height: '20px', borderRadius: '3px', overflow: 'hidden', marginBottom: '1rem' }}>
      <div style={{
        height: '100%',
        width: `${Object.values(passwordValidations).filter(Boolean).length * 25}%`,
        background: '#6d54b5',
        transition: 'width 0.3s'
      }}></div>
    </div>
  </>
)}

<button
className="submitbutton"
  type="submit"
  disabled={
    !showLogin && !Object.values(passwordValidations).every(Boolean)
  }
>
  {showLogin ? 'Log In' : 'Register'}
</button>

    </form>


  </>
)}


      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
      {token && (
  <div>
    <h3>Your JWT Token:</h3>
    <code style={{ wordBreak: 'break-all' }}>{token}</code>
    <br />
    <button onClick={() => {
      localStorage.removeItem('token');
      setToken('');
      setMessage('👋 You have been logged out.');
    }} className="submitbutton">
      Log Out
    </button>
  </div>
)}


    </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default App;
