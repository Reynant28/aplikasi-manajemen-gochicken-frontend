// services/backupService.js
import axios from 'axios';

// Hardcode API URL untuk sementara
const API_URL = 'http://localhost:8000'; // Ganti dengan URL backend Anda

export const backupService = {
  // === EXPORT DATABASE ===
  exportDatabase: async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Starting backup process...');
      
      const response = await axios.get(`${API_URL}/api/backup/database`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/sql'
        },
        timeout: 60000 // 60 seconds timeout
      });
      
      console.log('Backup response received:', response);
      
      // Create blob link untuk download
      const blob = new Blob([response.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename dari header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'backup_database.sql';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Backup downloaded successfully:', filename);
      return { success: true, filename };
      
    } catch (error) {
      console.error('Backup error details:', error);
      
      // Handle network errors
      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      
      // Handle 403 Forbidden
      if (error.response.status === 403) {
        throw new Error('Anda tidak memiliki akses untuk melakukan backup database. Hanya Super Admin yang diizinkan.');
      }
      
      // Handle 500 Internal Server Error
      if (error.response.status === 500) {
        throw new Error('Terjadi kesalahan di server saat melakukan backup.');
      }
      
      // Coba baca error message dari blob
      if (error.response.data instanceof Blob) {
        try {
          const errorData = await error.response.data.text();
          const errorJson = JSON.parse(errorData);
          throw new Error(errorJson.message || 'Gagal melakukan backup database');
        } catch (parseError) {
          throw new Error('Gagal melakukan backup database');
        }
      }
      
      throw new Error(error.response?.data?.message || 'Gagal melakukan backup database');
    }
  },

  // === RESTORE DATABASE ===
  restoreDatabase: async (file) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!file) {
        throw new Error('Silakan pilih file backup (.sql) terlebih dahulu.');
      }

      console.log('Starting restore process...', file.name);

      const formData = new FormData();
      formData.append('backup_file', file);

      const response = await axios.post(`${API_URL}/api/backup/restore`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 120000 // Timeout lebih lama (2 menit) karena restore butuh waktu
      });

      console.log('Restore response:', response);

      if (response.data && response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data?.message || 'Gagal merestore database.');
      }

    } catch (error) {
      console.error('Restore error details:', error);

      if (!error.response) {
        throw new Error('Tidak dapat terhubung ke server.');
      }

      if (error.response.status === 403) {
        throw new Error('Hanya Super Admin yang diizinkan merestore database.');
      }

      const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat restore database.';
      throw new Error(errorMessage);
    }
  }
};