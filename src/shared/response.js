// src/shared/response.js
// Helper global untuk standardisasi respons API (AI_RULES #3)

exports.success = (res, data, message = 'Berhasil', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

exports.error = (res, message = 'Gagal memproses permintaan', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = Array.isArray(errors) ? errors : [errors];
  return res.status(statusCode).json(response);
};
