// src/middlewares/auth.js
import jwt from 'jsonwebtoken';

const secret = 'tu_secreto'; // Cambia esto a una cadena secreta más compleja y manténla en un lugar seguro.

export const generateToken = (user) => {
    return jwt.sign({ id: user.id, nombre: user.nombre, rol: user.rol }, secret, {
        expiresIn: '1h', // Expira en 1 hora
    });
};

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ message: 'No se proporcionó un token.' });

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token no válido.' });

        req.user = decoded; // Guarda la información del usuario en la solicitud
        next();
    });
};
