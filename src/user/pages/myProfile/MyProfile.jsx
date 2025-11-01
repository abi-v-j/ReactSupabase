// src/components/MyProfile.jsx
import React, { useEffect, useState } from 'react';
import supabase from '../../../globals/supabase';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      const uid = sessionStorage.getItem('uid');
      if (!uid) return;

      /*  joined select: users → places → districts  */
      const { data, error } = await supabase
        .from('users')
        .select(`
          full_name,
          email,
          photo_url,
          places!inner(
            place_name,
            districts!inner(district_name)
          )
        `)
        .eq('id', uid)
        .single(); // one row

      if (error) { console.error(error); return; }

      // flatten to keep old render logic
      setProfile({
        full_name: data.full_name,
        email: data.email,
        photo_url: data.photo_url,
        place_name: data.places.place_name,
        district_name: data.places.districts.district_name,
      });
    })();
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h3>My Profile</h3>
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td>Photo</td>
            <td>
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="user" width="120" />
              ) : (
                <span>No photo</span>
              )}
            </td>
          </tr>
          <tr><td>Name</td><td>{profile.full_name}</td></tr>
          <tr><td>Email</td><td>{profile.email}</td></tr>
          <tr><td>District</td><td>{profile.district_name}</td></tr>
          <tr><td>Place</td><td>{profile.place_name}</td></tr>
        </tbody>
      </table>
    </div>
  );
};

export default MyProfile;