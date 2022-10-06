# -*- coding: utf-8 -*-
{
    'name': "POS Customizations",
    'version': '14.0.1.0.0',
    'category': 'Point of Sale',
    'summary': "POS Customization",
    'author': "Telenoc Group",
    'website': "http://telenoc.org",

    'depends': ['base', 'point_of_sale', 'pos_discount'],
    'data': [
        'views/pos_assets.xml',
        'views/pos_order.xml',


    ],
    'assets': {
        'web.assets_qweb': [
            # 'telenoc_pos_ext/static/src/xml//**/*',
            'telenoc_pos_ext/static/src/xml/**/*'
        ],
    },

    'installable': True,
    'application': True,
    'auto_install': False,
}
