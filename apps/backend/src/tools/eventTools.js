import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Consultar metricas de un evento (datos simulados)
export const getEventMetrics = tool(
    async ({ eventId }) => {
        console.log(`[Tool] Consultando metricas del evento: ${eventId}`);
        return JSON.stringify({
            soldTickets: 40,
            totalCapacity: 100,
            status: "critical_low",
            daysLeft: 1
        });
    },
    {
        name: "get_event_metrics",
        description: "Úsalo para consultar cuántas entradas se han vendido, el aforo total y el estado del evento. Requiere el ID del evento.",
        schema: z.object({
            eventId: z.string().describe("El ID del evento a consultar")
        }),
    }
);