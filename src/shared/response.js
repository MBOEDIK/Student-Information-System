'use strict';

const success = (res, data, message = 'Berhasil', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

const error = (res, message = 'Terjadi kesalahan', status = 500) => {
  return res.status(status).json({ success: false, message });
};

module.exports = { success, error };