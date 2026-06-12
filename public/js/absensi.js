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

window.page_absensi_init = function () {
  const dateInput = document.getElementById('filter-tanggal');
  if (!dateInput) return;

  dateInput.value = new Date().toISOString().split('T')[0];
  loadLaporan(dateInput.value);

  dateInput.addEventListener('change', function () {
    loadLaporan(this.value);
  });
};
