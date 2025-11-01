// src/components/EditProfile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../globals/supabase';

const EditProfile = () => {
  const nav = useNavigate();
  const uid = sessionStorage.getItem('uid');
  if (!uid) return null;

  /* ---------- state ---------- */
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [districts, setDistricts] = useState([]);
  const [places, setPlaces]       = useState([]);
  const [districtId, setDistrictId] = useState('');
  const [placeId, setPlaceId]       = useState('');

  /* 1. districts */
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('districts')
        .select('*')
        .order('district_name', { ascending: true });
      setDistricts(data || []);
    })();
  }, []);

  /* 2. current profile + pre-fill */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`full_name, email, place_id, places!inner(district_id)`)
        .eq('id', uid)
        .single();
      if (error) { console.error(error); return; }

      setFullName(data.full_name);
      setEmail(data.email);
      setPlaceId(data.place_id);
      setDistrictId(data.places.district_id);
    })();
  }, [uid]);

  /* 3. places when district changes */
  useEffect(() => {
    if (!districtId) return;
    (async () => {
      const { data } = await supabase
        .from('places')
        .select('*')
        .eq('district_id', districtId)
        .order('place_name', { ascending: true });
      setPlaces(data || []);
    })();
  }, [districtId]);

  /* 4. save */
  const handleSave = async () => {
    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName, email, place_id: placeId })
      .eq('id', uid);

    if (error) { alert('Update failed'); return; }
    alert('Profile updated');
  };

  /* 5. render */
  return (
    <div style={{ padding: 20 }}>
      <h3>Edit Profile</h3>
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Name</td>
            <td><input value={fullName} onChange={e => setFullName(e.target.value)} /></td>
          </tr>
          <tr>
            <td>Email</td>
            <td><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></td>
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
              <select value={placeId} onChange={e => setPlaceId(e.target.value)}>
                <option value="">-- select --</option>
                {places.map(p => (
                  <option key={p.id} value={p.id}>{p.place_name}</option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <td colSpan="2" align="center">
              <button onClick={handleSave}>Save</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EditProfile;