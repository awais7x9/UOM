# Copyright 2017 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

{
    "name": "Pos Order Security Fix",
    "summary": """
        Use computed field as domain""",
    "version": "15.0.1.0.0",
    "license": "AGPL-3",
    "author": "",
    "website": "",
    "depends": ["point_of_sale"],
    'data': [
        'views/security.xml',
        # 'views/pos_order_report_view.xml'
    ],
    "installable": True,
}
