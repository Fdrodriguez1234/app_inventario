import bcrypt from 'bcrypt';
import { Router } from "express";
import pool from "../database/database.js";

const router = Router();

// Get all usuarios
router.get("/usuarios", async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM usuarios");
        res.render('usuarios/usuarios', { usuarios: result });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err });
    }
});

// Mostrar el formulario de agregar usuario
router.get("/agregar_usuarios", (req, res) => {
    res.render('usuarios/agregar_usuarios'); 
});

// Agregar usuarios
router.post("/agregar_usuarios", async (req, res) => { // Asegúrate de que la ruta POST coincida
    try {
        const { nombre, correo, contrasena, rol } = req.body;

        // Validar campos requeridos
        if (!nombre || !correo || !contrasena || !rol) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        // Encriptar la contraseña
        const saltRounds = 10; // Número de rondas de salt
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        const newUsuario = {
            nombre,
            correo,
            contrasena: hashedPassword, // Almacenar la contraseña encriptada
            rol
        };

        // Inserta el nuevo usuario en la base de datos
        const [result] = await pool.query("INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)", 
            [newUsuario.nombre, newUsuario.correo, newUsuario.contrasena, newUsuario.rol]
        );

        res.redirect('/usuarios?message=Usuario creado exitosamente');

    } catch (error) {
        console.error(error);
        res.redirect('/usuarios?message=Error al crear el usuario');
    }
});

// Mostrar el formulario de editar usuario

router.get("/editar_usuarios/:id", async (req, res) => {
    const { id } = req.params;
    try {
        

        // Obtener el usuario por ID
        const [usuario] = await pool.query("SELECT * FROM usuarios WHERE id =?", [id]);
        if (usuario.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        res.render('usuarios/editar_usuarios', {usuario: usuario[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el usuario." });
    }
});



// Actualizar el usuario en la base de datos
router.post("/editar_usuarios/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, correo, contrasena, rol } = req.body;

    try {
        // Validar campos requeridos
        if (!nombre || !correo || !rol) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        // Preparar la consulta
        const values = [nombre, correo, rol, id];

        // Verificar si la contraseña se debe actualizar
        if (contrasena) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
            values.splice(2, 0, hashedPassword); // Insertar la contraseña en la posición correcta
            await pool.query("UPDATE usuarios SET nombre = ?, correo = ?, contrasena = ?, rol = ? WHERE id = ?", values);
        } else {
            await pool.query("UPDATE usuarios SET nombre = ?, correo = ?, rol = ? WHERE id = ?", values);
        }

        res.redirect('/usuarios?message=Usuario actualizado exitosamente');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
