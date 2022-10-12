odoo.define("ibrahimalquraishi_pos_ext.models", function (require){
    "use strict";
    const models = require('point_of_sale.models');
    var utils = require('web.utils');

    var round_di = utils.round_decimals;
    var round_pr = utils.round_precision;

    models.load_fields('product.product','extra_item');
    models.load_fields('pos.order.line','remaining_qty');

    var posmodel_super = models.PosModel.prototype;



models.load_fields('res.partner','parent_id');




    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            var self = this;
            // some new code in this method
//            models.load_fields('pos.order.line',['product_subsidy']);
            models.load_fields('pos.order',['c_untaxed_amount', 'c_amount', 'c_discount_amount', 'c_total_amount','c_tax_amount', 'gift_invoice','promotion_set','promotion_line','remaining_qty']);
            models.load_fields('hr.employee',['can_exchange']);
            posmodel_super.initialize.apply(this, arguments);
//            this.models = this.models.concat(extend_models);

        },
    });


    var super_order = models.Order.prototype;
    models.Order = models.Order.extend({
        initialize: function(attributes,options){
            let res = super_order.initialize.apply(this,arguments);
            if (!options.json) {
                this.c_untaxed_amount = 0;
                this.c_amount = 0;
                this.c_discount_amount = 0;
                this.c_total_amount = 0;
                this.c_tax_amount = 0;
                this.street_part = 0;
                this.phone_part = 0;
                this.email_part = 0;
                this.image_part = 0;
                this.mobile_part = 0;
                this.gift_invoice = 0;
                this.promotion_set = 0;
            }
            return res;
        },
        export_as_JSON: function() {
            let json = super_order.export_as_JSON.apply(this, arguments);
            json.c_untaxed_amount = this.get_c_untaxed_amount();
            json.c_amount = this.get_c_amount();
            json.c_discount_amount = this.get_c_discount_amount();
            json.c_total_amount = this.get_c_total_amount();
            json.c_tax_amount = this.get_c_tax_amount();
            json.street_part = this.get_street_part();
            json.phone_part = this.get_phone_part();
            json.email_part = this.get_email_part();
            json.image_part = this.get_image_part();
            json.mobile_part = this.get_mobile_part();
            json.gift_invoice = this.get_gift_invoice();
            json.promotion_set = this.get_promotion_value();
            return json;
        },
        export_for_printing: function(){
            let json = super_order.export_for_printing.apply(this, arguments);
            json.c_untaxed_amount = this.get_c_untaxed_amount();
            json.c_amount = this.get_c_amount();
            json.c_discount_amount = this.get_c_discount_amount();
            json.c_total_amount = this.get_c_total_amount();
            json.c_tax_amount = this.get_c_tax_amount();
            json.street_part = this.get_street_part();
            json.phone_part = this.get_phone_part();
            json.email_part = this.get_email_part();
            json.image_part = this.get_image_part();
            json.mobile_part = this.get_mobile_part();
            json.gift_invoice = this.get_gift_invoice();
            json.promotion_set = this.get_promotion_value();
            return json;
        },

        set_orderline_options: function (orderline, options) {
//        console.log(options.remaining_qty);
        if(options.quantity !== undefined){
            orderline.set_quantity(options.quantity);
        }
        if(options.remaining_qty !== undefined){
            orderline.set_remaining_qty(options.remaining_qty);
        }

        if (options.price_extra !== undefined){
            orderline.price_extra = options.price_extra;
            orderline.set_unit_price(orderline.product.get_price(this.pricelist, orderline.get_quantity(), options.price_extra));
            this.fix_tax_included_price(orderline);
        }

        if(options.price !== undefined){
            orderline.set_unit_price(options.price);
            this.fix_tax_included_price(orderline);
        }

        if(options.lst_price !== undefined){
            orderline.set_lst_price(options.lst_price);
        }

        if(options.discount !== undefined){
            orderline.set_discount(options.discount);
        }

        if (options.description !== undefined){
            orderline.description += options.description;
        }

        if(options.extras !== undefined){
            for (var prop in options.extras) {
                orderline[prop] = options.extras[prop];
            }
        }
        if (options.is_tip) {
            this.is_tipped = true;
            this.tip_amount = options.price;
        }
        if (options.refunded_orderline_id) {
            orderline.refunded_orderline_id = options.refunded_orderline_id;
        }
        if (options.tax_ids) {
            orderline.tax_ids = options.tax_ids;
        }
    },

        get_c_untaxed_amount: function() {
            return this.get_total_without_tax() + this.get_c_discount_amount();
        },
        set_c_untaxed_amount: function(c_untaxed_amount) {
            this.c_untaxed_amount=c_untaxed_amount;
        },
        get_street_part: function() {
        return this.street_part;
        },
        set_gift_invoice: function(gift_invoice) {
            this.gift_invoice=gift_invoice;
        },
        get_gift_invoice: function() {
        return this.gift_invoice;
        },

        set_promotion_value: function(promotion_set) {
          if (this.pos.config.promotion_enable == true) {
            this.promotion_set=1;
            }
            else{
            this.promotion_set=0;
            }
        },
        get_promotion_value: function() {
        return this.promotion_set;
        },

        set_street_part: function(street_part) {
            this.street_part=street_part;
        },

        get_mobile_part: function() {
        return this.mobile_part;
        },

        set_mobile_part: function(mobile_part) {
            this.mobile_part=mobile_part;
        },

        get_image_part: function() {
        return this.image_part;
        },

        set_image_part: function(image_part) {
            this.image_part=image_part;
        },

        get_phone_part: function() {
        return this.phone_part;
        },

        set_phone_part: function(phone_part) {
            this.phone_part=phone_part;
        },
        get_email_part: function() {
        return this.email_part;
        },

        set_email_part: function(email_part) {
            this.email_part=email_part;
        },

        get_total_tax: function() {
        if (this.pos.company.tax_calculation_rounding_method === "round_globally") {
            // As always, we need:
            // 1. For each tax, sum their amount across all order lines
            // 2. Round that result
            // 3. Sum all those rounded amounts
            var groupTaxes = {};
            this.orderlines.each(function (line) {
                var taxDetails = line.get_tax_details();
                var taxIds = Object.keys(taxDetails);
                for (var t = 0; t<taxIds.length; t++) {
                    var taxId = taxIds[t];
                    if (!(taxId in groupTaxes)) {
                        groupTaxes[taxId] = 0;
                    }
                    groupTaxes[taxId] += taxDetails[taxId];
                }
            });

            var sum = 0;
            var taxIds = Object.keys(groupTaxes);
            for (var j = 0; j<taxIds.length; j++) {
                var taxAmount = groupTaxes[taxIds[j]];
                sum += round_pr(taxAmount, this.pos.currency.rounding);
            }
            return sum;
        } else {
            return round_pr(this.orderlines.reduce((function(sum, orderLine) {
                return sum + orderLine.get_tax();
            }), 0), this.pos.currency.rounding);
        }
    },
        get_c_tax_amount: function() {
            return this.get_total_tax();
//            return this.full_product_name;
        },
        set_c_tax_amount: function(c_tax_amount) {
            this.c_tax_amount=c_tax_amount;
        },
        get_c_amount: function() {
            return this.get_c_untaxed_amount() + this.get_c_tax_amount();
        },
        get_total_discount: function() {
        return round_pr(this.orderlines.reduce((function(sum, orderLine) {
            sum += (orderLine.get_unit_price() * (orderLine.get_discount()/100));
            if (orderLine.display_discount_policy() === 'without_discount'){
                sum += ((orderLine.get_lst_price() - orderLine.get_unit_price()));
            }
            return sum;
        }), 0), this.pos.currency.rounding);
    },
        set_c_amount: function(c_amount) {
            this.c_amount=c_amount;
        },
        get_c_discount_amount: function() {
            return this.get_total_discount();

        },
        set_c_discount_amount: function(c_discount_amount) {
            this.c_discount_amount=c_discount_amount;
        },

        set_c_total_amount: function(c_total_amount) {
            this.c_total_amount=c_total_amount;
        },
        get_c_total_amount: function() {
            return this.get_c_amount() - this.get_c_discount_amount();
        },


    });

    var super_Orderline = models.Orderline.prototype;
    models.Orderline = models.Orderline.extend({
        initialize: function (attributes, options) {
            let res = super_Orderline.initialize.apply(this, arguments);
            if (!options.json) {
                this.product_subsidy = null;
                this.promotion_line = null;
                this.remaining_qty = this.quantity;

//                this.set_promotion();


            }
            return res;
        },
        export_as_JSON: function() {
            let json = super_Orderline.export_as_JSON.apply(this, arguments);
            json.promotion_line = this.get_promotion_line();
            if(json.latest_price){
                json.price = json.latest_price
                }

//            json.remaining_qty = this.get_remaining_qty();

        this.set_promotion();
    json.remaining_qty = this.remaining_qty;

            return json;
        },

        init_from_JSON: function (json) {
            super_Orderline.init_from_JSON.apply(this, arguments);
            if (json.product_subsidy) {
                this.product_subsidy = json.product_subsidy;

            }
            this.remaining_qty = json.remaining_qty;
            this.promotion_line = json.promotion_line

        },
        export_for_printing: function(){
            var json = super_Orderline.export_for_printing.apply(this, arguments);
            json.extra_ok = this.get_extra_ok();
            json.arabic_name = this.get_product().name_arabic;
            json.promotion_line = this.get_promotion_line();
//            json.remaining_qty = this.get_remaining_qty();
            json.remaining_qty = this.remaining_qty;
            return json;
        },
        clone: function(){
//        console.log(this.remaining_qty);
        var orderline = new exports.Orderline({},{
            pos: this.pos,
            order: this.order,
            product: this.product,
//            price: this.price,
            remaining_qty: this.remaining_qty,

        });
        orderline.order = null;
        orderline.quantity = this.quantity;
        orderline.quantityStr = this.quantityStr;
        orderline.discount = this.discount;
//        orderline.price = get_latest_price(orderline.uom_id, orderline.get_product(), order_line.find_reference_unit_price(orderline.get_product(), orderline.get_unit()), orderline.get_unit(), uom_list);
        orderline.selected = false;
        orderline.price_manually_set = this.price_manually_set;
        orderline.customerNote = this.customerNote;
        orderline.remaining_qty = this.remaining_qty;
        if(orderline.latest_price){
                orderline.price = orderline.latest_price;
        }
        return orderline;
    },


        set_promotion: function(){
        if (this.pos.config.promotion_enable == true){
            var self = this;
            var order    = this.order
            var lines    = order.get_orderlines();


            var bg_count = 0;
            var same_count = 0;
            var product_category_bg_ids = this.pos.config.product_category_bg_id
            var product_category_same_id = this.pos.config.product_category_same_id[0]
            var ex_bg = this.pos.config.ex_bg_product_ids;
            var ex_same = this.pos.config.ex_same_product_ids;
            var min_qty_val = this.pos.config.same_pro_qty;

            for (let k=0; k<product_category_bg_ids.length; k++) {
            var product_category_bg_id = product_category_bg_ids[k];
            for (let i = 0; i < lines.length; i++){
            if (lines[i].product.categ_id[0] == product_category_bg_id && ([ex_bg][0].includes(lines[i].product.id)==false))
            {
                bg_count = bg_count + 1;
            }
            }

                var qty_sum_bg = 0;

                var loop_qty_count = Math.floor(lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id  && ([ex_bg][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price)).length);
                                for (let i = 0; i < loop_qty_count; i++){
                                qty_sum_bg = qty_sum_bg + lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id  && ([ex_bg][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[i].quantity;
                                lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id  && ([ex_bg][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[i].set_remaining_qty(lines[i].quantity);

                 }

//                 alert(qty_sum_bg);


                    var loop_count = Math.floor(qty_sum_bg/2);
//                    if (loop_count > 1)
//                    {
//                    loop_count = loop_count + 1;
//                    }
                    var pp_check = lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id  && ([ex_bg][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                                var line_quantity = 0;
        //            alert(Math.floor(lines.length/2));
                    if (bg_count >=1 && pp_check.length != 0 ){

                    for (let m = 0; m < loop_count; m++){
                    console.log(m);
                    console.log(loop_count);
                    console.log(qty_sum_bg);
                    console.log(loop_qty_count);
                    console.log(Math.floor(lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id  && ([ex_bg][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price)).length));


                    var rem_quantity = lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id  && ([ex_bg][0].includes(item.product.id)==false) && item.remaining_qty != 0;
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0].remaining_qty - 1;
                                console.log(lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id  && ([ex_bg][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price)));
                     var free_quantity = lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id  && ([ex_bg][0].includes(item.product.id)==false) && item.remaining_qty != 0;
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0].quantity - rem_quantity;
                     if (free_quantity == 0){
                     free_quantity = rem_quantity;
                     }

                     lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id  && ([ex_bg][0].includes(item.product.id)==false) && item.remaining_qty != 0;
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0].set_promotion_line('Free Quantity '.concat(free_quantity));
                     lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_bg_id  && ([ex_bg][0].includes(item.product.id)==false) && item.remaining_qty != 0;
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0].remaining_qty = rem_quantity;




                   }
                        order.set_promotion_value(1);
                        }

                        }






                    for (let i = 0; i < lines.length; i++){
            if (lines[i].product.categ_id[0] == this.pos.config.product_category_same_id[0]  && ([ex_same][0].includes(lines[i].product.id)==false)){
                same_count = same_count + 1;
            }
            }
            var qty_sum_s2 = 0;
                var loop_qty_count_2 = Math.floor(lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).length);

                 for (let i = 0; i < loop_qty_count_2; i++){
                                qty_sum_s2 = qty_sum_s2 + lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                })[i].quantity;
                                lines[i].set_remaining_qty(lines[i].quantity);

                 }
                 var loop_same_count = Math.floor(lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).length);
                    if (same_count >=1 ) {

                    var loop_same_ccount = Math.floor(((qty_sum_s2/min_qty_val))/2);
                    var remaining_qty = loop_same_ccount*min_qty_val;

                    for (let m = 0; m < loop_same_count; m++){

                    var line_quantity = lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].quantity;


                    if(remaining_qty < 0){
                    remaining_qty = 0;
                    }
                    if (line_quantity > remaining_qty){
                    var quantity_promo = lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].quantity;
//                    lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
//                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].price = lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
//                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].product.lst_price*(line_quantity-remaining_qty);
                                lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].set_promotion_line('Free Quantity '.concat(remaining_qty));
                                lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].set_remaining_qty(lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].quantity-(remaining_qty));
                    m=loop_same_count + 1;
                    break;
                    }
                    else{
                    lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].price =0.00;
                    remaining_qty = remaining_qty - line_quantity;

                    lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].set_promotion_line('Free Quantity '.concat(line_quantity));
                    lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].set_remaining_qty(lines.filter(function(item) {
                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
                                }).sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[m].quantity-line_quantity);
                    }
//                        alert(lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
//                                })[i].quantity);
//                        if (Math.floor((lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
//                                })[i].quantity)/this.env.pos.config.same_pro_qty)>=2){
//                                var promotion_line = 'Free Quantity '.concat((Math.floor(((lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
//                                })[i].quantity)/this.env.pos.config.same_pro_qty)/2)*this.env.pos.config.same_pro_qty));
//
//
//                            lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
//                                })[i].quantity= lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
//                                })[i].quantity-(Math.floor(((lines.filter(function(item) {
//                                    return item.product.categ_id[0] == product_category_same_id  && ([ex_same][0].includes(item.product.id)==false);
//                                })[i].quantity)/this.env.pos.config.same_pro_qty)/2)*this.env.pos.config.same_pro_qty);
//
//                                lines[i].set_promotion_line(promotion_line);
//
//                                }

                        }
                        order.set_promotion_value(1);
                        }
                        }





        },

        get_extra_ok: function(){
        return this.get_product().extra_item;
        },
        get_promotion_line: function(){
        return this.promotion_line;
        },
        set_promotion_line: function(promotion_line){
        this.promotion_line = promotion_line;
        },

        get_remaining_qty: function(){
        return this.remaining_qty;
        },
        set_remaining_qty: function(remaining_qty){
        this.remaining_qty = remaining_qty;
        },

        get_base_price: function(){

        if (this.pos.config.promotion_enable == true && this.promotion_line != undefined) {
        var rounding = this.pos.currency.rounding;
        return round_pr(this.get_unit_price() * this.get_remaining_qty() * (1 - this.get_discount()/100), rounding);

        }
        else{
        var rounding = this.pos.currency.rounding;
        return round_pr(this.get_unit_price() * this.get_quantity() * (1 - this.get_discount()/100), rounding);
        }
    },

        get_all_prices: function(){
        var self = this;

        var price_unit = this.get_unit_price() * (1.0 - (this.get_discount() / 100.0));
        var taxtotal = 0;

        var product =  this.get_product();
        var taxes_ids = this.tax_ids || product.taxes_id;
        taxes_ids = _.filter(taxes_ids, t => t in this.pos.taxes_by_id);
        var taxes =  this.pos.taxes;
        var taxdetail = {};
        var product_taxes = [];

        _(taxes_ids).each(function(el){
            var tax = _.detect(taxes, function(t){
                return t.id === el;
            });
            product_taxes.push.apply(product_taxes, self._map_tax_fiscal_position(tax, self.order));
        });
        product_taxes = _.uniq(product_taxes, function(tax) { return tax.id; });

        var all_taxes = this.compute_all(product_taxes, price_unit, this.get_quantity(), this.pos.currency.rounding);
        var all_taxes_before_discount = this.compute_all(product_taxes, this.get_unit_price(), this.get_quantity(), this.pos.currency.rounding);
        this.set_promotion();
//        console.log(this.remaining_qty);
         if (this.pos.config.promotion_enable == true && this.promotion_line != undefined) {

        var all_taxes = this.compute_all(product_taxes, price_unit, this.get_remaining_qty(), this.pos.currency.rounding);
        var all_taxes_before_discount = this.compute_all(product_taxes, this.get_unit_price(), this.get_remaining_qty(), this.pos.currency.rounding);
        }
        _(all_taxes.taxes).each(function(tax) {
            taxtotal += tax.amount;
            taxdetail[tax.id] = tax.amount;
        });

        return {
            "priceWithTax": all_taxes.total_included,
            "priceWithoutTax": all_taxes.total_excluded,
            "priceSumTaxVoid": all_taxes.total_void,
            "priceWithTaxBeforeDiscount": all_taxes_before_discount.total_included,
            "tax": taxtotal,
            "taxDetails": taxdetail,
        };
    },

    });

});
