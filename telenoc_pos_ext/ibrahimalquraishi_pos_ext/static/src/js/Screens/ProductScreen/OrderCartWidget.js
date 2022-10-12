odoo.define('ibrahimalquraishi_pos_ext.OrderCartWidget', function(require) {
    'use strict';

    const { useState, useRef, onPatched } = owl.hooks;
    const { useListener } = require('web.custom_hooks');
    const { onChangeOrder } = require('point_of_sale.custom_hooks');
    const OrderWidget = require('point_of_sale.OrderWidget');
    const Registries = require('point_of_sale.Registries');

    const OrderCartWidget = (OrderWidget) => {
        class OrderCartWidget extends OrderWidget {
            constructor() {
                super(...arguments);
                useListener('select-line', this._selectLine);
                useListener('edit-pack-lot-lines', this._editPackLotLines);
                onChangeOrder(this._onPrevOrder, this._onNewOrder);
                this.scrollableRef = useRef('scrollable');
                this.scrollToBottom = false;
//                onPatched(() => {
//                    // IMPROVEMENT
//                    // This one just stays at the bottom of the orderlines list.
//                    // Perhaps it is better to scroll to the added or modified orderline.
//                    if (this.scrollToBottom) {
//                        this.scrollableRef.el.scrollTop = this.scrollableRef.el.scrollHeight;
//                        this.scrollToBottom = false;
//                    }
//                });
                this.state = useState({ c_untaxed_amount: 0, c_amount: 0, c_discount_amount: 0, c_total_amount: 0, c_tax_amount: 0, street_part:0, gift_invoice:0, promotion_set:0, email_part: 0, image_part: 0, phone_part:0, mobile_part:0});
                this._updateSummary();
            }
            _updateSummary() {
                this.order.set_street_part(this.env.pos.config.street_part);
                this.order.set_email_part(this.env.pos.config.email_part);
                this.order.set_phone_part(this.env.pos.config.phone_part);
//                this.order.set_image_part(this.env.pos.config.img_part);
                this.order.set_image_part(this.env.pos.config.img_url);
                this.order.set_mobile_part(this.env.pos.config.mobile_part);

                const c_untaxed_amount = this.order ? this.order.get_c_untaxed_amount() : 0;
                const c_amount = this.order ? this.order.get_c_amount() : 0;
                const c_discount_amount = this.order ? this.order.get_c_discount_amount() : 0;
                const c_total_amount = this.order ? this.order.get_c_total_amount() : 0;
                const c_tax_amount = this.order ? this.order.get_c_tax_amount() : 0;
                const street_part = this.order ? this.order.get_street_part() : 0;
                const email_part = this.order ? this.order.get_email_part() : 0;
                const phone_part = this.order ? this.order.get_phone_part() : 0;
                const image_part = this.order ? this.order.get_image_part() : 0;
                const mobile_part = this.order ? this.order.get_mobile_part() : 0;
                const gift_invoice = this.order ? this.order.get_gift_invoice() : 0;
                const promotion_set = this.order ? this.order.get_promotion_value() : 0;


                this.state.c_untaxed_amount = this.env.pos.format_currency(c_untaxed_amount);
                this.state.c_amount = this.env.pos.format_currency(c_amount);
                this.state.c_discount_amount = this.env.pos.format_currency(c_discount_amount);
                this.state.c_total_amount = this.env.pos.format_currency(c_total_amount);
                this.state.c_tax_amount = this.env.pos.format_currency(c_tax_amount);
                this.state.gift_invoice = gift_invoice;
                this.state.promotion_set = promotion_set;
//                if (!this.order.get_client() && this.order.get_c_total_amount() >=300){
//                this.showPopup('ErrorPopup', {
//                                    title: this.env._t('Customer Error'),
//                                    body: this.env._t(
//                                        "Customer is not set."
//                                    ),
//                                });
//
//                }
                this.render();
            }
        }
        OrderCartWidget.template = 'OrderWidget';
        return OrderCartWidget;
    };

    Registries.Component.extend(OrderWidget, OrderCartWidget);
    return OrderCartWidget;
});