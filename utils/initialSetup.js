const Rol = require('../models/rolModel');
const User = require('../models/userModel');
const Pizzeria = require('../models/pizzeriaModel');
const UserRol = require('../models/user_rolModel');
const loginAtt = require('../models/loginAttModel');
const bcrypt = require('bcrypt');

const initialSetup = async () => {
    try {
        const [adminRole, userRole] = await Promise.all([
            Rol.create({ users_admin: 'XX', name: 'Admin', create_at: new Date(), update_at: new Date(), is_active: true }),
        ]);

        const password = await bcrypt.hash('Nuevoideal14@', 10);
        const adminUser = await User.create({
            username: 'admin',
            email: 'carlosvibot14@gmail.com',
            full_name: 'Administrador',
            phone:'4424754669',
            password_hash: password,
            create_at: new Date(),
            update_at: new Date(),
            is_active: true,
            is_verified: true
        });

        await UserRol.create({
            user_id: adminUser.id,
            rol_id: adminRole.id,
            create_at: new Date(),
            update_at: new Date(),
            is_active: true
        });


       await Pizzeria.create({
            nombre: 'PIZZERIA GIANCARLO',
            telefono: '0000000000',
            email_contacto: 'carlosvibot14@gmail.com',
            create_at: new Date(),
            update_at: new Date(),
            is_active: true
        });

        console.log('Configuración inicial completada.');
    } catch (error) {
        console.error('Error en la configuración inicial:', error);
        throw error;
    }
};

module.exports = initialSetup;