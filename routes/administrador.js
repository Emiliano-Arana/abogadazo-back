const express = require('express');
const router = express.Router();
const administradorController = require("../controllers/administradorController");

// Crear administrador (agente facultado)
router.post('/crear_administrador', administradorController.crearAdministrador);

// Editar administrador por placa
router.put('/editar_administrador/:placa', administradorController.editarAdministradorPorPlaca);

// Obtener datos de un administrador por placa
router.get('/datos_administrador/:placa', administradorController.obtenerDatosAdministrador);

// Obtener todos los administradores
router.get('/get_administradores', administradorController.obtenerAdministradores);

// Eliminar administrador por placa
router.delete('/delete_administrador/:placa', administradorController.eliminarAdministrador);

module.exports = router;
