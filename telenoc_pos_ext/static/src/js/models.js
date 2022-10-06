odoo.define("telenoc_pos_ext.models", function (require){
    "use strict";
    const models = require('point_of_sale.models');
    var utils = require('web.utils');

    var round_di = utils.round_decimals;
    var round_pr = utils.round_precision;
    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');

    var posmodel_super = models.PosModel.prototype;
    models.PosModel = models.PosModel.extend({
        initialize: function (session, attributes) {
            var self = this;
            // some new code in this method
//            models.load_fields('pos.order.line',['product_subsidy']);
            models.load_fields('pos.order',['c_untaxed_amount', 'c_amount', 'c_discount_amount', 'c_total_amount','c_tax_amount','uni_discount','uni_discount_type','uni_discount_am']);
//            models.load_fields('res.partner',['identification_number']);
            posmodel_super.initialize.apply(this, arguments);
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
                this.uni_discount = 0;
                this.uni_discount_type = '';
                this.uni_discount_am = 0;
                this.branch_id = 0;
                this.phone_part = 0;
                this.email_part = 0;
                this.image_part = 0;
                this.mobile_part = 0;
                this.street_part = 0;
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
            json.uni_discount = this.get_uni_discount();
            json.uni_discount_type = this.get_uni_discount_type();
            json.uni_discount_am = this.get_uni_discount_am();
            json.phone_part = this.get_phone_part();
            json.email_part = this.get_email_part();
            json.image_part = this.get_image_part();
            json.mobile_part = this.get_mobile_part();
            json.street_part = this.get_street_part();

            return json;
        },
        export_for_printing: function(){
            let json = super_order.export_for_printing.apply(this, arguments);
            let order = this.pos.get_order();
            json.c_untaxed_amount = this.get_c_untaxed_amount();
            json.c_amount = this.get_c_amount();
            json.c_discount_amount = this.get_c_discount_amount();
            json.c_total_amount = this.get_c_total_amount();
            json.c_tax_amount = this.get_c_tax_amount();
            json.uni_discount = this.get_uni_discount();
            json.uni_discount_type = this.get_uni_discount_type();
            json.uni_discount_am = this.get_uni_discount_am();
            json.phone_part = this.get_phone_part();
            json.email_part = this.get_email_part();
            json.image_part = this.get_image_part();
            json.mobile_part = this.get_mobile_part();
            json.street_part = this.get_street_part();
//            alert(this.env.pos.config.discount_product_id[0]);



            return json;
        },

        get_c_untaxed_amount: function() {
        return this.get_total_without_tax();
        },
        set_c_untaxed_amount: function(c_untaxed_amount) {
            this.c_untaxed_amount=c_untaxed_amount;
        },
        get_uni_discount: function() {
        if (this.uni_discount === undefined){
        return 0.00;}
        else{
        return this.uni_discount;
        }

        },
        set_uni_discount: function(uni_discount) {
            this.uni_discount=uni_discount;
//            this.render();
            this.trigger('change',this);

        },

        get_uni_discount_type: function() {
        return this.uni_discount_type;
        },
        set_uni_discount_type: function(uni_discount_type) {
            this.uni_discount_type=uni_discount_type;

        },
        get_street_part: function() {
        return this.street_part;
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


        get_uni_discount_am: function() {
        if (this.uni_discount_am === undefined){
        return 0.00;}
        else{
        return this.uni_discount_am;
        }
        },
        set_uni_discount_am: function(uni_discount_am) {
            this.uni_discount_am=uni_discount_am;
            this.trigger('change',this);
        },

        get_c_tax_amount: function() {
            return this.get_total_tax();
//            return - ;
        },
        get_total_with_tax: function() {
         return this.get_c_total_amount();
        },
        set_c_tax_amount: function(c_tax_amount) {
            this.c_tax_amount=c_tax_amount;
        },
        get_c_amount: function() {
            return this.get_c_untaxed_amount() + this.get_c_tax_amount();
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
            return this.get_c_untaxed_amount() + this.get_c_tax_amount() + this.get_uni_discount();
        },


    });

});