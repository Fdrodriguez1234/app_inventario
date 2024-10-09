import { Router } from "express";
import pool from "../database/database.js";

const router = Router();

// Mostrar todas las categorías
router.get("/categorias", async (req, res) => {
    try {
        const [categorias] = await pool.query(`
            SELECT
                c.id,
                c.nombre,
                c.descripcion,
                COALESCE(p.nombre, 'Sin categoría padre') AS categoria_padre
            FROM
                categorias c
            LEFT JOIN
                categorias p ON c.idPadre = p.id
            
        `);
        res.render("categorias/categorias", { categorias });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

// Mostrar el formulario para agregar una categoría
router.get("/agregar_categorias", async (req, res) => {
    try {
        const [categorias] = await pool.query('SELECT * FROM categorias');
        res.render("categorias/agregar_categorias", {
          categorias
        });  
    } catch (err) {
        console.error(err);
        res.status(500).json('Hay un error en la categoría');
    }
    
});

// Agregar una categoría
router.post("/agregar_categorias", async (req, res) => {
    try {
        const { nombre, descripcion, idPadre } = req.body;

        // Validar campos requeridos
        if (!nombre) {
            return res.status(400).json({ message: "El nombre es obligatorio." });
        }

        // Crear la nueva categoría
        const newCategoria = {
            nombre,
            descripcion,
            idPadre: idPadre || null // Si no se proporciona, se establece como null
        };

        // Inserta la nueva categoría en la base de datos
        const [result] = await pool.query(
            "INSERT INTO categorias (nombre, descripcion, idPadre) VALUES (?, ?, ?)",
            [newCategoria.nombre, 
             newCategoria.descripcion, 
             newCategoria.idPadre]
        );
        
        res.redirect('/categorias');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Mostrar el formulario para editar una categoría

router.get("/editar_categorias/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [categoria] = await pool.query("SELECT * FROM categorias WHERE id =?", [id]);

        const [categorias] = await pool.query("SELECT * FROM categorias ");

        res.render("categorias/editar_categorias",{
            categoriaActual: categoria[0],
            categorias
        })
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

// Editar una categoría

router.post('/editar_categorias/:id', async (req, res) => {
    try {
        const { nombre, descripcion, idPadre } = req.body;
        const idCategoria = req.params.id;

        if (!nombre || !idCategoria) {
            // Si falta el nombre o la categoría no se encuentra, devolvemos un error
            return res.status(400).send('Faltan datos obligatorios para actualizar la categoría.');
        }

        // Consulta para actualizar la categoría
        await pool.query(`
            UPDATE categorias
            SET 
               nombre = ?,
               descripcion = ?,
               idPadre = ?
            WHERE id = ?`,
            [
                nombre, 
                descripcion, 
                idPadre || null,  // idPadre puede ser null si no tiene categoría padre
                idCategoria
            ]
        );

        // Redirigir con un mensaje de éxito en la URL
        res.redirect('/categorias?message=Categoria%20actualizada%20correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar la categoría');
    }
});

export default router;
