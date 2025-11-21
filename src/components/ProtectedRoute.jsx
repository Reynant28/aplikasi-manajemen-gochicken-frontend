// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useParams } from "react-router-dom";

export default function ProtectedRoute({ allowedRole }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const cabang = JSON.parse(localStorage.getItem("cabang"));
  const { id_cabang } = useParams();

  if (!user) {
    return <Navigate to="/" replace />; // kalau belum login → login
  }

  // Kalau role tidak sesuai, arahkan ke dashboard yg benar
  if (user.role !== allowedRole) {
    if (user.role === "super admin") {
      return <Navigate to="/super-admin/dashboard/general" replace />;
    }
    if (user.role === "admin cabang") {
      return (
        <Navigate
          to={`/admin-cabang/${cabang?.id_cabang}/dashboard/general`}
          replace
        />
      );
    }
  }

  // Kalau admin cabang, pastikan URL id_cabang = yang login
  if (
    user.role === "admin cabang" &&
    id_cabang &&
    +id_cabang !== cabang?.id_cabang
  ) {
    return (
      <Navigate
        to={`/admin-cabang/${cabang?.id_cabang}/dashboard/general`}
        replace
      />
    );
  }

  return <Outlet />;
}
