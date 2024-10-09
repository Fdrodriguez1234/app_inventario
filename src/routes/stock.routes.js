import { Router } from "express";
import pool from "../database/database.js";

// rutas

const router = Router();

router.get("/stock", async (req, res) => {
    try {
        const [stocks] = await pool.query(`
            SELECT 
                p.nombre AS producto,
                c.nombre AS categoria,
                p.stock AS stock_disponible, 
                s.cantidad AS movimiento_stock,
                s.stock_minimo,
                s.tipo_movimiento
            FROM stock s
            JOIN productos p ON s.productos_id = p.id
            JOIN categorias c ON p.categorias_id = c.id; -- Aquí corregí el join de proveedor_id a categorias_id
        `); 
        res.render('stock/stock', { stocks }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener el inventario');
    }
});

router.get('/entrada_stock', async (req, res) => {
    try {
        const [productos] = await pool.query('SELECT id, nombre FROM productos'); // Obtener productos disponibles
        res.render('stock/entrada_stock', { productos }); // Renderiza la vista y pasa los productos
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});

// POST - Registrar entrada/salida de stock
router.post('/entrada_stock', async (req, res) => {
    const conn = await pool.getConnection(); // Para manejar transacciones
    await conn.beginTransaction(); // Inicia la transacción

    try {
        const { productos_id, cantidad, stock_minimo, tipo_movimiento } = req.body;

        // Validación de stock disponible para movimiento de salida
        if (tipo_movimiento === 'salida') {
            const [[{ stock }]] = await conn.query('SELECT stock FROM productos WHERE id = ?', [productos_id]);

            // Si el stock actual es menor a la cantidad que se desea sacar, lanzar un error
            if (stock < cantidad) {
                return res.render('stock/entrada_stock', { productos: [], message: 'No hay suficiente stock para realizar la salida.' });
            }
        }

        // Inserta el movimiento de stock
        await conn.query('INSERT INTO stock (productos_id, cantidad, stock_minimo, tipo_movimiento) VALUES (?, ?, ?, ?)', [
            productos_id,
            cantidad,
            stock_minimo,
            tipo_movimiento
        ]);

        // Actualizar el stock en la tabla productos
        if (tipo_movimiento === 'entrada') {
            await conn.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [cantidad, productos_id]);
        } else if (tipo_movimiento === 'salida') {
            await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, productos_id]);
        }

        await conn.commit(); // Confirma la transacción
        res.redirect('/stock'); // Redirige a la página de stock

    } catch (error) {
        await conn.rollback(); // Si hay un error, deshacer los cambios
        console.error(error);
        res.status(500).send('Error en el servidor');
    } finally {
        conn.release(); // Liberar la conexión
    }
});

export default router;