import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cabang, setCabang] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCabang = localStorage.getItem("cabang");

    if (!storedUser) {
      navigate("/"); // jika belum login, balik ke login
    } else {
      setUser(JSON.parse(storedUser));
      if (storedCabang) {
        setCabang(JSON.parse(storedCabang));
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cabang");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Selamat Datang, {user.nama || user.email}</h1>

      {user.role === "admin cabang" ? (
        <div>
          <h2>Data Admin Cabang</h2>
          <p><strong>ID:</strong> {user.id_user}</p>
          <p><strong>Nama:</strong> {user.nama}</p>
          <p><strong>Email:</strong> {user.email || "null"}</p>
          <p><strong>Role:</strong> {user.role}</p>

          {cabang && (
            <>
              <h3>Data Cabang</h3>
              <p><strong>ID Cabang:</strong> {cabang.id_cabang}</p>
              <p><strong>Nama Cabang:</strong> {cabang.nama_cabang}</p>
              <p><strong>Alamat:</strong> {cabang.alamat}</p>
              <p><strong>Telepon:</strong> {cabang.telepon}</p>
            </>
          )}
        </div>
      ) : (
        <div>
          <h2>Data Super Admin</h2>
          <p><strong>ID:</strong> {user.id_user}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Password:</strong> {user.password}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      )}

      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Logout
      </button>
    </div>
  );
}

export default Home;
