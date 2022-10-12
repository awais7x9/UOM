# -*- coding: utf-8 -*-
{
    'name': "POS Customizations",
    'version': '14.0.1.0.0',
    'category': 'Point of Sale',
    'summary': "POS Customization",
    'author': "Telenoc Group",
    'website': "http://telenoc.org",

    'depends': ['base', 'point_of_sale', 'pos_branch'],
    'data': [
        # 'views/pos_assets.xml',
        'views/product_template.xml',
        'views/pos_config.xml',
        'views/res_config_settings.xml',

    ],
    'assets': {
        'web.assets_qweb': [
            'ibrahimalquraishi_pos_ext/static/src/xml/**/*',
            # 'ibrahimalquraishi_pos_ext/static/src/xml/Screens/ProductScreen/ControlButtons/PromotionButton.xml',
        ],
        'point_of_sale.assets': [
            'ibrahimalquraishi_pos_ext/static/src/js/models.js',
            'ibrahimalquraishi_pos_ext/static/src/js/Screens/ProductScreen/OrderCartWidget.js',
            'ibrahimalquraishi_pos_ext/static/src/js/Screens/ProductScreen/GiftInvoice.js',
            'ibrahimalquraishi_pos_ext/static/src/js/Screens/ProductScreen/PromotionButton.js',
            'ibrahimalquraishi_pos_ext/static/src/js/Screens/PaymentScreen.js',
            'ibrahimalquraishi_pos_ext/static/src/js/Screens/ProductScreen/RefundButton.js',
            'ibrahimalquraishi_pos_ext/static/src/js/Screens/ProductScreen/OrderlineDetails.js',

        ],
    },

    'installable': True,
    'application': True,
    'auto_install': False,
}
