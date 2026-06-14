'use strict';

window.hapusJadwal = async function (id) {
  if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
  try {
    const res = await fetch('/api/jadwal/' + id, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      window.loadJadwal();
    } else {
      alert(json.message || 'Gagal menghapus jadwal.');
    }
  } catch (e) {
    alert('Tidak dapat terhubung ke server.');
  }
};

window.loadJadwal = async function () {
  const tbody = document.getElementById('jadwalTableBody');
  if (!tbody) return;
  tbody.innerHTML =
    '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Memuat data...</td></tr>';
  try {
    const res = await fetch('/api/jadwal');
    const json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Belum ada jadwal.</td></tr>';
      return;
    }
    tbody.innerHTML = json.data
      .map(
        (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${s.nama_pelajaran}</strong></td>
        <td>${s.nama_guru}</td>
        <td>${s.hari}</td>
        <td>${s.jam_mulai.substring(0, 5)} - ${s.jam_selesai.substring(0, 5)}</td>
        <td>${s.ruangan}</td>
        <td>
          <button class="btn btn--sm btn--primary" onclick="editJadwal(${s.id})">Edit</button>
          <button class="btn btn--danger btn--sm" onclick="hapusJadwal(${s.id})">
            Hapus
          </button>
        </td>
      </tr>
    `
      )
      .join('');
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align:center;color:var(--danger);">Gagal memuat jadwal.</td></tr>';
  }
};

window.loadJadwalSiswa = async function (nis) {
  const tbody = document.getElementById('jadwalSiswaTableBody');
  if (!tbody) return;
  tbody.innerHTML =
    '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Memuat data...</td></tr>';
  try {
    const res = await fetch('/api/jadwal/siswa?nis=' + encodeURIComponent(nis));
    const json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Belum ada jadwal untuk akun ini.</td></tr>';
      return;
    }
    tbody.innerHTML = json.data
      .map(
        (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${s.nama_pelajaran}</strong></td>
        <td>${s.nama_guru}</td>
        <td>${s.hari}</td>
        <td>${s.jam_mulai.substring(0, 5)} - ${s.jam_selesai.substring(0, 5)}</td>
        <td>${s.ruangan}</td>
      </tr>
    `
      )
      .join('');
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="text-align:center;color:var(--danger);">Gagal memuat jadwal.</td></tr>';
  }
};

window.loadJadwalGuru = async function (nip) {
  const tbody = document.getElementById('jadwalGuruTableBody');
  if (!tbody) return;
  tbody.innerHTML =
    '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Memuat data...</td></tr>';
  try {
    const res = await fetch('/api/jadwal/guru?nip=' + encodeURIComponent(nip));
    const json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Belum ada jadwal mengajar.</td></tr>';
      return;
    }
    tbody.innerHTML = json.data
      .map(
        (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${s.nama_pelajaran}</strong></td>
        <td>${s.hari}</td>
        <td>${s.jam_mulai.substring(0, 5)} - ${s.jam_selesai.substring(0, 5)}</td>
        <td>${s.ruangan}</td>
      </tr>
    `
      )
      .join('');
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;color:var(--danger);">Gagal memuat jadwal.</td></tr>';
  }
};

window.editJadwal = async function (id) {
  document.querySelectorAll('#modal-jadwal .field-error').forEach(function (e) {
    e.textContent = '';
  });

  const conflictEdit = document.getElementById('conflict-detail-edit');
  if (conflictEdit) {
    conflictEdit.innerHTML = '';
    conflictEdit.hidden = true;
  }

  try {
    const res = await fetch('/api/jadwal/' + id);
    const json = await res.json();
    if (!json.success) {
      alert(json.message || 'Gagal memuat data jadwal.');
      return;
    }

    const s = json.data;
    document.getElementById('edit-jadwal-id').value = s.id;
    document.getElementById('edit-jadwal-subject_id').value = s.subject_id;
    document.getElementById('edit-jadwal-teacher_id').value = s.teacher_id;
    document.getElementById('edit-jadwal-hari').value = s.hari;
    document.getElementById('edit-jadwal-jam_mulai').value = s.jam_mulai.substring(0, 5);
    document.getElementById('edit-jadwal-jam_selesai').value = s.jam_selesai.substring(0, 5);
    document.getElementById('edit-jadwal-ruangan').value = s.ruangan;

    window.openModal('modal-jadwal');
  } catch (e) {
    alert('Gagal memuat data jadwal.');
  }
};

window.simpanEditJadwal = async function () {
  const id = document.getElementById('edit-jadwal-id').value;
  const subject_id = document.getElementById('edit-jadwal-subject_id').value;
  const teacher_id = document.getElementById('edit-jadwal-teacher_id').value;
  const hari = document.getElementById('edit-jadwal-hari').value;
  const jam_mulai = document.getElementById('edit-jadwal-jam_mulai').value;
  const jam_selesai = document.getElementById('edit-jadwal-jam_selesai').value;
  const ruangan = document.getElementById('edit-jadwal-ruangan').value.trim();

  let hasError = false;
  function showEditError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
    hasError = true;
  }
  document.querySelectorAll('#modal-jadwal .field-error').forEach(function (e) {
    e.textContent = '';
  });

  const conflictEdit = document.getElementById('conflict-detail-edit');
  if (conflictEdit) {
    conflictEdit.innerHTML = '';
    conflictEdit.hidden = true;
  }

  if (!subject_id) showEditError('err-edit-subject', 'Mata pelajaran harus dipilih.');
  if (!teacher_id) showEditError('err-edit-teacher', 'Guru pengampu harus dipilih.');
  if (!jam_mulai) showEditError('err-edit-jam_mulai', 'Jam mulai harus diisi.');
  if (!jam_selesai) showEditError('err-edit-jam_selesai', 'Jam selesai harus diisi.');
  if (!ruangan) showEditError('err-edit-ruangan', 'Ruangan tidak boleh kosong.');
  if (jam_mulai && jam_selesai && jam_mulai >= jam_selesai) {
    showEditError('err-edit-jam_selesai', 'Jam selesai harus lebih besar dari jam mulai.');
  }

  if (hasError) return;

  const btn = document.getElementById('btnSimpanEditJadwal');
  if (btn) btn.disabled = true;

  try {
    const res = await fetch('/api/jadwal/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject_id: Number(subject_id),
        teacher_id: Number(teacher_id),
        hari: hari,
        jam_mulai: jam_mulai,
        jam_selesai: jam_selesai,
        ruangan: ruangan
      })
    });

    const data = await res.json();

    if (data.success) {
      window.closeModal('modal-jadwal');
      window.loadJadwal();
    } else {
      if (data.errors?.conflicts?.length) {
        const conflictHtml = data.errors.conflicts
          .map(
            (c) =>
              `<strong>${c.nama_pelajaran}</strong> — ${c.hari} ${c.jam_mulai.substring(0, 5)}-${c.jam_selesai.substring(0, 5)}, ${c.ruangan} (${c.nama_guru})`
          )
          .join('');
        if (conflictEdit) {
          conflictEdit.innerHTML = `<p>Gagal menyimpan, jadwal bentrok dengan Kelas:</p> ${conflictHtml}`;
          conflictEdit.hidden = false;
        }
      } else if (Array.isArray(data.errors) && data.errors[0]?.konflik) {
        const c = data.errors[0].konflik;
        const conflictHtml = `<strong>${c.mata_pelajaran}</strong> — ${c.hari} ${c.jam_mulai.substring(0, 5)}-${c.jam_selesai.substring(0, 5)}, ${c.ruangan} (${c.nama_guru})`;
        if (conflictEdit) {
          conflictEdit.innerHTML = `<p>Gagal menyimpan, jadwal bentrok dengan Kelas:</p> ${conflictHtml}`;
          conflictEdit.hidden = false;
        }
      } else if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach(function (msg) {
          if (msg.toLowerCase().includes('pelajaran')) showEditError('err-edit-subject', msg);
          else if (msg.toLowerCase().includes('guru')) showEditError('err-edit-teacher', msg);
          else if (msg.toLowerCase().includes('ruangan')) showEditError('err-edit-ruangan', msg);
        });
      }
    }
  } catch (e) {
    alert('Tidak dapat terhubung ke server.');
  } finally {
    if (btn) btn.disabled = false;
  }
};

window.page_jadwal_init = function () {
  function showJadwalSuccess(msg) {
    const el = document.getElementById('alertSuccess');
    const txt = document.getElementById('alertSuccessMsg');
    const errEl = document.getElementById('alertError');
    if (errEl) errEl.hidden = true;
    if (txt) txt.textContent = msg;
    if (el) el.hidden = false;
  }

  function showJadwalError(msg) {
    const el = document.getElementById('alertError');
    const txt = document.getElementById('alertErrorMsg');
    const sucEl = document.getElementById('alertSuccess');
    if (sucEl) sucEl.hidden = true;
    if (txt) txt.textContent = msg;
    if (el) el.hidden = false;
  }

  function setJadwalLoading(on) {
    const btn = document.getElementById('btnSimpanJadwal');
    const textEl = document.getElementById('btnSimpanText');
    const loadEl = document.getElementById('btnSimpanLoader');
    if (btn) btn.disabled = on;
    if (textEl) textEl.hidden = on;
    if (loadEl) loadEl.hidden = !on;
  }

  function resetJadwalForm() {
    const form = document.getElementById('formJadwal');
    if (form) form.reset();
    document.querySelectorAll('.field-error').forEach(function (e) {
      e.textContent = '';
    });
    document.querySelectorAll('.form-input').forEach(function (e) {
      e.classList.remove('input--error');
    });
    const conflictDetail = document.getElementById('conflict-detail');
    if (conflictDetail) {
      conflictDetail.innerHTML = '';
      conflictDetail.hidden = true;
    }
  }

  function showJadwalFieldError(groupId, errId, msg) {
    const g = document.getElementById(groupId);
    const e = document.getElementById(errId);
    if (e) e.textContent = msg;
    if (g) {
      const input = g.querySelector('.form-input');
      if (input) input.classList.add('input--error');
    }
  }

  async function loadSubjects(targetId, placeholder) {
    try {
      const data = await window.api('/api/jadwal/subjects');
      const sel = document.getElementById(targetId);
      if (!sel) return;
      sel.innerHTML = '<option value="">' + placeholder + '</option>';
      data.data.forEach(function (sub) {
        const opt = document.createElement('option');
        opt.value = sub.id;
        opt.textContent = sub.nama_pelajaran;
        sel.appendChild(opt);
      });
    } catch (e) {
      showJadwalError('Gagal memuat data mata pelajaran.');
    }
  }

  async function loadTeachers(targetId, placeholder) {
    try {
      const res = await fetch('/api/guru');
      const json = await res.json();
      const sel = document.getElementById(targetId);
      if (!sel) return;
      sel.innerHTML = '<option value="">' + placeholder + '</option>';
      if (json.success && json.data.length) {
        json.data.forEach(function (g) {
          const opt = document.createElement('option');
          opt.value = g.id;
          opt.textContent = g.nama + ' (' + g.nip + ')';
          if (g.status !== 'aktif') {
            opt.disabled = true;
            opt.textContent += ' [Tidak Aktif]';
          }
          sel.appendChild(opt);
        });
      }
    } catch (e) {
      showJadwalError('Gagal memuat data guru.');
    }
  }

  if (window.currentUser?.role === 'siswa') {
    const siswaView = document.getElementById('jadwal-siswa-view');
    const adminView = document.getElementById('jadwal-admin-view');
    if (siswaView) siswaView.hidden = false;
    if (adminView) adminView.hidden = true;
    window.loadJadwalSiswa(window.currentUser.username);
    return;
  }

  if (window.currentUser?.role === 'guru') {
    const guruView = document.getElementById('jadwal-guru-view');
    const adminView = document.getElementById('jadwal-admin-view');
    if (guruView) guruView.hidden = false;
    if (adminView) adminView.hidden = true;
    window.loadJadwalGuru(window.currentUser.username);
    return;
  }

  const adminView = document.getElementById('jadwal-admin-view');
  const siswaView = document.getElementById('jadwal-siswa-view');
  if (adminView) adminView.hidden = false;
  if (siswaView) siswaView.hidden = true;

  loadSubjects('subject_id', '— Pilih Mata Pelajaran —');
  loadTeachers('teacher_id', '— Pilih Guru —');
  loadSubjects('edit-jadwal-subject_id', '— Pilih —');
  loadTeachers('edit-jadwal-teacher_id', '— Pilih —');

  document
    .getElementById('btnSimpanEditJadwal')
    ?.addEventListener('click', window.simpanEditJadwal);

  document.getElementById('btnReset')?.addEventListener('click', function (e) {
    e.preventDefault();
    resetJadwalForm();
  });

  const form = document.getElementById('formJadwal');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      document.querySelectorAll('.field-error').forEach(function (el) {
        el.textContent = '';
      });
      document.querySelectorAll('.form-input').forEach(function (el) {
        el.classList.remove('input--error');
      });
      if (document.getElementById('alertSuccess'))
        document.getElementById('alertSuccess').hidden = true;
      if (document.getElementById('alertError'))
        document.getElementById('alertError').hidden = true;

      const conflictDetail = document.getElementById('conflict-detail');
      if (conflictDetail) {
        conflictDetail.innerHTML = '';
        conflictDetail.hidden = true;
      }

      const subject_id = document.getElementById('subject_id')?.value;
      const teacher_id = document.getElementById('teacher_id')?.value;
      const hari = document.getElementById('hari')?.value;
      const jam_mulai = document.getElementById('jam_mulai')?.value;
      const jam_selesai = document.getElementById('jam_selesai')?.value;
      const ruangan = document.getElementById('ruangan')?.value.trim();

      let hasError = false;

      if (!subject_id) {
        showJadwalFieldError('group-subject', 'err-subject', 'Mata pelajaran harus dipilih.');
        hasError = true;
      }
      if (!teacher_id) {
        showJadwalFieldError('group-teacher', 'err-teacher', 'Guru pengampu harus dipilih.');
        hasError = true;
      }
      if (!hari) {
        showJadwalFieldError('group-hari', 'err-hari', 'Hari harus dipilih.');
        hasError = true;
      }
      if (!jam_mulai) {
        showJadwalFieldError('group-jam_mulai', 'err-jam_mulai', 'Jam mulai harus diisi.');
        hasError = true;
      }
      if (!jam_selesai) {
        showJadwalFieldError('group-jam_selesai', 'err-jam_selesai', 'Jam selesai harus diisi.');
        hasError = true;
      }
      if (!ruangan) {
        showJadwalFieldError('group-ruangan', 'err-ruangan', 'Ruangan tidak boleh kosong.');
        hasError = true;
      }
      if (jam_mulai && jam_selesai && jam_mulai >= jam_selesai) {
        showJadwalFieldError(
          'group-jam_selesai',
          'err-jam_selesai',
          'Jam selesai harus lebih besar dari jam mulai.'
        );
        hasError = true;
      }

      if (hasError) return;

      setJadwalLoading(true);

      try {
        const res = await fetch('/api/jadwal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject_id: Number(subject_id),
            teacher_id: Number(teacher_id),
            hari,
            jam_mulai,
            jam_selesai,
            ruangan
          })
        });

        const data = await res.json();

        if (data.success) {
          showJadwalSuccess(data.message);
          resetJadwalForm();
          window.loadJadwal();
        } else {
          if (data.errors?.conflicts?.length) {
            const conflictHtml = data.errors.conflicts
              .map(
                (c) =>
                  `<strong>${c.nama_pelajaran}</strong> — ${c.hari} ${c.jam_mulai.substring(0, 5)}-${c.jam_selesai.substring(0, 5)}, ${c.ruangan} (${c.nama_guru})`
              )
              .join('');
            if (conflictDetail) {
              conflictDetail.innerHTML = `<p>Gagal menyimpan, jadwal bentrok dengan Kelas:</p>${conflictHtml}`;
              conflictDetail.hidden = false;
            }
          } else if (Array.isArray(data.errors) && data.errors[0]?.konflik) {
            const c = data.errors[0].konflik;
            const conflictHtml = `<strong>${c.mata_pelajaran}</strong> — ${c.hari} ${c.jam_mulai.substring(0, 5)}-${c.jam_selesai.substring(0, 5)}, ${c.ruangan} (${c.nama_guru})`;
            if (conflictDetail) {
              conflictDetail.innerHTML = `<p>Gagal menyimpan, jadwal bentrok dengan kelas:</p>${conflictHtml}`;
              conflictDetail.hidden = false;
            }
          } else if (Array.isArray(data.errors)) {
            data.errors.forEach(function (msg) {
              if (msg.toLowerCase().includes('pelajaran')) {
                showJadwalFieldError('group-subject', 'err-subject', msg);
              } else if (msg.toLowerCase().includes('guru')) {
                showJadwalFieldError('group-teacher', 'err-teacher', msg);
              } else if (msg.toLowerCase().includes('hari')) {
                showJadwalFieldError('group-hari', 'err-hari', msg);
              } else if (msg.toLowerCase().includes('mulai')) {
                showJadwalFieldError('group-jam_mulai', 'err-jam_mulai', msg);
              } else if (msg.toLowerCase().includes('selesai')) {
                showJadwalFieldError('group-jam_selesai', 'err-jam_selesai', msg);
              } else if (msg.toLowerCase().includes('ruangan')) {
                showJadwalFieldError('group-ruangan', 'err-ruangan', msg);
              }
            });
          }
          showJadwalError(data.message || 'Pembuatan jadwal gagal.');
        }
      } catch (err) {
        showJadwalError('Tidak dapat terhubung ke server.');
      } finally {
        setJadwalLoading(false);
      }
    });
  }

  window.loadJadwal();
};
