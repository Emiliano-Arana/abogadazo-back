var conexion = require('../config/conexion');
var administradorModel = require("../model/administrador");

module.exports = {
    crearAdministrador: function(req, res) {
        const { placa, nombre } = req.body;

        if (!placa || !nombre) {
            return res.status(400).json({
                error: true,
                message: "Los campos 'placa' y 'nombre' son obligatorios"
            });
        }

        administradorModel.existeAdministrador(conexion, placa, (err, existe) => {
            if (err) return res.status(500).json({ error: true, message: err.message });
            if (existe) return res.status(409).json({ error: true, message: "La placa ya está registrada" });

            administradorModel.crearAdministrador(conexion, { placa, nombre }, (err, resultado) => {
                if (err) return res.status(500).json({ error: true, message: err.message });
                res.status(201).json({
                    error: false,
                    message: "Administrador creado exitosamente",
                    administradorId: resultado.insertId
                });
            });
        });
    },

    editarAdministradorPorPlaca: function(req, res) {
        const placaActual = req.params.placa;
        const { placa: nuevaPlaca, nombre } = req.body;

        if (!nuevaPlaca || !nombre) {
            return res.status(400).json({
                error: true,
                message: "Los campos 'placa' y 'nombre' son obligatorios"
            });
        }

        administradorModel.obtenerPorPlaca(conexion, placaActual, (err, adminExistente) => {
            if (err) return res.status(500).json({ error: true, message: err.message });
            if (!adminExistente) return res.status(404).json({ error: true, message: "Administrador no encontrado" });

            administradorModel.existeOtraPlaca(conexion, placaActual, nuevaPlaca, (err, existe) => {
                if (err) return res.status(500).json({ error: true, message: err.message });
                if (existe) return res.status(409).json({ error: true, message: "La nueva placa ya está registrada en otra cuenta" });

                administradorModel.actualizarAdministradorPorPlaca(conexion, placaActual, { placa: nuevaPlaca, nombre }, (err, resultado) => {
                    if (err) return res.status(500).json({ error: true, message: err.message });
                    if (resultado.affectedRows === 0) return res.status(404).json({ error: true, message: "No se realizaron cambios" });

                    res.status(200).json({
                        error: false,
                        message: "Administrador actualizado exitosamente",
                        placaAnterior: placaActual,
                        placaActualizada: nuevaPlaca
                    });
                });
            });
        });
    },

    obtenerDatosAdministrador: function(req, res) {
        const placa = req.params.placa;

        administradorModel.obtenerPorPlaca(conexion, placa, (err, admin) => {
            if (err) return res.status(500).json({ error: true, message: err.message });
            if (!admin) return res.status(404).json({ error: true, message: "Administrador no encontrado" });

            res.status(200).json({
                error: false,
                message: "Administrador encontrado",
                administrador: admin
            });
        });
    },

    obtenerAdministradores: function(req, res) {
        administradorModel.obtenerAdministradores(conexion, (err, administradores) => {
            if (err) return res.status(500).json({ error: true, message: err.message });
            res.status(200).json({
                error: false,
                message: "Administradores obtenidos exitosamente",
                total: administradores.length,
                administradores
            });
        });
    },

    eliminarAdministrador: function(req, res) {
        const placa = req.params.placa;

        administradorModel.eliminarPorPlaca(conexion, placa, (err, affectedRows) => {
            if (err) return res.status(500).json({ error: true, message: err.message });
            if (affectedRows === 0) return res.status(404).json({ error: true, message: "Administrador no encontrado" });

            res.status(200).json({
                error: false,
                message: "Administrador eliminado exitosamente",
                placa
            });
        });
    }
};
