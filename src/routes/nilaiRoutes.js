const router = require('express').Router();
const nilaiCtrl = require('../controllers/nilaiController');

router.get('/mapel-guru', nilaiCtrl.getMapelGuru);
router.get('/siswa-by-mapel', nilaiCtrl.getSiswaByMapel);
router.post('/batch', nilaiCtrl.saveNilaiBatch);
router.put('/:id', nilaiCtrl.updateNilai);

module.exports = router;
