const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, UserRol, Rol, LoginAtt } = require('../models');
const authenticateToken = require('../middlewares/authenticateToken');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await Usuario.create({
            username,
            email,
            password_hash: hashedPassword,
            create_at: new Date(),
            update_at: new Date(),
            is_active: true,
            is_verified: true
        });

        res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const user = await Usuario.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        const loginDate = new Date();

        await LoginAtt.create({
            user_id: user.id,
            create_at: loginDate,
            is_successful: validPassword
        });

        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const userRole = await UserRol.findOne({
            where: { user_id: user.id },
            include: { model: Rol }
        });

        const payload = {
            id: user.id,
            email: user.email,
            role: userRole?.Rol || null
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: '1d'
        });
        let userID = user.id;
        res.status(200).json({ message: 'Inicio de sesión exitoso', token, userID });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

exports.consult = async (req, res) => {
    try {
        authenticateToken(req, res, async () => {
            const { id } = req.body;

          //  const roleCode = req.user?.role?.users_admin || '';
           // const permisosValidos = ["XX", "XR", "RU", "CR"];

          //  if (!permisosValidos.includes(roleCode)) {
            //    return res.status(403).json({ message: 'Acceso denegado' });
         //   }

            if (id) {
                const user = await Usuario.findOne({ where: { id, is_active: true } });
                return user
                    ? res.status(200).json({ message: 'Usuario encontrado', data: user })
                    : res.status(404).json({ message: 'Usuario no encontrado' });
            } else {
                const users = await Usuario.findAll({
                    where: { is_active: true },
                    attributes: ['id', 'username', 'email', 'is_verified']
                });
                return res.status(200).json({ message: 'Usuarios registrados', data: users });
            }
        });
    } catch (error) {
        console.error('Error al consultar usuarios:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

exports.update = async (req, res) => {
    try {
        const { id, username, email } = req.body;
        if (!id || !username || !email) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        const user = await Usuario.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        await user.update({ username, email, update_at: new Date() });

        res.status(200).json({ message: 'Usuario actualizado con éxito', data: user });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

exports.active = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await Usuario.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        await user.update({ is_active: true });
        res.status(200).json({ message: 'Usuario activado', data: user });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

exports.desactive = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await Usuario.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        await user.update({ is_active: false });
        res.status(200).json({ message: 'Usuario desactivado', data: user });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};

exports.verify = async (req, res) => {
    try {
        const { id } = req.body;
        const user = await Usuario.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        await user.update({ is_verified: true });
        res.status(200).json({ message: 'Usuario verificado', data: user });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};
