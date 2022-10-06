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

    ks_global_discount_type = fields.Selection([('percent', 'Percentage'), ('amount', 'Amount')],
                                               string='Universal Discount Type',
                                               readonly=True,
                                               states={'draft': [('readonly', False)], 'sent': [('readonly', False)]},
                                               default='percent')
    ks_global_discount_rate = fields.Float('Universal Discount',
                                           readonly=True,
                                           states={'draft': [('readonly', False)], 'sent': [('readonly', False)]})
    ks_amount_discount = fields.Monetary(string='Universal Discount', readonly=True, compute='_onchange_amount_all', store=True,
                                         track_visibility='always')
    ks_enable_discount = fields.Boolean(compute='ks_verify_discount')

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
        if ui_order.get('uni_discount_am', False):
            order_fields.update({
                'ks_global_discount_rate': ui_order['uni_discount_am']
            })
        if ui_order.get('uni_discount_type', False):
            order_fields.update({
                'ks_global_discount_type': ui_order['uni_discount_type']
            })
        return order_fields

    @api.depends('payment_ids', 'lines','ks_global_discount_rate', 'ks_global_discount_type')
    def _onchange_amount_all(self):
        res = super(PosOrder, self)._onchange_amount_all()
        for rec in self:
            if not ('ks_global_tax_rate' in rec):
                rec.ks_calculate_discount()
        return res

    def ks_calculate_discount(self):
        for rec in self:
            if rec.ks_global_discount_type == "amount":
                rec.ks_amount_discount = rec.ks_global_discount_rate if rec.ks_global_discount_rate > 0 else 0

            elif rec.ks_global_discount_type == "percent":
                if rec.ks_global_discount_rate != 0.0:
                    rec.ks_amount_discount = (rec.c_untaxed_amount + rec.amount_tax) * rec.ks_global_discount_rate / 100
                else:
                    rec.ks_amount_discount = 0
            elif not rec.ks_global_discount_type:
                rec.ks_amount_discount = 0
                rec.ks_global_discount_rate = 0
            rec.amount_total = rec.c_untaxed_amount + rec.amount_tax - rec.ks_amount_discount

    # @api.depends('company_id.ks_enable_discount')
    def ks_verify_discount(self):
        for rec in self:
            rec.ks_enable_discount = True

    def _generate_pos_order_invoice(self):
        moves = self.env['account.move']

        for order in self:
            # Force company for all SUPERUSER_ID action
            if order.account_move:
                moves += order.account_move
                continue

            if not order.partner_id:
                raise UserError(_('Please provide a partner for the sale.'))

            move_vals = order._prepare_invoice_vals()
            move_vals['ks_global_discount_rate'] = order.ks_global_discount_rate
            move_vals['ks_global_discount_type'] = order.ks_global_discount_type
            # pdb.set_trace()
            new_move = order._create_invoice(move_vals)

            order.write({'account_move': new_move.id, 'state': 'invoiced'})
            new_move.sudo().with_company(order.company_id)._post()
            moves += new_move
            order._apply_invoice_payments()

        if not moves:
            return {}

        return {
            'name': _('Customer Invoice'),
            'view_mode': 'form',
            'view_id': self.env.ref('account.view_move_form').id,
            'res_model': 'account.move',
            'context': "{'move_type':'out_invoice'}",
            'type': 'ir.actions.act_window',
            'nodestroy': True,
            'target': 'current',
            'res_id': moves and moves.ids[0] or False,
        }

    # def action_pos_order_invoice(self):
    #     res = super(PosOrder, self).action_pos_order_invoice()
    #     for rec in self:
    #         res['ks_global_discount_rate'] = rec.ks_global_discount_rate
    #         res['ks_global_discount_type'] = rec.ks_global_discount_type
    #     pdb.set_trace()
    #     return res

class PosConfig(models.Model):
    _inherit = 'pos.config'

    phone_part = fields.Char(related='branch_id.partner_id.phone', store=True)
    mobile_part = fields.Char(related='branch_id.partner_id.mobile', store=True)
    street_part = fields.Char(related='branch_id.partner_id.street', store=True)
    email_part = fields.Char(related='branch_id.partner_id.email', store=True)
    img_part = fields.Image(related='branch_id.partner_id.image_1920', store=True)
    img_url = fields.Char("Image URL", compute="_compute_image_url", store=True)

    def _compute_image_url(self):
        for rec in self:
            if rec.branch_id.partner_id.image_1920:
                rec.img_url = image_data_uri(rec.branch_id.partner_id.image_1920)
            else:
                rec.img_url = ''
