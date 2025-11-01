// src/components/ChangePassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../globals/supabase';

const ChangePassword = () => {
  const nav = useNavigate();
  const uid = sessionStorage.getItem('uid');
  if (!uid) return null; // guard

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confPwd, setConfPwd] = useState('');

  const handleChange = async () => {
    if (newPwd !== confPwd) return alert('New passwords do not match');

    /* 1. re-authenticate with old password (optional but safer) */
    const { error: reAuthErr } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user.email,
      password: oldPwd,
    });
    if (reAuthErr) {
      alert('Old password is incorrect');
      return;
    }

    /* 2. actually change to new password */
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) {
      alert('Update failed: ' + error.message);
      return;
    }

    alert('Password changed successfully');
    setOldPwd('');
    setNewPwd('');
    setConfPwd('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Change Password</h3>
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Old Password</td>
            <td>
              <input
                type="password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td>New Password</td>
            <td>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td>Confirm Password</td>
            <td>
              <input
                type="password"
                value={confPwd}
                onChange={(e) => setConfPwd(e.target.value)}
              />
            </td>
          </tr>
          <tr>
            <td colSpan="2" align="center">
              <button onClick={handleChange}>Change</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ChangePassword;