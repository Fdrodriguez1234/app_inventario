import { Router } from "express";
import pool from "../database/database.js";

const router = Router();

// Ruta para obtener todos los productos con el nombre de la categoría y proveedor
router.get("/productos", async (req, res) => {
    try {
        const [productos] = await pool.query(`
            SELECT 
                productos.id,
                productos.nombre,
                productos.descripcion,
                categorias.nombre AS categoria_nombre,
                productos.codigo_barras,
                productos.sku,
                proveedores.nombre AS proveedor_nombre,
                productos.costo_unitario,
                productos.precio_venta,
                productos.unidad_medida,
                productos.stock
            FROM productos
            JOIN categorias ON productos.categorias_id = categorias.id
            JOIN proveedores ON productos.proveedor_id = proveedores.id
        `);

        const message = req.query.message || null;


        res.render('productos/productos', { productos, message });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: err.message });
    }
});

// Mostrar formulario para agregar un producto con categorías y proveedores
router.get("/agregar_productos", async (req, res) => {
    try {
        // Obtener categorías y proveedores de la base de datos
        const [categorias] = await pool.query("SELECT * FROM categorias");
        const [proveedores] = await pool.query("SELECT * FROM proveedores");

        // Renderizar la vista y pasar las categorías y proveedores
        res.render("productos/agregar_productos", { categorias, proveedores });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Error al cargar las categorías o proveedores" });
    }
});

// Agregar un producto
router.post("/agregar_productos", async (req, res) => {
    try {
        const { 
            nombre, 
            descripcion, 
            categorias_id, 
            codigo_barras, 
            sku, 
            proveedor_id, 
            costo_unitario, 
            precio_venta, 
            unidad_medida,
            stock 
        } = req.body;

        // Validar campos requeridos
        if (!nombre || !descripcion || !categorias_id || !codigo_barras || !sku || !proveedor_id || !costo_unitario || !precio_venta || !unidad_medida || !stock) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        // Crear el nuevo producto
        const newProducto = {
            nombre,
            descripcion,
            categorias_id,
            codigo_barras,
            sku,
            proveedor_id,
            costo_unitario,
            precio_venta,
            unidad_medida,
            stock
        };

        // Inserta el nuevo producto en la base de datos
        const [result] = await pool.query(
            "INSERT INTO productos (nombre, descripcion, categorias_id, codigo_barras, sku, proveedor_id, costo_unitario, precio_venta, unidad_medida, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [
                newProducto.nombre,
                newProducto.descripcion, 
                newProducto.categorias_id, 
                newProducto.codigo_barras, 
                newProducto.sku, 
                newProducto.proveedor_id, 
                newProducto.costo_unitario, 
                newProducto.precio_venta, 
                newProducto.unidad_medida,
                newProducto.stock
            ]
        );

        // Redirigir a la página de lista de productos
        res.redirect("/productos"); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


// Mostrar formulario para editar un producto

router.get("/editar_productos/:id", async (req, res) => {
    const { id } = req.params;
    try {

        // Obtener el producto por ID
        const [producto] = await pool.query("SELECT * FROM productos WHERE id =?", [id]);

        // Obtener categorías y proveedores de la base de datos
        const [categorias] = await pool.query("SELECT * FROM categorias");
        const [proveedores] = await pool.query("SELECT * FROM proveedores");

        // Renderizar la vista y pasar el producto, las categorías y proveedores
        res.render("productos/editar_productos", { 
            producto: producto[0], 
            categorias, 
            proveedores,
            
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: error.message });
    }
});

// Actualizar un producto

router.post('/editar_productos/:id', async (req, res) => {
    try {
        const { 
            nombre, 
            descripcion, 
            categorias_id, 
            codigo_barras, 
            sku, 
            proveedor_id, 
            costo_unitario, 
            precio_venta, 
            unidad_medida, 
            stock 
        } = req.body;

        const productoId = req.params.id; // Obtenemos el ID del producto desde la URL

        await pool.query(`
            UPDATE productos 
            SET 
                nombre = ?, 
                descripcion = ?, 
                categorias_id = ?, 
                codigo_barras = ?, 
                sku = ?, 
                proveedor_id = ?, 
                costo_unitario = ?, 
                precio_venta = ?, 
                unidad_medida = ?, 
                stock = ? 
            WHERE id = ?`, 
            [
                nombre, 
                descripcion, 
                categorias_id, 
                codigo_barras, 
                sku, 
                proveedor_id, 
                costo_unitario, 
                precio_venta, 
                unidad_medida, 
                stock, 
                productoId // Añadimos el ID del producto al final
            ]
        );

        // Redirigir o enviar un mensaje de éxito
        res.redirect('/productos?message=Producto actualizado exitosamente.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al actualizar el producto');
    }
});


// Eliminar un producto

router.delete('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [ deleteResultado ] = await pool.query('DELETE FROM productos WHERE id =?', [id]);

        if (deleteResultado.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });

        }

        const [productos] = await pool.query("SELECT * FROM productos");
        return res.json({ 
            message: 'Producto eliminado exitosamente',
            productos  
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el producto');
    }
});
export default router;
