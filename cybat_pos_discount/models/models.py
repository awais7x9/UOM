# -*- coding: utf-8 -*-

from odoo import models, fields, api
import hashlib
class HrEmployee(models.Model):

    _inherit = 'hr.employee'

    pos_fixed_discount_limit = fields.Float()
    pos_percentage_discount_limit = fields.Float()

    def get_barcodes_and_pin_hashed(self):
        if not self.env.user.has_group('point_of_sale.group_pos_user'):
            return []
        # Apply visibility filters (record rules)
        visible_emp_ids = self.search([('id', 'in', self.ids)])
        employees_data = self.sudo().search_read([('id', 'in', visible_emp_ids.ids)], ['barcode', 'pin','pos_fixed_discount_limit','pos_percentage_discount_limit'])

        for e in employees_data:
            e['barcode'] = hashlib.sha1(e['barcode'].encode('utf8')).hexdigest() if e['barcode'] else False
            e['pin'] = hashlib.sha1(e['pin'].encode('utf8')).hexdigest() if e['pin'] else False
        return employees_data
