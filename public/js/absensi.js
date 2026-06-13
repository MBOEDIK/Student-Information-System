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

function showAbsensiAlert(success, msg) {
  const sucEl = document.getElementById('alertAbsensiSuccess');
  const errEl = document.getElementById('alertAbsensiError');
  const sucTxt = document.getElementById('alertAbsensiSuccessMsg');
  const errTxt = document.getElementById('alertAbsensiErrorMsg');
  if (success) {
    if (errEl) errEl.hidden = true;
    if (sucTxt) sucTxt.textContent = msg;
    if (sucEl) sucEl.hidden = false;
  } else {
    if (sucEl) sucEl.hidden = true;
    if (errTxt) errTxt.textContent = msg;
    if (errEl) errEl.hidden = false;
  }
}

function setAbsensiLoading(on) {
  const btn = document.getElementById('btnSimpanAbsensi');
  const textEl = document.getElementById('btnSimpanAbsensiText');
  const loadEl = document.getElementById('btnSimpanAbsensiLoader');
  if (btn) btn.disabled = on;
  if (textEl) textEl.hidden = on;
  if (loadEl) loadEl.hidden = !on;
}

function renderSiswaAbsensi(siswa) {
  const tbody = document.getElementById('siswa-absensi-body');
  if (!tbody) return;

  if (!siswa || !siswa.length) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center text-muted">Tidak ada siswa terdaftar di jadwal ini.</td></tr>';
    return;
  }

  tbody.innerHTML = siswa
    .map(function (s, i) {
      return (
        '<tr>' +
        '<td>' +
        (i + 1) +
        '</td>' +
        '<td><strong>' +
        s.nis +
        '</strong></td>' +
        '<td>' +
        s.nama +
        '</td>' +
        '<td>' +
        '<select class="form-input status-absensi" data-student-id="' +
        s.id +
        '">' +
        '<option value="Hadir">Hadir</option>' +
        '<option value="Sakit">Sakit</option>' +
        '<option value="Izin">Izin</option>' +
        '<option value="Alpa">Alpa</option>' +
        '</select>' +
        '</td>' +
        '</tr>'
      );
    })
    .join('');
}

window.page_absensi_init = function () {
  const guruView = document.getElementById('absensi-guru-view');
  const adminView = document.getElementById('absensi-admin-view');

  if (window.currentUser?.role === 'guru') {
    if (guruView) guruView.hidden = false;
    if (adminView) adminView.hidden = true;

    const select = document.getElementById('jadwal-guru-select');
    const container = document.getElementById('absensi-siswa-container');
    const tanggalInput = document.getElementById('tanggal-absensi');
    const btnSimpan = document.getElementById('btnSimpanAbsensi');
    const btnReset = document.getElementById('btnResetAbsensi');

    tanggalInput.value = new Date().toISOString().split('T')[0];

    fetch('/api/absensi/jadwal-guru?nip=' + encodeURIComponent(window.currentUser.username))
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        if (json.success && json.data.length) {
          json.data.forEach(function (j) {
            var opt = document.createElement('option');
            opt.value = j.id;
            opt.textContent =
              j.nama_pelajaran +
              ' — ' +
              j.hari +
              ' ' +
              j.jam_mulai.substring(0, 5) +
              '-' +
              j.jam_selesai.substring(0, 5) +
              ' (' +
              j.ruangan +
              ')';
            select.appendChild(opt);
          });
        } else {
          var opt = document.createElement('option');
          opt.disabled = true;
          opt.textContent = 'Tidak ada jadwal';
          select.appendChild(opt);
        }
      })
      .catch(function () {
        showAbsensiAlert(false, 'Gagal memuat jadwal.');
      });

    select.addEventListener('change', function () {
      var scheduleId = this.value;
      if (!scheduleId) {
        container.hidden = true;
        return;
      }

      container.hidden = false;

      fetch('/api/absensi/siswa/' + scheduleId)
        .then(function (r) {
          return r.json();
        })
        .then(function (json) {
          if (json.success) {
            renderSiswaAbsensi(json.data);
          } else {
            showAbsensiAlert(false, json.message || 'Gagal memuat siswa.');
          }
        })
        .catch(function () {
          showAbsensiAlert(false, 'Gagal memuat daftar siswa.');
        });
    });

    if (btnSimpan) {
      btnSimpan.addEventListener('click', async function () {
        var scheduleId = select.value;
        var tanggal = tanggalInput.value;

        if (!scheduleId || !tanggal) {
          showAbsensiAlert(false, 'Pilih jadwal dan tanggal terlebih dahulu.');
          return;
        }

        var selects = document.querySelectorAll('.status-absensi');
        var records = [];
        selects.forEach(function (sel) {
          records.push({
            student_id: parseInt(sel.dataset.studentId),
            status: sel.value
          });
        });

        if (!records.length) {
          showAbsensiAlert(false, 'Tidak ada data siswa untuk disimpan.');
          return;
        }

        setAbsensiLoading(true);

        try {
          var res = await fetch('/api/absensi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              schedule_id: parseInt(scheduleId),
              tanggal: tanggal,
              records: records
            })
          });
          var result = await res.json();

          if (result.success) {
            showAbsensiAlert(true, result.message);
          } else {
            showAbsensiAlert(false, result.message || 'Gagal menyimpan absensi.');
          }
        } catch (e) {
          showAbsensiAlert(false, 'Tidak dapat terhubung ke server.');
        } finally {
          setAbsensiLoading(false);
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function () {
        select.value = '';
        container.hidden = true;
        tanggalInput.value = new Date().toISOString().split('T')[0];
        document.getElementById('siswa-absensi-body').innerHTML =
          '<tr><td colspan="4" class="text-center text-muted">Pilih jadwal terlebih dahulu.</td></tr>';
      });
    }

    return;
  }

  // ── View Admin (laporan absensi) ──────────────────────────────────
  if (guruView) guruView.hidden = true;
  if (adminView) adminView.hidden = false;

  const dateInput = document.getElementById('filter-tanggal');
  if (!dateInput) return;

  dateInput.value = new Date().toISOString().split('T')[0];
  loadLaporan(dateInput.value);

  dateInput.addEventListener('change', function () {
    loadLaporan(this.value);
  });
};
