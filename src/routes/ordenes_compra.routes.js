import { Router } from 'express';
import pool from "../database/database.js";

const router = Router();
// Ruta para mostrar la lista de órdenes de compra
router.get('/', async (req, res) => {
    try {
        const [ordenes] = await pool.query('SELECT * FROM ordenes_compra');
        res.render('ordenes_compra/ordenes_compra', { ordenes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener las órdenes de compra');
    }
});
router.get('/agregar_orden', async (req, res) => {
    try {
        const [proveedores] = await pool.query('SELECT * FROM proveedores');
        const [productos] = await pool.query('SELECT * FROM productos');

        console.log(proveedores); // Verifica los datos de proveedores en la consola

        res.render('ordenes_compra/agregar_orden', { 
            proveedores, 
            productos });
    } catch (error) {
        console.error('Error al obtener proveedores y productos:', error);
        res.render('ordenes_compra/agregar_orden', { proveedores: [], productos: [], message: 'Error al cargar los datos' });
    }
});


// Ruta para procesar la creación de una nueva orden de compra
router.post('/agregar_orden', async (req, res) => {
    try {
        const { proveedorId, productoId, cantidad, precioUnitario } = req.body;

        if (!proveedorId || !productoId || !cantidad || !precioUnitario) {
            return res.status(400).send('Faltan datos obligatorios.');
        }

        await pool.query(`INSERT INTO ordenes_compra (proveedor_id, producto_id, cantidad, precio_unitario, estado) VALUES (?, ?, ?, ?, 'Pendiente')`, 
            [proveedorId, productoId, cantidad, precioUnitario]);

        res.redirect('/ordenes_compra?message=Orden de compra agregada correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agregar la orden de compra');
    }
});


// Ruta para mostrar el formulario de editar orden de compra
router.get('/editar_orden/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [orden] = await pool.query('SELECT * FROM ordenes_compra WHERE id = ?', [id]);
        res.render('ordenes_compra/editar_orden', { orden: orden[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener la orden de compra');
    }
});

// Ruta para procesar la edición de una orden de compra
router.post('/editar_orden/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { proveedorId, productoId, cantidad, precioUnitario } = req.body;

        if (!proveedorId || !productoId || !cantidad || !precioUnitario) {
            return res.status(400).send('Faltan datos obligatorios.');
        }

        await pool.query(`UPDATE ordenes_compra SET proveedor_id = ?, producto_id = ?, cantidad = ?, precio_unitario = ? WHERE id = ?`, 
            [proveedorId, productoId, cantidad, precioUnitario, id]);

        res.redirect('/ordenes_compra?message=Orden de compra actualizada correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al editar la orden de compra');
    }
});

// Ruta para eliminar una orden de compra
router.post('/eliminar_orden/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM ordenes_compra WHERE id = ?', [id]);
        res.redirect('/ordenes_compra?message=Orden de compra eliminada correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar la orden de compra');
    }
});


export default router;
