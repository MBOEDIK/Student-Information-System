const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

const siswaRoutes = require('./routes/siswaRoutes');

app.use('/api/siswa', siswaRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
    console.log(`===================================================`);
    console.log(`🚀 Server Student Information System (SIS) Berjalan!`);
    console.log(`🔗 Akses API Pencarian: http://localhost:${port}/api/siswa/search`);
    console.log(`===================================================`);
});