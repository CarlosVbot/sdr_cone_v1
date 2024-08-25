const bcrypt = require('bcrypt');
const userModel = require('../models/authModel.js');

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
        const newUser = await userModel.createUser(username, email, hashedPassword,date,date,false,false);

        res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ message: 'Ocurrió un error en el servidor' });
    }
};
