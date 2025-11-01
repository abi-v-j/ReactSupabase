// src/components/District.jsx
import React, { useEffect, useState } from "react";
import supabase from "../../../globals/supabase"; // ← the file you pasted at the top

const District = () => {
  const [value, setValue] = useState("");
  const [districts, setDistricts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  /* ---------- LOAD ---------- */
  const loadDistricts = async () => {
    const { data, error } = await supabase
      .from("districts")
      .select("*")
      .order("district_name", { ascending: true });

    if (error) console.error(error);
    else setDistricts(data);
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  /* ---------- ADD / UPDATE ---------- */
  const handleSave = async () => {
    if (editId) {
      // UPDATE
      const { data, error } = await supabase
        .from("districts")
        .update({ district_name: editName })
        .eq("id", editId)
        .select(); // returns updated row(s)

      if (error) console.error(error);
      else {
        loadDistricts();
        cancelEdit();
      }
    } else {
      // CREATE
      const { data, error } = await supabase
        .from("districts")
        .insert([{ district_name: value }])
        .select();

      if (error) console.error(error);
      else {
        loadDistricts();
        setValue("");
      }
    }
  };

  /* ---------- EDIT ---------- */
  const startEdit = (d) => {
    setEditId(d.id);
    setEditName(d.district_name);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id) => {
    const { error } = await supabase.from("districts").delete().eq("id", id);
    if (error) console.error(error);
    else setDistricts((prev) => prev.filter((d) => d.id !== id));
  };

  /* ---------- RENDER ---------- */
  return (
    <div>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>District</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              {editId ? (
                <input
                  placeholder="Edit district"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              ) : (
                <input
                  placeholder="Enter district"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              )}
            </td>
            <td>
              <button onClick={handleSave}>{editId ? "Update" : "Save"}</button>
              {editId && (
                <button onClick={cancelEdit} style={{ marginLeft: 4 }}>
                  Cancel
                </button>
              )}
            </td>
          </tr>
        </tbody>

        {districts.map((d) => (
          <tbody key={d.id}>
            <tr>
              <td>{d.district_name}</td>
              <td>
                <button onClick={() => startEdit(d)}>Edit</button>
                <button onClick={() => handleDelete(d.id)}>Delete</button>
              </td>
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
};

export default District;
