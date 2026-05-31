const bcrypt = require("bcryptjs");
const db = require("./src/config/db");

const username = "admin";
const passwordPlain = "rahasia123"; // Password yang akan Anda ketik di form login
const role = "admin";

// Lakukan hashing pada password sebelum disimpan ke database
bcrypt.hash(passwordPlain, 10, (err, hash) => {
    if (err) {
        console.error("Gagal melakukan hash password:", err);
        process.exit(1);
    }

    db.query(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, role = ?",
        [username, hash, role, hash, role],
        (err, results) => {
            if (err) console.error("Gagal menambahkan user:", err.message);
            else
                console.log(
                    `[SUKSES] User '${username}' berhasil ditambahkan/diperbarui! Silakan login dengan password: '${passwordPlain}'`,
                );

            process.exit(0); // Matikan script setelah selesai
        },
    );
});
