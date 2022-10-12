odoo.define('telenoc_pos_ext.PromotionButton', function(require) {
'use strict';
    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');


   class PromotionButton extends PosComponent {
       constructor() {
           super(...arguments);
           useListener('click', this.onClick);
       }
       async onClick() {
            var self = this;
            var order    = this.env.pos.get_order();
            var lines    = order.get_orderlines();


            var bg_count = 0;
            var same_count = 0;
            var product_category_bg_id = this.env.pos.config.product_category_bg_id[0]
            var product_category_same_id = this.env.pos.config.product_category_same_id[0]
            var min_qty_val = this.env.pos.config.same_pro_qty
//            console.log(lines.filter(function(item) {
//                        return item.product.categ_id[0] == product_category_bg_id;
//                    }));
            for (let i = 0; i < lines.length; i++){
            if (lines[i].product.categ_id[0] == this.env.pos.config.product_category_bg_id[0])
            {
                bg_count = bg_count + 1;
            }
            if (lines[i].product.categ_id[0] == this.env.pos.config.product_category_same_id[0]){
                same_count = same_count + 1;
            }
            }



                 if (order.get_promotion_value() == 0)
                {
                var qty_sum_bg = 0;
                var qty_sum_s2 = 0;
                var loop_qty_count = Math.floor(lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id;
                                }).length);
                var loop_qty_count_2 = Math.floor(lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id;
                                }).length);
                                for (let i = 0; i < loop_qty_count; i++){
                                qty_sum_bg = qty_sum_bg + lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id;
                                })[i].quantity;
                                lines[i].set_remaining_qty(lines[i].quantity);

                 }
                 for (let i = 0; i < loop_qty_count_2; i++){
                                qty_sum_s2 = qty_sum_s2 + lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id;
                                })[i].quantity;
                                lines[i].set_remaining_qty(lines[i].quantity);

                 }
//                 alert(qty_sum_bg);


                    var loop_count = Math.floor(qty_sum_bg/2);
                    var loop_same_count = Math.floor(lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id;
                                }).length);
        //            alert(Math.floor(lines.length/2));
                    console.log(lines.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)));
                    if (bg_count >=1 ){
                    for (let m = 0; m <= loop_count; m++){
                    var line_quantity = lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id;
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].quantity;
                                alert(loop_count);
//                       alert('i value '.concat(m));
                    if (line_quantity > loop_count){
                    var quantity_promo = lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id;
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].quantity;
//                    lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_bg_id;
//                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].price = lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_bg_id;
//                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].product.lst_price*(lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_bg_id;
//                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].quantity-loop_count);
                                var rm_qty = quantity_promo - loop_count;
                                lines[m].set_promotion_line('Free Quantity '.concat(lines[m].quantity - rm_qty));
                                lines[m].set_remaining_qty(rm_qty);
                    m=loop_count + 1;
                    break;
                    }
                    else{
                    lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id;
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].price=0.00;
                    loop_count = loop_count - line_quantity;

                    lines[m].set_promotion_line('Free Quantity '.concat(line_quantity));
                    lines[m].set_remaining_qty(0);
                    }
                   }
                        order.set_promotion_value(1);
                        }
                    if (same_count >=1 ) {
                    var remaining_qty = Math.floor((qty_sum_s2/min_qty_val)-1)*min_qty_val;

                    for (let m = 0; m < loop_same_count; m++){

                    var line_quantity = lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id;
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].quantity;

                    if(remaining_qty < 0){
                    remaining_qty = 0;
                    }


                    if (line_quantity > remaining_qty){
                    var quantity_promo = lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id;
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].quantity;
//                    lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id;
//                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].price = lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id;
//                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].product.lst_price*(line_quantity-remaining_qty);
                                lines[m].set_promotion_line('Free Quantity '.concat(remaining_qty));
                                lines[m].set_remaining_qty(lines[m].quantity-remaining_qty);
                    m=loop_same_count + 1;
                    break;
                    }
                    else{
                    lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id;
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].price =0.00;
                    remaining_qty = remaining_qty - line_quantity;

                    lines[m].set_promotion_line('Free Quantity '.concat(line_quantity));
                    lines[m].set_remaining_qty(lines[m].quantity-line_quantity);
                    }
//                        alert(lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id;
//                                })[i].quantity);
//                        if (Math.floor((lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id;
//                                })[i].quantity)/this.env.pos.config.same_pro_qty)>=2){
//                                var promotion_line = 'Free Quantity '.concat((Math.floor(((lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id;
//                                })[i].quantity)/this.env.pos.config.same_pro_qty)/2)*this.env.pos.config.same_pro_qty));
//
//
//                            lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id;
//                                })[i].quantity= lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id;
//                                })[i].quantity-(Math.floor(((lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id;
//                                })[i].quantity)/this.env.pos.config.same_pro_qty)/2)*this.env.pos.config.same_pro_qty);
//
//                                lines[i].set_promotion_line(promotion_line);
//
//                                }

                        }
                        order.set_promotion_value(1);
                        }


                }
                else{
                    for (let i = 0; i <  lines.filter(function(item) {
                            return item.product.categ_id[0] == product_category_bg_id;
                        }).length; i++){
                    if (lines.filter(function(item) {
                            return item.product.categ_id[0] == product_category_bg_id;
                        })[i].price == 0.00)
                    {
                     lines.filter(function(item) {
                            return item.product.categ_id[0] == product_category_bg_id;
                        })[i].price =  lines.filter(function(item) {
                            return item.product.categ_id[0] == product_category_bg_id;
                        })[i].product.lst_price*lines.filter(function(item) {
                            return item.product.categ_id[0] == product_category_bg_id;
                        })[i].quantity;
                        lines[i].set_promotion_line('');
                    }
                    }
                    order.set_promotion_value(0);


                }
                order.orderlines.trigger('change', order.orderlines[0]);






        }
       get_promotion_state() {
            var order    = this.env.pos.get_order();
            return order.get_promotion_value();
        }

   }
   PromotionButton.template = 'PromotionButton';
   ProductScreen.addControlButton({
       component: PromotionButton,
       condition: function() {
           return true;
       },
   });
   Registries.Component.add(PromotionButton);
   return PromotionButton;
});