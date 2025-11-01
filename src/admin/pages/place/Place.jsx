// src/components/Place.jsx
import React, { useEffect, useState } from 'react';
import supabase from '../../../globals/supabase';

const Place = () => {
  /* ---------- state ---------- */
  const [placeName, setPlaceName] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [districts, setDistricts] = useState([]);
  const [places, setPlaces] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDist, setEditDist] = useState('');

  /* ---------- initial load ---------- */
  useEffect(() => {
    loadDistricts();
    loadPlaces();
  }, []);

  const loadDistricts = async () => {
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .order('district_name', { ascending: true });
    if (!error) setDistricts(data);
  };

  const loadPlaces = async () => {
    const { data, error } = await supabase
      .from('places')
      .select(`*, districts!inner(district_name)`)
      .order('place_name', { ascending: true });
    if (!error) {
      // flatten district_name to keep existing render logic
      const flattened = data.map(p => ({
        ...p,
        district_name: p.districts.district_name
      }));
      setPlaces(flattened);
    }
  };

  /* ---------- add / update ---------- */
  const handleSave = async () => {
    if (!placeName && !editName) return;

    if (editId) {
      // UPDATE
      const { error } = await supabase
        .from('places')
        .update({ place_name: editName, district_id: editDist })
        .eq('id', editId);
      if (!error) {
        await loadPlaces();
        cancelEdit();
      }
    } else {
      // CREATE
      const { error } = await supabase
        .from('places')
        .insert([{ place_name: placeName, district_id: districtId }]);
      if (!error) {
        await loadPlaces();
        setPlaceName('');
        setDistrictId('');
      }
    }
  };

  /* ---------- edit helpers ---------- */
  const startEdit = p => {
    setEditId(p.id);
    setEditName(p.place_name);
    setEditDist(p.district_id);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
    setEditDist('');
  };

  /* ---------- delete ---------- */
  const handleDel = async id => {
    const { error } = await supabase.from('places').delete().eq('id', id);
    if (!error) setPlaces(prev => prev.filter(p => p.id !== id));
  };

  /* ---------- render ---------- */
  return (
    <div style={{ padding: 20 }}>
      <h3>{editId ? 'Edit place' : 'Add new place'}</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>District</th>
            <th>Place</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <select
                value={editId ? editDist : districtId}
                onChange={e =>
                  editId ? setEditDist(e.target.value) : setDistrictId(e.target.value)
                }
              >
                <option value="">-- select --</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.district_name}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                placeholder="Enter place"
                value={editId ? editName : placeName}
                onChange={e =>
                  editId ? setEditName(e.target.value) : setPlaceName(e.target.value)
                }
              />
            </td>
            <td>
              <button onClick={handleSave}>{editId ? 'Update' : 'Save'}</button>
              {editId && (
                <button onClick={cancelEdit} style={{ marginLeft: 4 }}>
                  Cancel
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Existing places</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Place</th>
            <th>District</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {places.map(p => (
            <tr key={p.id}>
              <td>{p.place_name}</td>
              <td>{p.district_name}</td>
              <td>
                <button onClick={() => startEdit(p)}>Edit</button>
                <button onClick={() => handleDel(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Place;