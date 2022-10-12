odoo.define('ibrahimalquraishi_pos_ext.GiftInvoiceButton', function(require) {
'use strict';
    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');


   class GiftInvoiceButton extends PosComponent {
       constructor() {
           super(...arguments);
           useListener('click', this.onClick);
       }
       async onClick() {
            var self = this;
            var order    = this.env.pos.get_order();
            var lines    = order.get_orderlines();
            alert(order.get_gift_invoice());
            if (order.get_gift_invoice() == 1)
            {
            order.set_gift_invoice(0);
            }
            else
            {
            order.set_gift_invoice(1);
            }
            order.orderlines.trigger('change', order.orderlines[0]);


        }
       get_gift_invoice_state() {
            var order    = this.env.pos.get_order();
            return order.get_gift_invoice();
        }

   }
   GiftInvoiceButton.template = 'GiftInvoiceButton';
   ProductScreen.addControlButton({
       component: GiftInvoiceButton,
       condition: function() {
           return true;
       },
   });
   Registries.Component.add(GiftInvoiceButton);
   return GiftInvoiceButton;
});