from odoo import models,fields,api
import json

class PosOrderFix(models.Model):
    _inherit = 'pos.order'

    my_branches = fields.Char(
        compute="_compute_branches_domain",
        search="search_ids_search",
    )

    @api.depends('name')
    def _compute_branches_domain(self):
        print('Domain Set')

    def search_ids_search(self, operator, operand):
        if self.env.user.has_group ('pos_branch.group_branch_user_manager'):
            obj = self.env['pos.order'].search(['|',('branch_id', '=', self.env.user.branch_ids.ids), ('branch_id', '=', False)]).ids
            print(obj)
            return [('id', 'in', obj)]
        else:
            obj = self.env['pos.order'].search(
                [('branch_id', '=', self.env.user.branch_ids.ids)]).ids
            print(obj)
            return [('id', 'in', obj)]


class PosSessionFix(models.Model):
    _inherit = 'pos.session'

    my_session = fields.Char(
        compute="_compute_session_domain",
        search="search_ids_session",
    )

    @api.depends('name')
    def _compute_session_domain(self):
        print('Domain Set')

    def search_ids_session(self, operator, operand):
        if self.env.user.has_group ('pos_branch.group_branch_user_manager'):
            obj = self.env['pos.session'].search(['|',('branch_id', '=', self.env.user.branch_ids.ids),('branch_id','=',False)]).ids
            print(obj)
            return [('id', 'in', obj)]
        else:
            obj = self.env['pos.session'].search([('branch_id', '=', self.env.user.branch_ids.ids)]).ids
            print(obj)
            return [('id', 'in', obj)]

class PosPaymentFix(models.Model):
    _inherit = 'pos.payment'

    my_payment = fields.Char(
        compute="_compute_payment_domain",
        search="search_ids_payment",
    )

    @api.depends('name')
    def _compute_payment_domain(self):
        print('Domain Set')

    def search_ids_payment(self, operator, operand):
        if self.env.user.has_group ('pos_branch.group_branch_user_manager'):
            obj = self.env['pos.payment'].search(['|',('branch_id', '=', self.env.user.branch_ids.ids),('branch_id','=',False)]).ids
            print(obj)
            return [('id', 'in', obj)]
        else:
            obj = self.env['pos.payment'].search(
                [('branch_id', '=', self.env.user.branch_ids.ids)]).ids
            print(obj)
            return [('id', 'in', obj)]


class PosReport(models.Model):
    _inherit = 'report.pos.order'

    my_report = fields.Char(
        compute="_compute_report_domain",
        search="search_ids_report",
    )

    @api.depends('order_id')
    def _compute_report_domain(self):
        print('Domain Set')

    def search_ids_report(self, operator, operand):
        if self.env.user.has_group ('pos_branch.group_branch_user_manager'):
            obj = self.env['report.pos.order'].search(['|',('order_id.branch_id', '=', self.env.user.branch_ids.ids),('order_id.branch_id','=',False)]).ids
            print(obj)
            return [('id', 'in', obj)]
        else:
            obj = self.env['report.pos.order'].search([('order_id.branch_id', '=', self.env.user.branch_ids.ids)]).ids
            print(obj)
            return [('id', 'in', obj)]

# class PosConfigFix(models.Model):
#     _inherit = 'pos.config'
#
#     my_conf = fields.Char(
#         compute="_compute_conf_domain",
#         search="search_ids_conf",
#     )
#
#     @api.depends('name')
#     def _compute_conf_domain(self):
#         print('Domain Set')
#
#     def search_ids_conf(self, operator, operand):
#         obj = self.env['pos.config'].search([('branch_id', '=', self.env.user.branch_ids.ids)]).ids
#         print(obj)
#         return [('id', 'in', obj)]