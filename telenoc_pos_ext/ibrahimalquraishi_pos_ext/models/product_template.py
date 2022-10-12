# -*- coding: utf-8 -*-
import pdb

from odoo import api, fields, models, tools, _
from functools import partial
import logging
import psycopg2
from odoo.tools import float_is_zero, float_round
from odoo.exceptions import ValidationError, UserError

_logger = logging.getLogger(__name__)


# _validate_session


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    extra_item = fields.Boolean('Extra Item', default=False)

class ProductProduct(models.Model):
    _inherit = 'product.product'

    extra_item = fields.Boolean(related='product_tmpl_id.extra_item', store=True)


