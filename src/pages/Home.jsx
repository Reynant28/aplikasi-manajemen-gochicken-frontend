import React from "react";

const user = JSON.parse(localStorage.getItem("user"));

export default function Home() {
  return (
    <div>
      <h1>Selamat datang di GoChicken!</h1>
      {user && (
        <div>
          <p>Nama: {user.nama}</p>
          <p>Role: {user.role}</p>
          {user.id_cabang && <p>ID Cabang: {user.id_cabang}</p>}
        </div>
      )}
    </div>
  );
}