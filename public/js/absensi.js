'use strict';

async function loadLaporan(tanggal) {
  try {
    const [rekap, laporan] = await Promise.all([
      fetch('/api/absensi/laporan/rekap?tanggal=' + tanggal).then(function (r) {
        return r.json();
      }),
      fetch('/api/absensi/laporan?tanggal=' + tanggal).then(function (r) {
        return r.json();
      })
    ]);

    if (rekap.success) {
      renderStatCards(rekap.data);
    }
    if (laporan.success) {
      renderTable(laporan.data);
    }
  } catch (err) {
    console.error('[ABSENSI] loadLaporan:', err.message);
  }
}

function renderStatCards(data) {
  const totals = { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0 };
  let total = 0;

  data.forEach(function (item) {
    totals[item.status] = (totals[item.status] || 0) + item.total;
    total += item.total;
  });

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-hadir').textContent = totals['Hadir'] || 0;
  document.getElementById('stat-sakit').textContent = totals['Sakit'] || 0;
  document.getElementById('stat-izin').textContent = totals['Izin'] || 0;
  document.getElementById('stat-alpa').textContent = totals['Alpa'] || 0;
}

function badgeForStatus(status) {
  const map = {
    Hadir: 'badge--green',
    Sakit: 'badge--red',
    Izin: 'badge--gray',
    Alpa: 'badge--red'
  };
  return '<span class="badge ' + (map[status] || 'badge--gray') + '">' + status + '</span>';
}

function renderTable(data) {
  const tbody = document.getElementById('laporan-table-body');
  if (!tbody) return;

  if (!data || !data.length) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="text-center text-muted">Belum ada data absensi.</td></tr>';
    return;
  }

  tbody.innerHTML = data
    .map(function (row, i) {
      return (
        '<tr>' +
        '<td>' +
        (i + 1) +
        '</td>' +
        '<td><strong>' +
        row.nis +
        '</strong></td>' +
        '<td>' +
        row.nama_siswa +
        '</td>' +
        '<td>' +
        (row.nama_pelajaran || '–') +
        '</td>' +
        '<td>' +
        (row.nama_guru || '–') +
        '</td>' +
        '<td>' +
        badgeForStatus(row.status) +
        '</td>' +
        '<td>' +
        (row.keterangan || '–') +
        '</td>' +
        '</tr>'
      );
    })
    .join('');
}

// ============================================================
// ===================== BAGIAN GURU =========================
// ============================================================

const ABSENSI_STATUS_OPTIONS = ['Hadir', 'Sakit', 'Izin', 'Alpa'];

function renderStatusDropdown(siswaId, selected) {
  const current = selected || 'Hadir';
  const options = ABSENSI_STATUS_OPTIONS.map(function (s) {
    const sel = current === s ? ' selected' : '';
    return '<option value="' + s + '"' + sel + '>' + s + '</option>';
  }).join('');
  return (
    '<select class="form-input absensi-status" data-siswa-id="' +
    siswaId +
    '">' +
    options +
    '</select>'
  );
}

function renderKeteranganTextarea(siswaId, value) {
  const safeValue = value ? String(value).replace(/"/g, '&quot;') : '';
  return (
    '<textarea class="form-input absensi-keterangan" data-siswa-id="' +
    siswaId +
    '" placeholder="Opsional" rows="1">' +
    safeValue +
    '</textarea>'
  );
}

function hideAlertEl(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

function showAbsensiSuccess(msg) {
  const el = document.getElementById('alertSuccess');
  const txt = document.getElementById('alertSuccessMsg');
  const errEl = document.getElementById('alertError');
  if (errEl) errEl.hidden = true;
  if (txt) txt.textContent = msg;
  if (el) el.hidden = false;
}

function showAbsensiError(msg) {
  const el = document.getElementById('alertError');
  const txt = document.getElementById('alertErrorMsg');
  const sucEl = document.getElementById('alertSuccess');
  if (sucEl) sucEl.hidden = true;
  if (txt) txt.textContent = msg;
  if (el) el.hidden = false;
}

/**
 * 1. Memuat daftar jadwal milik guru yang sedang login ke #guru-schedule-select
 */
window.loadGuruSchedules = async function (tanggal) {
  const sel = document.getElementById('guru-schedule-select');
  if (!sel) return;

  const nip = window.currentUser?.username;
  const hariMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  // Tanggal acuan: dari parameter, atau dari input #guru-tanggal-select, atau hari ini
  const tanggalInput = document.getElementById('guru-tanggal-select');
  const effectiveTanggal =
    tanggal || (tanggalInput && tanggalInput.value) || new Date().toISOString().slice(0, 10);
  const targetDate = new Date(effectiveTanggal + 'T00:00:00');
  const targetHari = hariMap[targetDate.getDay()];

  sel.innerHTML = '<option value="">Memuat jadwal...</option>';

  try {
    const res = await fetch('/api/jadwal/guru?nip=' + encodeURIComponent(nip));
    const json = await res.json();

    sel.innerHTML = '<option value="">— Pilih Jadwal —</option>';

    if (!json.success || !json.data.length) {
      sel.innerHTML += '<option value="" disabled>Tidak ada jadwal untuk Anda</option>';
      return;
    }

    // Filter jadwal berdasarkan hari dari tanggal yang dipilih
    const filteredSchedules = json.data.filter(function (s) {
      return s.hari === targetHari;
    });

    if (filteredSchedules.length === 0) {
      sel.innerHTML +=
        '<option value="" disabled>Tidak ada jadwal mengajar pada hari ' + targetHari + '</option>';
      return;
    }

    filteredSchedules.forEach(function (s) {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent =
        s.nama_pelajaran +
        ' — ' +
        s.jam_mulai.substring(0, 5) +
        '-' +
        s.jam_selesai.substring(0, 5) +
        ' (' +
        s.ruangan +
        ')';
      sel.appendChild(opt);
    });
  } catch (e) {
    sel.innerHTML = '<option value="">Gagal memuat jadwal</option>';
    console.error('[ABSENSI] loadGuruSchedules:', e.message);
  }
};

/**
 * 2. Memuat daftar siswa untuk jadwal terpilih dan merender tabel,
 *    pre-fill status & keterangan jika sudah ada data absensi hari ini.
 */
window.loadSiswaBySchedule = async function (scheduleId, tanggal) {
  const tbody = document.getElementById('absensi-table-body');
  if (!tbody) return;

  if (!scheduleId) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center text-muted">Pilih jadwal untuk menampilkan daftar siswa.</td></tr>';
    return;
  }

  const tanggalInput = document.getElementById('guru-tanggal-select');
  const effectiveTanggal =
    tanggal || (tanggalInput && tanggalInput.value) || new Date().toISOString().slice(0, 10);

  tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Memuat data...</td></tr>';

  try {
    const res = await fetch(
      '/api/absensi/siswa-by-schedule?schedule_id=' +
        encodeURIComponent(scheduleId) +
        '&tanggal=' +
        encodeURIComponent(effectiveTanggal)
    );
    const json = await res.json();

    if (!json.success || !json.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="text-center text-muted">Tidak ada siswa terdaftar pada jadwal ini.</td></tr>';
      return;
    }

    tbody.innerHTML = json.data
      .map(function (s, i) {
        return (
          '<tr>' +
          '<td>' +
          (i + 1) +
          '</td>' +
          '<td>' +
          s.nis +
          '</td>' +
          '<td>' +
          s.nama +
          '</td>' +
          '<td>' +
          renderStatusDropdown(s.id, s.status_absen) +
          '</td>' +
          '<td>' +
          renderKeteranganTextarea(s.id, s.keterangan) +
          '</td>' +
          '</tr>'
        );
      })
      .join('');

    tbody.querySelectorAll('.absensi-keterangan').forEach(function (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
      el.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      });
    });
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="text-center text-danger">Gagal memuat daftar siswa.</td></tr>';
    console.error('[ABSENSI] loadSiswaBySchedule:', e.message);
  }
};

/**
 * 3. Mengumpulkan semua value dari tabel dan mengirim ke /api/absensi/batch
 */
window.submitAbsensiGuru = async function () {
  // ── Validasi ─────────────────────────────────────────
  const sel = document.getElementById('guru-schedule-select');
  const errEl = document.getElementById('err-jadwal');
  if (errEl) errEl.textContent = '';
  hideAlertEl('alertSuccess');
  hideAlertEl('alertError');

  const scheduleId = sel ? sel.value : '';
  if (!scheduleId) {
    if (errEl) errEl.textContent = 'Pilih jadwal terlebih dahulu.';
    showAbsensiError('Pilih jadwal terlebih dahulu.');
    return;
  }

  if (!document.querySelector('.absensi-status')) {
    showAbsensiError('Tidak ada data siswa untuk disimpan.');
    return;
  }

  const keteranganMap = {};
  document.querySelectorAll('.absensi-keterangan').forEach(function (el) {
    keteranganMap[el.dataset.siswaId] = el.value.trim();
  });

  const entries = [];
  document.querySelectorAll('.absensi-status').forEach(function (el) {
    const siswaId = el.dataset.siswaId;
    entries.push({
      siswa_id: Number(siswaId),
      status: el.value,
      keterangan: keteranganMap[siswaId] || null
    });
  });

  if (entries.length === 0) {
    showAbsensiError('Tidak ada data absensi yang disimpan.');
    return;
  }

  // ── Tampilkan modal konfirmasi ──────────────────────
  const modalYa = document.getElementById('btnKonfirmasiAbsensiYa');
  const modalTidak = document.getElementById('btnKonfirmasiAbsensiTidak');

  const confirmed = await new Promise(function (resolve) {
    function cleanup() {
      modalYa.removeEventListener('click', onYa);
      modalTidak.removeEventListener('click', onTidak);
    }
    function onYa() {
      cleanup();
      resolve(true);
    }
    function onTidak() {
      cleanup();
      resolve(false);
    }
    modalYa.addEventListener('click', onYa);
    modalTidak.addEventListener('click', onTidak);
    window.openModal('modal-konfirmasi-absensi');
  });

  if (!confirmed) {
    window.closeModal('modal-konfirmasi-absensi');
    return;
  }
  window.closeModal('modal-konfirmasi-absensi');

  // ── Kirim data ──────────────────────────────────────
  const tanggalInput = document.getElementById('guru-tanggal-select');
  const tanggal = (tanggalInput && tanggalInput.value) || new Date().toISOString().slice(0, 10);

  const btn = document.getElementById('btnSimpanAbsensi');
  const textEl = document.getElementById('btnSimpanAbsensiText');
  const loadEl = document.getElementById('btnSimpanAbsensiLoader');
  if (btn) btn.disabled = true;
  if (textEl) textEl.hidden = true;
  if (loadEl) loadEl.hidden = false;

  try {
    const res = await fetch('/api/absensi/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schedule_id: Number(scheduleId),
        tanggal: tanggal,
        entries: entries
      })
    });

    const data = await res.json();

    if (data.success) {
      showAbsensiSuccess(data.message || 'Absensi berhasil disimpan.');
      // Reload tabel untuk menampilkan data terbaru (AC 3.2.3)
      const scheduleId = sel?.value;
      if (scheduleId) {
        window.loadSiswaBySchedule(scheduleId, tanggal);
      }
    } else {
      showAbsensiError(data.message || 'Gagal menyimpan absensi.');
    }
  } catch (e) {
    showAbsensiError('Tidak dapat terhubung ke server.');
    console.error('[ABSENSI] submitAbsensiGuru:', e.message);
  } finally {
    if (btn) btn.disabled = false;
    if (textEl) textEl.hidden = false;
    if (loadEl) loadEl.hidden = true;
  }
};

// ============================================================
// ===================== INIT (updated) ======================
// ============================================================

window.page_absensi_init = function () {
  // ── Percabangan berdasarkan role: GURU ─────────────────────
  if (window.currentUser?.role === 'guru') {
    document.getElementById('guru-section').hidden = false;
    document.getElementById('admin-section').hidden = true;

    const tanggalInput = document.getElementById('guru-tanggal-select');
    if (tanggalInput) {
      tanggalInput.value = new Date().toISOString().slice(0, 10);
    }

    window.loadGuruSchedules();

    tanggalInput?.addEventListener('change', function (e) {
      // Reset tabel siswa & reload dropdown jadwal sesuai tanggal baru
      const tbody = document.getElementById('absensi-table-body');
      if (tbody)
        tbody.innerHTML =
          '<tr><td colspan="5" class="text-center text-muted">Pilih jadwal untuk menampilkan daftar siswa.</td></tr>';
      window.loadGuruSchedules(e.target.value);
    });

    document.getElementById('guru-schedule-select')?.addEventListener('change', function (e) {
      window.loadSiswaBySchedule(e.target.value, tanggalInput && tanggalInput.value);
    });

    document
      .getElementById('btnSimpanAbsensi')
      ?.addEventListener('click', window.submitAbsensiGuru);

    return;
  }

  // ── Default: tampilan admin (kode asli, tidak diubah) ──────
  const dateInput = document.getElementById('filter-tanggal');
  if (!dateInput) return;

  dateInput.value = new Date().toISOString().split('T')[0];
  loadLaporan(dateInput.value);

  dateInput.addEventListener('change', function () {
    loadLaporan(this.value);
  });
};
