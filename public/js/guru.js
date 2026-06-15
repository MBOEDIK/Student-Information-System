'use strict';

window.loadGuru = async function () {
  const tbody = document.getElementById('guruTableBody');
  if (!tbody) return;
  tbody.innerHTML =
    '<tr><td colspan="6" class="text-center text-muted py-32">Memuat data...</td></tr>';
  try {
    const res = await fetch('/api/guru');
    const json = await res.json();
    if (!json.success || !json.data.length) {
      tbody.innerHTML =
        '<tr><td colspan="6"><div class="empty-state"><div class="empty-state__icon"><i class="bi bi-inbox"></i></div><div class="empty-state__title">Belum ada data guru</div><div class="empty-state__desc">Belum ada data guru.</div></div></td></tr>';
      return;
    }
    tbody.innerHTML = json.data
      .map(
        (g, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${g.nip}</strong></td>
        <td>${g.nama}</td>
        <td>${g.email || '–'}</td>
        <td>${window.statusBadge(g.status)}</td>
        <td><button class="btn btn--icon btn--icon-edit" onclick="editGuru(${g.id})" title="Edit"><i class="bi bi-pencil"></i></button></td>
      </tr>
    `
      )
      .join('');
  } catch (e) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center text-danger">Gagal memuat data.</td></tr>';
  }
};

window.editGuru = async function (id) {
  try {
    const res = await fetch(`/api/guru/${id}`);
    const json = await res.json();
    const g = json.data;
    document.getElementById('edit-guru-id').value = g.id;
    document.getElementById('edit-guru-nama').value = g.nama;
    document.getElementById('edit-guru-nip').value = g.nip;
    document.getElementById('edit-guru-email').value = g.email || '';
    document.getElementById('edit-guru-status').value = g.status;
    window.openModal('modal-guru');
  } catch (e) {
    alert('Gagal memuat data guru.');
  }
};

window.simpanGuru = async function () {
  const id = document.getElementById('edit-guru-id').value;
  const body = {
    nama: document.getElementById('edit-guru-nama').value,
    nip: document.getElementById('edit-guru-nip').value,
    email: document.getElementById('edit-guru-email').value,
    status: document.getElementById('edit-guru-status').value
  };
  try {
    const res = await fetch(`/api/guru/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await res.json();
    alert(result.message);
    window.closeModal('modal-guru');
    window.loadGuru();
  } catch (e) {
    alert('Gagal menyimpan data guru.');
  }
};

window.registerGuru = async function (data) {
  try {
    const res = await fetch('/api/guru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Tidak dapat terhubung ke server.' };
  }
};

function showGuruAlert(success, msg) {
  const sucEl = document.getElementById('alertGuruSuccess');
  const errEl = document.getElementById('alertGuruError');
  const sucTxt = document.getElementById('alertGuruSuccessMsg');
  const errTxt = document.getElementById('alertGuruErrorMsg');
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

function resetFormGuru() {
  const form = document.getElementById('formRegistrasiGuru');
  if (form) form.reset();
  document.querySelectorAll('#formRegistrasiGuru .field-error').forEach(function (el) {
    el.textContent = '';
  });
  document.querySelectorAll('#formRegistrasiGuru .form-input').forEach(function (el) {
    el.classList.remove('input--error');
  });
}

function setRegistrasiGuruLoading(on) {
  const btn = document.getElementById('btnRegistrasiGuru');
  const textEl = document.getElementById('btnRegistrasiGuruText');
  const loadEl = document.getElementById('btnRegistrasiGuruLoader');
  if (btn) btn.disabled = on;
  if (textEl) textEl.hidden = on;
  if (loadEl) loadEl.hidden = !on;
}

function showGuruFieldError(groupId, errId, msg) {
  const g = document.getElementById(groupId);
  const e = document.getElementById(errId);
  if (e) e.textContent = msg;
  g?.querySelector('.form-input')?.classList.add('input--error');
}

function clearGuruFieldErrors() {
  document.querySelectorAll('#formRegistrasiGuru .field-error').forEach(function (el) {
    el.textContent = '';
  });
  document.querySelectorAll('#formRegistrasiGuru .form-input').forEach(function (el) {
    el.classList.remove('input--error');
  });
}

window.page_guru_init = function () {
  const form = document.getElementById('formRegistrasiGuru');

  document.getElementById('btnResetRegistrasiGuru')?.addEventListener('click', function (e) {
    e.preventDefault();
    resetFormGuru();
  });

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearGuruFieldErrors();

      const nip = document.getElementById('guru-nip')?.value.trim();
      const nama = document.getElementById('guru-nama')?.value.trim();
      const email = document.getElementById('guru-email')?.value.trim();
      const status = document.getElementById('guru-status')?.value;

      let hasError = false;

      if (!nip) {
        showGuruFieldError('group-guru-nip', 'err-guru-nip', 'NIP tidak boleh kosong.');
        hasError = true;
      }
      if (!nama) {
        showGuruFieldError('group-guru-nama', 'err-guru-nama', 'Nama tidak boleh kosong.');
        hasError = true;
      }

      if (hasError) return;

      setRegistrasiGuruLoading(true);

      try {
        const result = await window.registerGuru({ nip, nama, email, status });
        if (result.success) {
          showGuruAlert(true, result.message);
          resetFormGuru();
          window.loadGuru();
        } else {
          if (result.errors && Array.isArray(result.errors)) {
            result.errors.forEach(function (msg) {
              if (msg.toLowerCase().includes('nip')) {
                showGuruFieldError('group-guru-nip', 'err-guru-nip', msg);
              } else if (msg.toLowerCase().includes('nama')) {
                showGuruFieldError('group-guru-nama', 'err-guru-nama', msg);
              }
            });
          }
          showGuruAlert(false, result.message || 'Pendaftaran gagal.');
        }
      } catch (err) {
        showGuruAlert(false, 'Tidak dapat terhubung ke server.');
      } finally {
        setRegistrasiGuruLoading(false);
      }
    });
  }

  window.loadGuru();
};
