// src/routes/auth.routes.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../database/database.js';
import { generateToken } from '../middlewares/auth.js';

const router = Router();

// Registro

router.get('/registro', (req, res) => {
    res.render('registro');
});

// Logueo

router.get('/logueo', (req, res) => {
    res.render('logueo');
});

// welcome

router.get('/welcome', (req, res) => {
    res.render('welcome');
});



// Registro del usuario en la base de datos

router.post('/registro', async (req, res) => {
    const { nombre, correo, contrasena, rol } = req.body;
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    try {
        const [result] = await pool.query('INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)', 
            [nombre, correo, hashedPassword, rol]);
        
        const token = generateToken({ id: result.insertId, nombre, rol });
        res.render('welcome');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// src/routes/auth.routes.js
router.post('/logueo', async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const [user] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

        if (user.length === 0) {
            return res.render('logueo', { errorMessage: 'Correo o contraseña incorrectos.' });
        }

        const isPasswordValid = await bcrypt.compare(contrasena, user[0].contrasena);
        if (!isPasswordValid) {
            return res.render('logueo', { errorMessage: 'Correo o contraseña incorrectos.' });
        }

        const token = generateToken(user[0]);
        res.redirect('welcome'); // Redirige al usuario si las credenciales son correctas
    } catch (error) {
        res.status(500).render('logueo', { errorMessage: 'Error en el servidor. Inténtalo de nuevo.' });
    }
});


export default router;