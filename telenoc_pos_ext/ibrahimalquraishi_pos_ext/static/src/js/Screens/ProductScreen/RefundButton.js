odoo.define('ibrahimalquraishi_pos_ext.RefundButton', function (require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const RefundButton = require('point_of_sale.RefundButton');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const Registries = require('point_of_sale.Registries');
    const { useListener } = require('web.custom_hooks');

    const MyRefundButton = (RefundButton) =>
        class extends RefundButton  {
        _onClick() {

            const customer = this.env.pos.get_order().get_client();
            alert(this.env.pos.get_order());
            const searchDetails = customer ? { fieldName: 'CUSTOMER', searchTerm: customer.name } : {};
            this.trigger('close-popup');
            this.showScreen('TicketScreen', {
                ui: { filter: 'SYNCED', searchDetails },
                destinationOrder: this.env.pos.get_order(),
            });
        }
    }
//    RefundButton.template = 'point_of_sale.RefundButton';

//    ProductScreen.addControlButton({
//        component: RefundButton,
//        condition: function () {
//            return true;
//        },
//    });

    Registries.Component.extend(MyRefundButton, RefundButton);
    return MyRefundButton;
});
