// controllers/analytics.controller.js
import * as AnalyticsService from "../services/analytics.service.js"; // ajusta el path si es distinto

/**
 * Utilidades de validación y respuesta
 */
const METRICS = new Set(["netProfit", "expectedProfit", "totalCost"]);
const ORDERS = new Set(["asc", "desc"]);

function parsePositiveInt(value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number.parseInt(value, 10);
  if (Number.isFinite(n) && n >= min && n <= max) return n;
  return fallback;
}

function badRequest(res, message) {
  return res.status(400).json({ message });
}

function unauthorized(res, message = "No autorizado") {
  return res.status(401).json({ message });
}

/**
 * Controller delgado:
 * - Revisa auth
 * - Valida/parsea params
 * - Delega TODO al service
 * - Responde
 */
export async function recipesRankings(req, res) {
  // 1) Autenticación básica
  if (!req?.user?._id) {
    return unauthorized(res);
  }

  try {
    // 2) Leer y validar query params
    const rawMetric = (req.query.metric || "netProfit").trim();
    const rawOrder = (req.query.order || "").trim();
    const rawLimit = req.query.limit;
    const rawPeriodDays = req.query.periodDays;

    // metric
    if (!METRICS.has(rawMetric)) {
      return badRequest(res, "Parámetro 'metric' inválido. Usa: netProfit | expectedProfit | totalCost");
    }
    const metric = rawMetric;

    // order (opcional)
    const order = ORDERS.has(rawOrder) ? rawOrder : undefined;

    // limit (default 5; clamp 1..50)
    const limit = parsePositiveInt(rawLimit, 5, { min: 1, max: 50 });

    // periodDays (opcional, entero >= 1)
    let periodDays;
    if (rawPeriodDays !== undefined) {
      const pd = parsePositiveInt(rawPeriodDays, NaN, { min: 1, max: 3650 });
      if (!Number.isFinite(pd)) {
        return badRequest(res, "Parámetro 'periodDays' debe ser un entero positivo.");
      }
      periodDays = pd;
    }

    // 3) Delegar toda la lógica pesada al service
    const userId = String(req.user._id);

    const { rows, effectiveOrder } = await AnalyticsService.recipesRankingsService({
      userId,
      metric,
      order,      // 'asc' | 'desc' | undefined
      limit,
      periodDays, // undefined | number
    });

    // 4) Responder (shape idéntico al actual)
    return res.status(200).json({
      metric,
      order: effectiveOrder, // "asc" | "desc"
      rows,                  // [{ name, totalCost, netProfit, expectedProfit, metricValue, createdAt }]
    });
  } catch (err) {
    // Respuestas amigables si el service lanza status/message
    const status = err?.status ?? 500;
    const message = err?.message ?? "Ocurrió un error inesperado.";
    if (status >= 500) {
      console.error("[recipesRankings] Error inesperado:", { err: err?.message || err, stack: err?.stack });
    }
    return res.status(status).json({ message });
  }
}
