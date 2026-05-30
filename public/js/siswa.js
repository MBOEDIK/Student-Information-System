const formPencarian = document.getElementById('formPencarian');
const inputKeyword = document.getElementById('inputKeyword');
const tabelSiswaBody = document.getElementById('tabelSiswaBody');

formPencarian.addEventListener('submit', function (event) {
    event.preventDefault();

    const keyword = inputKeyword.value.trim();
    aksiCariSiswa(keyword);
});

function aksiCariSiswa(keyword) {
    fetch(`/api/siswa/search?keyword=${encodeURIComponent(keyword)}`)
        .then(response => response.json())
        .then(responseJson => {
            tabelSiswaBody.innerHTML = '';

            if (!responseJson.success || responseJson.data.length === 0) {
                tabelSiswaBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-muted py-3 fw-bold">
                            ⚠️ Data siswa tidak ditemukan
                        </td>
                    </tr>
                `;
                return;
            }

            responseJson.data.forEach(siswa => {
                const barisHtml = `
                    <tr>
                        <td>${siswa.nis}</td>
                        <td>${siswa.nama}</td>
                        <td>${siswa.jenis_kelamin}</td>
                        <td>${siswa.alamat}</td>
                        <td>
                            <span class="badge ${siswa.status === 'aktif' ? 'bg-success' : 'bg-danger'}">
                                ${siswa.status}
                            </span>
                        </td>
                    </tr>
                `;
                tabelSiswaBody.insertAdjacentHTML('beforeend', barisHtml);
            });
        })
        .catch(error => {
            console.error('Terjadi kesalahan:', error);
            tabelSiswaBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger py-3">
                        Gagal memuat data. Pastikan server Express backend Anda menyala.
                    </td>
                </tr>
            `;
        });
}
