# -*- coding: utf-8 -*-
# from odoo import http


# class CybatPosDiscount(http.Controller):
#     @http.route('/cybat_pos_discount/cybat_pos_discount', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/cybat_pos_discount/cybat_pos_discount/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('cybat_pos_discount.listing', {
#             'root': '/cybat_pos_discount/cybat_pos_discount',
#             'objects': http.request.env['cybat_pos_discount.cybat_pos_discount'].search([]),
#         })

#     @http.route('/cybat_pos_discount/cybat_pos_discount/objects/<model("cybat_pos_discount.cybat_pos_discount"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('cybat_pos_discount.object', {
#             'object': obj
#         })
