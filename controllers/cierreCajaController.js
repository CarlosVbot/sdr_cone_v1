// controllers/cierreCajaController.js
const { Op, fn, col } = require('sequelize');
const sequelize = require('../config/sequelizer'); // el mismo que usas en tus modelos
const { Pedido, CierreCaja } = require('../models'); // tu index.js exporta modelos
const authenticateToken = require('../middlewares/authenticateToken');
const { DateTime } = require("luxon");
const STATUS_CANCELADO = 'CANCELADO'; // si en tu sistema el cancelado se llama distinto, cámbialo aquí

function toNum(val) {
    // DECIMAL en Sequelize suele venir como string
    const n = Number(val || 0);
    return Number.isFinite(n) ? n : 0;
}

function toMoney(val) {
    return Number(toNum(val).toFixed(2));
}

function getRangoFechas(desde, hasta) {
    // si son iguales, extendemos "hasta" + 1 día
    if (desde === hasta) {
        console.log("Extendiendo rango de fechas en 1 día porque son iguales");
        const d = new Date(hasta + "T00:00:00");
        d.setDate(d.getDate() + 1);
        hasta = d.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    const inicio = new Date(desde);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(hasta);
    fin.setHours(23, 59, 59, 999);

    return [inicio, fin];
}

async function calcularResumen(pizzeria_id, desde, hasta) {
    const [inicio, fin] = getRangoFechas(desde, hasta);

    const baseWhere = {
        pizzeria_id,
        is_active: true,
        create_at: { [Op.between]: [inicio, fin] } // create_at existe en tu Pedido :contentReference[oaicite:2]{index=2}
    };
    const STATUS_ENTREGADO = 'ENTREGADO';
    const STATUS_CANCELADO = 'CANCELADO';
    // Vendidos = todo lo que NO esté cancelado (ajusta si quieres filtrar solo LISTO/ENTREGADO)
    const vendidosAgg = await Pedido.findOne({

        where: { ...baseWhere, status: STATUS_ENTREGADO },

// Cancelados
        where: { ...baseWhere, status: STATUS_CANCELADO },

// Métodos de pago (solo entregados)
        where: { ...baseWhere, status: STATUS_ENTREGADO },
        attributes: [
            [fn('COUNT', col('id')), 'cantidad'],
            [fn('COALESCE', fn('SUM', col('total')), 0), 'importe'] // total existe :contentReference[oaicite:4]{index=4}
        ],
        raw: true
    });

    const canceladosAgg = await Pedido.findOne({
        where: { ...baseWhere, status: STATUS_CANCELADO },
        attributes: [
            [fn('COUNT', col('id')), 'cantidad'],
            [fn('COALESCE', fn('SUM', col('total')), 0), 'importe']
        ],
        raw: true
    });

    // Desglose por método de pago SOLO vendidos (metodo_pago existe :contentReference[oaicite:5]{index=5})
    const metodosRows = await Pedido.findAll({
        where: { ...baseWhere, status: { [Op.ne]: STATUS_CANCELADO } },
        attributes: [
            'metodo_pago',
            [fn('COALESCE', fn('SUM', col('total')), 0), 'importe']
        ],
        group: ['metodo_pago'],
        raw: true
    });

    const metodos = {};
    for (const r of metodosRows) {
        const key = (r.metodo_pago || 'SIN_METODO').toString();
        metodos[key] = toMoney(r.importe);
    }

    const total_vendido = toMoney(vendidosAgg?.importe);
    const total_cancelado = toMoney(canceladosAgg?.importe);
    const total_neto = toMoney(total_vendido - total_cancelado);

    const efectivo_teorico = toMoney(metodos['EFECTIVO'] || 0);

    const kpis = {
        pedidos_vendidos: Number(vendidosAgg?.cantidad || 0),
        pedidos_cancelados: Number(canceladosAgg?.cantidad || 0),
        total_vendido,
        total_cancelado,
        total_neto
    };

    return { kpis, metodos, efectivo_teorico };
}

exports.calcular = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const user = req.user || {};
            const { desde, hasta, pizzeria_id: bodyPizzeriaId } = req.body;

            const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;
            if (!pizzeria_id) return res.status(400).json({ message: 'No se encontró pizzeria_id.' });
            if (!desde || !hasta) return res.status(400).json({ message: 'Debes enviar desde y hasta.' });

            const resumen = await calcularResumen(pizzeria_id, desde, hasta);

            return res.status(200).json({
                message: 'Cálculo de cierre listo',
                data: { ...resumen, rango: { desde, hasta } }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al calcular cierre', error: err.message });
        }
    });
};

exports.crear = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const user = req.user || {};
            const {
                desde,
                hasta,
                efectivo_contado,
                notas,
                pizzeria_id: bodyPizzeriaId
            } = req.body;

            const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;
            if (!pizzeria_id) return res.status(400).json({ message: 'No se encontró pizzeria_id.' });
            if (!desde || !hasta) return res.status(400).json({ message: 'Debes enviar desde y hasta.' });

            // Evitar duplicados del mismo rango
            const yaExiste = await CierreCaja.findOne({
                where: { pizzeria_id, desde, hasta, is_active: true }
            });
            if (yaExiste) {
                return res.status(409).json({ message: 'Ya existe un cierre para ese rango de fechas.' });
            }

            const resumen = await calcularResumen(pizzeria_id, desde, hasta);

            const contado = toMoney(efectivo_contado || 0);
            const diferencia = toMoney(contado - resumen.efectivo_teorico);

            const cierre = await CierreCaja.create({
                pizzeria_id,
                desde,
                hasta,

                total_vendido: resumen.kpis.total_vendido,
                total_cancelado: resumen.kpis.total_cancelado,
                total_neto: resumen.kpis.total_neto,

                efectivo_teorico: resumen.efectivo_teorico,
                efectivo_contado: contado,
                diferencia,

                metodos_json: resumen.metodos,
                notas: notas || null,
                is_active: true
            });

            return res.status(201).json({ message: 'Cierre guardado correctamente', data: cierre });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al guardar cierre', error: err.message });
        }
    });
};

exports.consult = async (req, res) => {
    authenticateToken(req, res, async () => {
        try {
            const user = req.user || {};
            const { id, desde, hasta, pizzeria_id: bodyPizzeriaId } = req.body;

            const pizzeria_id = user.pizzeria_id || bodyPizzeriaId;
            if (!pizzeria_id) return res.status(400).json({ message: 'No se encontró pizzeria_id.' });

            if (id) {
                const cierre = await CierreCaja.findOne({
                    where: { id, pizzeria_id, is_active: true }
                });

                return cierre
                    ? res.status(200).json({ message: 'Cierre encontrado', data: cierre })
                    : res.status(404).json({ message: 'Cierre no encontrado' });
            }

            const where = { pizzeria_id, is_active: true };
            if (desde && hasta) {
                where.desde = { [Op.gte]: desde };
                where.hasta = { [Op.lte]: hasta };
            }

            const cierres = await CierreCaja.findAll({
                where,
                order: [['create_at', 'DESC']],
                limit: 200
            });

            return res.status(200).json({ message: 'Cierres encontrados', data: cierres });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al consultar cierres', error: err.message });
        }
    });
};
