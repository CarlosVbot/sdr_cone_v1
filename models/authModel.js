const pool = require('../config/database');

const getUserByEmail = async (email) => {
    const result_email = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    console.log(email)
    return result_email.rows;
};

const consultUsers = async () => {
    const result_User = await pool.query('SELECT id,username,email,is_verified FROM usuarios WHERE is_active = true');
    return result_User.rows;
};

const consultUser = async (id) => {
    try {
        const result_User = await pool.query(
            'SELECT id, username, email, is_verified FROM usuarios WHERE id = $1 AND is_active = true',
            [id]
        );
        if (result_User.rows.length === 0) {
            return null;
        }
        return result_User.rows[0];
    } catch (error) {
        throw error;
    }
};

const createUser = async (username, email, password_hash,create_at,update_at,is_active,is_verified) => {
    const result = await pool.query(
        'INSERT INTO usuarios (username, email, password_hash,create_at,update_at,is_active,is_verified) VALUES ($1, $2, $3 ,$4 ,$5 ,$6 ,$7 ) RETURNING *',
        [username, email, password_hash,create_at,update_at,is_active,is_verified]
    );
    return result.rows[0];
};

const UpdateUser = async (id, username, email, update_at) => {
    const result = await pool.query(
        'UPDATE usuarios SET username = $2, email = $3,update_at = $4 WHERE id = $1 RETURNING *',
        [id, username, email,update_at]
    );
    return result.rows[0];
};

const ActiveUser = async (id) => {
    const result = await pool.query(
        'UPDATE usuarios SET is_active = true WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

const DesctiveUser = async (id) => {
    const result = await pool.query(
        'UPDATE usuarios SET is_active = false WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

const VerifyUser = async (id) => {
    const result = await pool.query(
        'UPDATE usuarios SET is_verified = true WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

const LoginUser = async (email) => {
    const result = await pool.query(
        'SELECT id, password_hash FROM usuarios WHERE email = $1',
        [email]
    );
    return result.rows[0];
};

const LoginAttemp = async (userId,date,is_successful) => {
    const result = await pool.query(
        'INSERT INTO login_attempts (user_id, create_at, is_successful) VALUES ($1, $2 ,$3) RETURNING *',
        [userId,date,is_successful]
    );
    return result.rows[0];
}

const getRoleUser = async (userId) => {
    const result = await pool.query(
        'SELECT ur.id AS user_role_id, ur.user_id, ur.rol_id, r.users_admin FROM user_rols ur JOIN roles r ON ur.rol_id = r.id WHERE ur.user_id = $1',
        [userId]
    );
    return result.rows[0];
}

module.exports = {
    getUserByEmail,
    createUser,
    consultUsers,
    consultUser,
    UpdateUser,
    ActiveUser,
    DesctiveUser,
    VerifyUser,
    LoginUser,
    LoginAttemp,
    getRoleUser
};
