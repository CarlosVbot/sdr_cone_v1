const pool = require('../config/database');
const getUserByEmail = async (email) => {
    const result_email = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    console.log(email)
    return result_email.rows;
};
const createUser = async (username, email, password_hash,create_at,update_at,is_active,is_verified) => {
    const result = await pool.query(
        'INSERT INTO usuarios (username, email, password_hash,create_at,update_at,is_active,is_verified) VALUES ($1, $2, $3 ,$4 ,$5 ,$6 ,$7 ) RETURNING *',
        [username, email, password_hash,create_at,update_at,is_active,is_verified]
    );
    return result.rows[0];
};

module.exports = {
    getUserByEmail,
    createUser,
};
