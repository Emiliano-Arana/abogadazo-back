const express = require('express');
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

// Ruta para crear usuario
router.post('/crear_usuario', usuarioController.crearUsuario);
// Ruta para editar usuario por nombre de usuario (PUT /api/usuarios/:usuario)
router.put('/editar_usuario/:usuario', usuarioController.editarUsuarioPorUsuario);
// Ruta para inicio de sesión (POST /api/login)
router.post('/login', usuarioController.login);
// Ruta para obtener datos de usuario por nombre de usuario (GET /api/usuarios/:usuario)
router.get('/datos_usuario/:usuario', usuarioController.obtenerDatosUsuario);
// Obtener todos los administradores
router.get('/get_administradores', usuarioController.obtenerAdministradores);
// Obtener todos los clientes
router.get('/get_clientes', usuarioController.obtenerClientes);
// Ruta para eliminar solo con usuario (DELETE /api/usuarios/:usuario)
router.delete('/delete_usuario/:usuario', usuarioController.eliminarUsuario);
// Ruta para eliminar con usuario y contraseña (DELETE /api/usuarios/:usuario/confirmar)
router.delete('/delete_usuario/:usuario/confirmar', usuarioController.eliminarUsuarioConPassword);


module.exports = router;