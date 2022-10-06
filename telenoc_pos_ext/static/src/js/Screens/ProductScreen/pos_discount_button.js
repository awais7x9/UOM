odoo.define('telenoc_pos_ext.UniversalDiscount', function(require) {
'use strict';
    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');


   class UniversalDiscountButton extends PosComponent {
       constructor() {
           super(...arguments);
           useListener('click', this.onClick);
       }
       async onClick() {
            var self = this;
            const { confirmed, payload } = await this.showPopup('NumberPopup',{
                title: this.env._t('Universal Discount'),
                startingValue: this.env.pos.config.discount_pc,
                isInputSelected: true
            });
            if (confirmed) {
//                const val = Math.round(Math.max(0,Math.min(100,parseFloat(payload))));
                await self.apply_discount(payload);
            }
        }
       async apply_discount(pc) {
            var order    = this.env.pos.get_order();
            var lines    = order.get_orderlines();

            var product  = this.env.pos.db.get_product_by_id(this.env.pos.config.discount_product_id[0]);
            var type = $("select[name='discount_type']").val();
            order.set_uni_discount_type(type);
            order.set_uni_discount_am(pc);
            var discount = 0;
            if(type=='amount'){
                discount = -pc;
                order.set_uni_discount(discount);
//                order.render();
//                alert(order.get_uni_discount());
            }
            else{
            discount = - pc / 100.0 * order.get_c_total_amount();
            order.set_uni_discount(discount);
//            order.render();
            }
            order.orderlines.trigger('change', order.orderlines[0]);

//            OrderWidget._updateSummary();

        }
   }
   UniversalDiscountButton.template = 'UniversalDiscountButton';
   ProductScreen.addControlButton({
       component: UniversalDiscountButton,
       condition: function() {
           return true;
       },
   });
   Registries.Component.add(UniversalDiscountButton);
   return UniversalDiscountButton;
});