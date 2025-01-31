const bcrypt = require('bcrypt');
const userModel = require('../models/authModel.js');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const authenticateToken = require('../middlewares/authenticateToken');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const userExists = await userModel.getUserByEmail(email);
        console.log(userExists);
        if (userExists.length > 0) {
            return res.status(201).json({ message: 'El email ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let date = new Date();
        const newUser = await userModel.createUser(
            username,
            email,
            hashedPassword,
            date,
            date,
            false,
            false);

        res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Ocurrió un error en el servidor' });
    }
};

exports.consult = async (req, res) => {
    try {
        authenticateToken(req, res, async () => {
            const { id } = req.body;

            const userRole = req.user.role;
            const valoresValidos = ["XX", "XR", "RU", "CR"];
            const tipoValido = validarTipo(valoresValidos, userRole.users_admin);
            console.log(tipoValido);
            if (!tipoValido) {
                return res.status(403).json({ message: 'Acceso denegado: No tienes permisos suficientes.' });
            }

            if (!id) {
                const users = await userModel.consultUsers();
                if (users.length == 0) {
                    return res.status(201).json({ message: 'No hay datos registrados' });
                }
                res.status(201).json({ message: 'Usuarios Registrados', Data: users });
            } else {
                const user = await userModel.consultUser(id);
                if (!user) {
                    return res.status(201).json({ message: 'Usuario no encontrado' });
                }
                res.status(201).json({ message: 'Usuario encontrado', Data: user });
            }
        });
    } catch (error) {
        console.error('Error al consultar usuarios:', error);
        res.status(500).json({ message: 'Ocurrió un error en el servidor' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id, username, email } = req.body;
        if (!id || !username || !email) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        let date = new Date();
        const user = await userModel.UpdateUser(id, username, email, date);
        res.status(201).json({ message: 'Usuario actualizado con éxito', Data: user });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        res.status(500).json({ message: 'Ocurrió un error en el servidor' });
    }
}

exports.active = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        const user = await userModel.ActiveUser(id);
        res.status(201).json({ message: 'Usuario activado con éxito', Data: user });
    } catch (error) {
        console.error('Error al activar el usuario:', error);
        res.status(500).json({ message: 'Ocurrió un error en el servidor' });
    }
}

exports.desactive = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        const user = await userModel.DesctiveUser(id);
        res.status(201).json({ message: 'Usuario activado con éxito', Data: user });
    } catch (error) {
        console.error('Error al activar el usuario:', error);
        res.status(500).json({ message: 'Ocurrió un error en el servidor' });
    }
}

exports.verify = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        const user = await userModel.VerifyUser(id);
        res.status(201).json({ message: 'Usuario activado con éxito', Data: user });
    } catch (error) {
        console.error('Error al activar el usuario:', error);
        res.status(500).json({ message: 'Ocurrió un error en el servidor' });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        const user = await userModel.LoginUser(email);
        const comparePassword = await bcrypt.compare(password, user.password_hash);
        let date = new Date();
        if (!comparePassword) {
            await userModel.LoginAttemp(user.id,date, false);
            return res.status(201).json({ message: 'El email no está registrado.' });
        }

        await userModel.LoginAttemp(user.id, date,true);
        let role = await userModel.getRoleUser(user.id);
        let payload = {
            id: user.id,
            email: email,
            role: role
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: 60 * 60 * 24
        });

        res.status(201).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Ocurrió un error en el servidor' });
    }
};

function validarTipo(valoresValidos,users_admin) {
    return valoresValidos.includes(users_admin);
}