// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../globals/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login failed');
      return;
    }

    // data.user is the auth user; we still need the profile row
    // to grab full_name (or any custom column you stored).
    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', data.user.id)
      .single();

    const name = profile?.full_name || data.user.email;

    sessionStorage.setItem('uid', data.user.id);
    sessionStorage.setItem('userName', name);
    alert('Login successful');
    navigate('/user/home');
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Login</h3>
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Email</td>
            <td>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td>Password</td>
            <td>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td colSpan="2" align="center">
              <button onClick={handleLogin}>Login</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Login;