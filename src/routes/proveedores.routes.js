import { Router } from "express";
import pool from "../database/database.js";

const router = Router();

// Mostrar Proveedores

router.get("/proveedores",  async (req, res) => {
    try {
        const [result] = await pool.query("SELECT * FROM proveedores");
        res.render('proveedores/proveedores', { proveedores: result });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err });
    }
});

// Mostrar el formulario de agregar proveedores
router.get("/agregar_proveedores", (req, res) => {
    res.render('proveedores/agregar_proveedores'); 
});


// Agregar proveedores

router.post("/agregar_proveedores", async (req, res) => {
    try {
        const { nombre, direccion, telefono, correo, estado } = req.body;

        // Validar campos requeridos
        if (!nombre || !direccion || !telefono || !correo || !estado) {
            return res.render('proveedores/agregar_proveedores', { errorMessage: 'Todos los campos son requeridos.' });
        }

        // Insertar en la base de datos
        await pool.query(
            "INSERT INTO proveedores (nombre, direccion, telefono, correo, estado) VALUES (?,?,?,?,?)",
            [nombre, 
             direccion, 
             telefono, 
             correo, 
             estado]
        );
        const [result] = await pool.query("SELECT * FROM proveedores");
        res.render('proveedores/proveedores' , { proveedores: result, message:'Proveedor creado exitosamente'});
    }catch (error) {
        console.error(error);
        return res.render('proveedores/agregar_proveedores', {errorMessage: 'Error al crear el proveedor'});
    }
});

// Eliminar proveedores

router.delete("/proveedores/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Eliminar de la base de datos
        const [deleteResult] = await pool.query("DELETE FROM proveedores WHERE id = ?", [id]);

        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        // Obtener lista de proveedores actualizada
        const [proveedores] = await pool.query("SELECT * FROM proveedores");

        // Enviar el mensaje de éxito y los proveedores actualizados
        return res.json({
            message: 'Proveedor eliminado exitosamente',
            proveedores
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el proveedor' });
    }
});

// Editar proveedores

router.get("/editar_proveedores/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener el proveedor a editar
        const [proveedor] = await pool.query("SELECT * FROM proveedores WHERE id =?", [id]);

        if (proveedor.length === 0) {
            return res.status(404).json({ message: 'Proveedor no encontrado' });
        }

        res.render('proveedores/editar_proveedores', { proveedor: proveedor[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el proveedor' });
    }
});

// Actualizar proveedores

router.post("/editar_proveedores/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, direccion, telefono, correo, estado } = req.body;

    try {
        // Validar campos requeridos
        if (!nombre ||!direccion ||!telefono ||!correo ||!estado) {
            return res.render('proveedores/editar_proveedores', { errorMessage: 'Todos los campos son requeridos.' });
        }

        // Actualizar en la base de datos
        await pool.query(
            "UPDATE proveedores SET nombre=?, direccion=?, telefono=?, correo=?, estado=? WHERE id=?",
            [nombre, 
             direccion, 
             telefono, 
             correo, 
             estado,
             id]
        );

        // Obtener lista de proveedores actual
        const [proveedores] = await pool.query("SELECT * FROM proveedores");
        res.render('proveedores/proveedores', { proveedores, message: 'Proveedor actualizado exitosamente' });
        
    } catch (error) {
        console.error(error);
        return res.render('proveedores/editar_proveedores', { errorMessage: 'Error al actualizar el proveedor' });
    }
});
export default router;