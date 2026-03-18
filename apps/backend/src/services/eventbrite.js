export const eventbriteService = {
    // Obtener ID de la organizacion
    async getOrganizationId() {
        try {
            const res = await fetch(`https://www.eventbriteapi.com/v3/users/me/organizations/`, {
                headers: { 'Authorization': `Bearer ${process.env.EB_TOKEN}` }
            });
            const data = await res.json();
            if (!data.organizations || data.organizations.length === 0) return null;
            return data.organizations[0].id;
        } catch (error) {
            console.error('[Eventbrite] Error obteniendo organizacion:', error.message);
            return null;
        }
    },

    // Obtener metricas de venta del evento
    async getEventMetrics(eventId) {
        try {
            const url = `https://www.eventbriteapi.com/v3/events/${eventId}/ticket_classes/`;
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${process.env.EB_TOKEN}` }
            });
            const data = await res.json();

            if (data.error || !data.ticket_classes) {
                console.error('[Eventbrite] API error:', data.error_description || 'No tickets found');
                return { quantity_total: 0, quantity_sold: 0, pct_sold: 0 };
            }

            let total = 0;
            let sold = 0;

            data.ticket_classes.forEach(tc => {
                total += tc.capacity || 0;
                sold += tc.quantity_sold || 0;
            });

            return {
                quantity_total: total,
                quantity_sold: sold,
                pct_sold: total === 0 ? 0 : sold / total
            };
        } catch (error) {
            console.error('[Eventbrite] Error en getEventMetrics:', error.message);
            return { quantity_total: 0, quantity_sold: 0, pct_sold: 0 };
        }
    },

    // Crear codigo de descuento en Eventbrite
    async createDiscount(eventId, code, percentOff) {
        try {
            const orgId = await this.getOrganizationId();
            if (!orgId) throw new Error("Org ID no encontrado");

            const url = `https://www.eventbriteapi.com/v3/organizations/${orgId}/discounts/`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.EB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    discount: {
                        type: 'coded',
                        code: code,
                        percent_off: percentOff,
                        event_id: eventId,
                        quantity_available: 100
                    }
                })
            });
            return await res.json();
        } catch (error) {
            console.error('[Eventbrite] Error en createDiscount:', error.message);
            return null;
        }
    }
};