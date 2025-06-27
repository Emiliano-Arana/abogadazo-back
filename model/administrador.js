module.exports = {
    obtenerAdministradores: function(conexion, callback) {
        conexion.query("SELECT * FROM agentes_facultados", (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    existeAdministrador: function(conexion, placa, callback) {
        conexion.query("SELECT * FROM agentes_facultados WHERE placa = ?", [placa], (err, resultados) => {
            if (err) return callback(err);
            callback(null, resultados.length > 0);
        });
    },

    crearAdministrador: function(conexion, datos, callback) {
        conexion.query("INSERT INTO agentes_facultados SET ?", datos, (err, resultados) => {
            if (err) return callback(err);
            callback(null, resultados);
        });
    },

    obtenerPorPlaca: function(conexion, placa, callback) {
        conexion.query("SELECT * FROM agentes_facultados WHERE placa = ?", [placa], (err, resultados) => {
            if (err) return callback(err);
            callback(null, resultados[0]);
        });
    },

    existeOtraPlaca: function(conexion, placaActual, nuevaPlaca, callback) {
        conexion.query("SELECT * FROM agentes_facultados WHERE placa = ? AND placa != ?", [nuevaPlaca, placaActual], (err, resultados) => {
            if (err) return callback(err);
            callback(null, resultados.length > 0);
        });
    },

    actualizarAdministradorPorPlaca: function(conexion, placaActual, datos, callback) {
        conexion.query("UPDATE agentes_facultados SET ? WHERE placa = ?", [datos, placaActual], (err, resultado) => {
            if (err) return callback(err);
            callback(null, resultado);
        });
    },

    eliminarPorPlaca: function(conexion, placa, callback) {
        conexion.query("DELETE FROM agentes_facultados WHERE placa = ?", [placa], (err, resultado) => {
            if (err) return callback(err);
            callback(null, resultado.affectedRows);
        });
    }
};
