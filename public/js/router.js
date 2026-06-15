'use strict';

const menuAccessRule = {
  home: ['admin', 'guru'],
  pendaftaran: ['admin'],
  jadwal: ['admin', 'guru', 'siswa'],
  absensi: ['admin', 'guru'],
  kesehatan: ['admin'],
  konseling: ['admin', 'guru'],
  nilai: ['admin', 'guru', 'siswa'],
  siswa: ['admin', 'guru'],
  guru: ['admin']
};

const router = {
  currentPage: null,

  async navigate(pageName) {
    if (this.currentPage === pageName) return;

    if (menuAccessRule[pageName] && !menuAccessRule[pageName].includes(window.currentUser?.role)) {
      alert('Akses Ditolak: Anda tidak memiliki wewenang membuka fitur ini!');
      return;
    }

    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${pageName}"]`)?.classList.add('active');

    const container = document.getElementById('page-container');
    if (!container) return;

    try {
      const res = await fetch(`/pages/${pageName}.html`);
      if (!res.ok) throw new Error('Halaman tidak ditemukan');
      container.innerHTML = await res.text();
      this.currentPage = pageName;

      if (window[`page_${pageName}_init`]) {
        window[`page_${pageName}_init`]();
      }

      document.getElementById('sidebar')?.classList.remove('open');
    } catch (e) {
      container.innerHTML = `<div class="page active"><div class="page-header"><h1>${pageName}</h1></div><p style="color:var(--text-muted);">Konten belum tersedia.</p></div>`;
      this.currentPage = pageName;
    }
  },

  init() {
    document.querySelectorAll('.nav-item[data-page]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(link.dataset.page);
      });
    });

    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
    });

    if (window.currentUser?.role === 'siswa') {
      const firstAllowed = document.querySelector(
        '.nav-item[data-page]:not([style*="display: none"])'
      );
      if (firstAllowed) {
        this.navigate(firstAllowed.dataset.page);
      }
    } else {
      this.navigate('home');
    }
  }
};

window.page_home_init = function () {
  window.loadStats();
};

window.loadStats = async function () {
  try {
    const [rSiswa, rGuru] = await Promise.all([
      fetch('/api/siswa/stats').then((r) => r.json()),
      fetch('/api/guru/stats').then((r) => r.json())
    ]);
    if (rSiswa.success) {
      setText('statTotalSiswa', rSiswa.data.total);
      setText('statAktifSiswa', rSiswa.data.aktif);
    }
    if (rGuru.success) {
      setText('statTotalGuru', rGuru.data.total);
      setText('statAktifGuru', rGuru.data.aktif);
    }
  } catch (e) {
    console.error('Gagal memuat statistik dasbor:', e);
  }
};
