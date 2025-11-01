// src/components/Registration.jsx
import React, { useEffect, useState } from 'react';
import supabase from '../../../globals/supabase';

const Registration = () => {
  /* ---------- state ---------- */
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [places, setPlaces]       = useState([]);
  const [districtId, setDistrictId] = useState('');
  const [placeId, setPlaceId]       = useState('');

  /* ---------- load districts ---------- */
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('districts')
        .select('*')
        .order('district_name', { ascending: true });
      setDistricts(data || []);
    })();
  }, []);

  /* ---------- load places when district changes ---------- */
  useEffect(() => {
    if (!districtId) { setPlaces([]); setPlaceId(''); return; }

    (async () => {
      const { data } = await supabase
        .from('places')
        .select('*')
        .eq('district_id', districtId)
        .order('place_name', { ascending: true });
      setPlaces(data || []);
    })();
  }, [districtId]);

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    if (!fullName || !email || !password || !placeId) {
      alert('Please fill all fields');
      return;
    }

    let publicURL = null;

    /* 1. upload photo (if any) */
    if (photoFile) {
      const fileName = `${Date.now()}_${photoFile.name}`;
      const { data, error: upError } = await supabase.storage
        .from('userFiles')               // <- your storage bucket
        .upload(fileName, photoFile, { upsert: false });

      if (upError) { alert(upError.message); return; }

      // get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('userFiles')
        .getPublicUrl(data.path);
      publicURL = publicUrl;
    }

    /* 2. insert user row */
    const { error } = await supabase.from('users').insert([{
      full_name: fullName,
      email,
      password,            // ⚠️ you should hash this in a real app
      place_id: placeId,
      photo_url: publicURL
    }]);

    if (error) { alert(error.message); return; }

    alert('User registered');
    /* optional: reset form */
    setFullName(''); setEmail(''); setPassword(''); setPhotoFile(null);
    setDistrictId(''); setPlaceId(''); setPlaces([]);
  };

  /* ---------- render ---------- */
  return (
    <div style={{ padding: 20 }}>
      <h3>Registration</h3>
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Full Name</td>
            <td><input value={fullName} onChange={e => setFullName(e.target.value)} /></td>
          </tr>
          <tr>
            <td>Email</td>
            <td><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></td>
          </tr>
          <tr>
            <td>Password</td>
            <td><input type="password" value={password} onChange={e => setPassword(e.target.value)} /></td>
          </tr>
          <tr>
            <td>Photo</td>
            <td><input type="file" onChange={e => setPhotoFile(e.target.files[0] || null)} /></td>
          </tr>
          <tr>
            <td>District</td>
            <td>
              <select value={districtId} onChange={e => setDistrictId(e.target.value)}>
                <option value="">-- select --</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.district_name}</option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td>Place</td>
            <td>
              <select value={placeId} onChange={e => setPlaceId(e.target.value)} disabled={!districtId}>
                <option value="">-- select --</option>
                {places.map(p => (
                  <option key={p.id} value={p.id}>{p.place_name}</option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td colSpan="2" align="center">
              <button onClick={handleSubmit}>Register</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Registration;