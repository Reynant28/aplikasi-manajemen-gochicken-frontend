import React from "react";
import { Plus, Edit } from "lucide-react";

const CabangForm = ({ 
    formData, 
    onChange, 
    onSubmit, 
    loading, 
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
                {isEditing ? "Edit Cabang" : "Tambah Cabang Baru"}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Cabang
                    </label>
                    <input
                        type="text"
                        name="nama_cabang"
                        placeholder="Masukkan nama cabang"
                        value={formData.nama_cabang}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat
                    </label>
                    <input
                        type="text"
                        name="alamat"
                        placeholder="Masukkan alamat lengkap"
                        value={formData.alamat}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telepon
                    </label>
                    <input
                        type="text"
                        name="telepon"
                        placeholder="08123456789"
                        value={formData.telepon}
                        onChange={onChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                        required
                    />
                </div>

                {!isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password Cabang
                        </label>
                        <input
                            type="password"
                            name="password_cabang"
                            placeholder="••••••••"
                            value={formData.password_cabang || ""}
                            onChange={onChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                            required
                        />
                    </div>
                )}

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

export default CabangForm;