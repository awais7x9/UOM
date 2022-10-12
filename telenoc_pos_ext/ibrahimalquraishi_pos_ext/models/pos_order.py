# -*- coding: utf-8 -*-
import pdb

from odoo import api, fields, models, tools, _
from functools import partial
import logging
import psycopg2
from odoo.tools import float_is_zero, float_round
from odoo.exceptions import ValidationError, UserError
from odoo.tools.image import image_data_uri

_logger = logging.getLogger(__name__)


# _validate_session


class PosOrder(models.Model):
    _inherit = 'pos.order'

    c_untaxed_amount = fields.Float('Untaxed Amount')
    c_amount = fields.Float('Amount')
    c_discount_amount = fields.Float('Discount Amount')
    c_total_amount = fields.Float('Discount Amount')
    c_tax_amount = fields.Float('Tax Amount')

    @api.model
    def create_from_ui(self, orders, draft=False):
        order_ids = []
        for order in orders:
            existing_order = False
            if 'server_id' in order['data']:
                existing_order = self.env['pos.order'].search(
                    ['|', ('id', '=', order['data']['server_id']), ('pos_reference', '=', order['data']['name'])],
                    limit=1)
                order_ids.append(existing_order.id)
            elif 'name' in order['data']:
                existing_order = self.env['pos.order'].search([('pos_reference', '=', order['data']['name'])], limit=1)

            if existing_order:
                order_ids.append(existing_order.id)
            else:
                # if (existing_order and existing_order.state == 'draft') or not existing_order:
                #     order_ids.append(self._process_order(order, draft, existing_order))
                order_ids.append(self._process_order(order, draft, existing_order))

        return self.env['pos.order'].search_read(domain=[('id', 'in', order_ids)], fields=['id', 'pos_reference'])

    @api.model
    def _order_fields(self, ui_order):
        order_fields = super(PosOrder, self)._order_fields(ui_order)
        if ui_order.get('c_untaxed_amount', False):
            order_fields.update({
                'c_untaxed_amount': ui_order['c_untaxed_amount']
            })
        if ui_order.get('c_amount', False):
            order_fields.update({
                'c_amount': ui_order['c_amount']
            })
        if ui_order.get('c_discount_amount', False):
            order_fields.update({
                'c_discount_amount': ui_order['c_discount_amount']
            })
        if ui_order.get('c_total_amount', False):
            order_fields.update({
                'c_total_amount': ui_order['c_total_amount']
            })
        return order_fields


class PosConfig(models.Model):
    _inherit = 'pos.config'

    phone_part = fields.Char(related='branch_id.partner_id.phone', store=True)
    mobile_part = fields.Char(related='branch_id.partner_id.mobile', store=True)
    street_part = fields.Char(related='branch_id.partner_id.street', store=True)
    email_part = fields.Char(related='branch_id.partner_id.email', store=True)
    img_part = fields.Image(related='branch_id.partner_id.image_1920', store=True)
    img_url = fields.Char("Image URL", compute="_compute_image_url", store=True)
    promotion_enable = fields.Boolean('Enable Promotion')
    product_category_bg_id = fields.Many2many('product.category','categ_pos_config_bg_rel', 'categ_id', 'pos_config_id',string='Product Categories')
    product_category_same_id = fields.Many2one('product.category',string='Product Categories')
    same_pro_qty = fields.Float('Product Quantity')
    ex_bg_product_ids = fields.Many2many('product.product','pro_pos_config_bg_rel', 'product_id', 'pos_config_id', string="Excluded Products")
    ex_same_product_ids = fields.Many2many('product.product','pro_pos_config_same_rel', 'product_id', 'pos_config_id', string="Excluded Products")


    def _compute_image_url(self):
        for rec in self:
            if rec.branch_id.partner_id.image_1920:
                rec.img_url = image_data_uri(rec.branch_id.partner_id.image_1920)
            else:
                rec.img_url = ''

class HrEmployeePublic(models.Model):
    _inherit = "hr.employee.public"

    pos_fixed_discount_limit = fields.Float()
    pos_percentage_discount_limit = fields.Float()

class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    remaining_qty = fields.Float('Remaining Quantity')
