import express from 'express';
import morgan from 'morgan';
import {join, dirname} from 'path';
import { fileURLToPath } from 'url';
import usuariosRoutes from './routes/usuarios.routes.js';
import productoRoutes from './routes/productos.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import proveedoresRoutes from './routes/proveedores.routes.js';
import authRoutes from './routes/auth.routes.js';
import stockRoutes from './routes/stock.routes.js';
import ordenesCompraRoutes  from './routes/ordenes_compra.routes.js';


// inicializacion
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
// configuracion

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
// midellware
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// rutas

// Homepage
app.get('/', (req, res) =>{
    res.render('index');
});

// Rutas de usuarios

app.use('/', usuariosRoutes);
app.use('/usuarios', usuariosRoutes);

// archivos publicos
app.use(express.static(join(__dirname, 'public')));

// Rutas de productos 

app.use('/', productoRoutes);
app.use('/productos', productoRoutes);

// Rutas de Categorias 

app.use('/', categoriasRoutes);
app.use('/categorias', categoriasRoutes);

// Rutas de Proveedores

app.use('/', proveedoresRoutes);
app.use('/proveedores', proveedoresRoutes);

//Rutas de autenticaciones

app.use('/', authRoutes);
app.use('/auth', authRoutes);

// Rutas de Stock

app.use('/', stockRoutes);
app.use('/stock', stockRoutes);

// Rutas de Ordenes de Compra

app.use('/', ordenesCompraRoutes);
app.use('/ordenes_compra', ordenesCompraRoutes);

 // Error 404
// ejecutar el servidor conectado con la base de datos 

app.listen(app.get('port'), () => {
    console.log('Servidor corriendo en el puerto ', app.get('port'));
});

