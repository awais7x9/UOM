# -*- coding: utf-8 -*-
from odoo import models, fields, api
from odoo.addons.point_of_sale.models.pos_order import PosOrder as PO
from odoo.osv.expression import AND


class ShowAllRefundOrders(models.Model):
    _inherit = 'pos.order'

    @api.model
    def search_paid_order_ids(self, config_id, domain, limit, offset):
        """Search for 'paid' orders that satisfy the given domain, limit and offset."""
        # default_domain = ['&', ('config_id', '=', config_id), '!', '|', ('state', '=', 'draft'), ('state', '=', 'cancelled')]
        #Asir custom code
        default_domain = [('state', 'not in', ['draft','cancelled'])]
        real_domain = AND([domain, default_domain])
        # ids = self.search(AND([domain, default_domain]), limit=limit, offset=offset).ids
        #Asir custom code
        ids = self.search(AND([domain, default_domain]), limit=limit, offset=offset).ids
        totalCount = self.search_count(real_domain)
        return {'ids': ids, 'totalCount': totalCount}

    PO.search_paid_order_ids = search_paid_order_ids
