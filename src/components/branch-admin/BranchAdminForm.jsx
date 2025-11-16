import React from "react";
import { Plus, Edit } from "lucide-react";

const BranchAdminForm = ({ 
    formData, 
    onChange, 
    onSubmit, 
    loading, 
    cabang, 
    isEditing 
}) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
                <div className="p-2 bg-gray-100 rounded-lg">
                    {isEditing ? (
                        <Edit className="text-gray-700" size={24} />
                    ) : (
                        <Plus className="text-gray-700" size={24} />
                    )}
                </div>
                {isEditing ? "Edit Admin Cabang" : "Tambah Admin Cabang"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                    </label>
                    <input
                        type="text"
                        name="nama"
                        placeholder="Masukkan nama lengkap"
                        value={formData.nama}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        placeholder="admin@example.com"
                        value={formData.email}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password {isEditing && <span className="text-gray-500 text-xs">(Kosongkan jika tidak diubah)</span>}
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        required={!isEditing}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cabang
                    </label>
                    <select
                        name="id_cabang"
                        value={formData.id_cabang}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 disabled:opacity-70 disabled:cursor-not-allowed"
                        required
                        disabled={cabang.length === 0}
                    >
                        <option value="">
                            {cabang.length === 0 ? "Tidak ada cabang tersedia" : "Pilih Cabang"}
                        </option>
                        {cabang.map((cab) => (
                            <option key={cab.id_cabang} value={cab.id_cabang}>
                                {cab.nama_cabang}
                            </option>
                        ))}
                    </select>
                    {cabang.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                            Semua cabang sudah memiliki admin
                        </p>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BranchAdminForm;