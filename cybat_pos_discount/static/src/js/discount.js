odoo.define('cybat_pos_discount.DiscountButton', function(require) {
    'use strict';
    const Registries = require('point_of_sale.Registries');
    const DiscountButton = require('pos_discount.DiscountButton');
    const DiscountButtonExt = (DiscountButton) => class extends DiscountButton{
        constructor() {
            super(...arguments);
        }
        async apply_discount(pc) {
            var order    = this.env.pos.get_order();
            var lines    = order.get_orderlines();
            var product  = this.env.pos.db.get_product_by_id(this.env.pos.config.discount_product_id[0]);
            if (product === undefined) {
                await this.showPopup('ErrorPopup', {
                    title : this.env._t("No discount product found"),
                    body  : this.env._t("The discount product seems misconfigured. Make sure it is flagged as 'Can be Sold' and 'Available in Point of Sale'."),
                });
                return;
            }
            var type = $("select[name='discount_type']").val();
            var cashier = this.env.pos.get_cashier()
            if(type=='fixed'){
                if(cashier){
                    if(pc>cashier.pos_fixed_discount_limit){
                        await this.showPopup('ErrorPopup', {
                            title: this.env._t('Permission Denied'),
                            body: this.env._t(
                                'You are not allowed'
                            ),
                        });
                        return false;
                    }
                }
                var line_amount = pc/lines.length
                for (const line of lines) {
                        pc = 100 * (line_amount) / line.price
                        line.set_discount((Math.round(pc * 100) / 100).toFixed(2));
                }
            }
            else{
                if(cashier){
                        if(pc>cashier.pos_percentage_discount_limit){
                            await this.showPopup('ErrorPopup', {
                                title: this.env._t('Permission Denied'),
                                body: this.env._t(
                                    'You are not allowed'
                                ),
                            });
                            return false;
                        }
                    }
                 var base_to_discount = order.get_total_without_tax();

            if (product.taxes_id.length){
                var first_tax = this.env.pos.taxes_by_id[product.taxes_id[0]];
                if (first_tax.price_include) {
                    base_to_discount = order.get_total_with_tax();
                }
            }

            if(cashier){
                        if((pc / 100.0 * base_to_discount)>cashier.pos_fixed_discount_limit){
                            await this.showPopup('ErrorPopup', {
                                title: this.env._t('Permission Denied'),
                                body: this.env._t(
                                    'You are not allowed'
                                ),
                            });
                            return false;
                        }
                    }

            var discount = - pc / 100.0 * base_to_discount;
                for (const line of lines) {
                    line.set_discount(pc);
                }
            }

            // Remove existing discounts
            for (const line of lines) {
                if (line.get_product() === product) {

                    order.remove_orderline(line);
                }
            }

            // Add discount
            // We add the price as manually set to avoid recomputation when changing customer.
            var base_to_discount = order.get_total_without_tax();
            if (product.taxes_id.length){
                var first_tax = this.env.pos.taxes_by_id[product.taxes_id[0]];
                if (first_tax.price_include) {
                    base_to_discount = order.get_total_with_tax();
                }
            }
            var discount = - pc / 100.0 * base_to_discount;

//            if( discount < 0 ){
//                order.add_product(product, {
//                    price: discount,
//                    lst_price: discount,
//                    extras: {
//                        price_manually_set: true,
//                    },
//                });
//            }

        }
    };
    Registries.Component.extend(DiscountButton, DiscountButtonExt);
    return DiscountButton;
});
