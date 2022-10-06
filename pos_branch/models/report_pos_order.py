# -*- coding: utf-8 -*-

from functools import partial

from odoo import models, fields


class PosOrderReport(models.Model):
    _inherit = "report.pos.order"
    branch_id = fields.Many2one(related='order_id.branch_id', string='Branch', store=True)

