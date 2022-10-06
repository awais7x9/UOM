/* Copyright (c) 2016-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>) */
/* See LICENSE file for full copyright and licensing details. */
/* License URL : <https://store.webkul.com/license.html/> */
odoo.define('pos_multi_product_uom.main', function (require) {
	"use strict";
	var pos_model = require('point_of_sale.models');
  var SuperOrderline = pos_model.Orderline.prototype;
  const Registries = require('point_of_sale.Registries');
  const Orderline = require('point_of_sale.Orderline');
  const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');

  pos_model.Orderline=pos_model.Orderline.extend({
    init_from_JSON: function(json) {
      SuperOrderline.init_from_JSON.call(this,json);
      this.uom_id=json.uom_id;
    },
    get_unit: function(){
        var unit=SuperOrderline.get_unit.call(this);
        if(!this.uom_id){
          return unit;
        }
        var unit_id = this.uom_id;
        return this.pos.units_by_id[unit_id];
    },
    set_unit: function(unit){
      this.uom_id=unit;
      this.trigger('change', this);
    },
	set_unit_price: function(price){
		if(!this.price_manually_set){
			var new_price=(price*this.pos.units_by_id[this.product.uom_id[0]].factor)/this.get_unit().factor;
			SuperOrderline.set_unit_price.call(this,new_price);
		}else{
			SuperOrderline.set_unit_price.call(this,price);
		}
	},
    export_as_JSON: function() {
      var pack_lot_ids = SuperOrderline.export_as_JSON.call(this);
      pack_lot_ids.uom_id=this.get_unit().id;
      return pack_lot_ids;
    },
  });

  // Unit Selection Popup----------------
  class UnitSelectionPopupWidget extends AbstractAwaitablePopup {
    constructor() {
        super(...arguments);
        var self = this;
        self.item='';
        self.value=''||self.props.value;
        self.props.is_selected = self.props.is_selected || false;
        self.list = self.props.list || [];
        for(var el in self.list){
            self.list[el].selected=false;
            if(self.list[el].item==self.value){
              self.list[el].selected=self;
            }
        }
        this.render();
    }
    click_item(event){
      var self = this;
      var item = this.props.list[parseInt($(event.target).data('item-index'))];
      item = item ? item.item : item;
      this.item=item;
      for(var el in this.props.list){
        this.props.list[el].selected=false;
      }
      this.props.list[parseInt($(event.target).data('item-index'))].selected=true;
      if(item==this.value){
        this.props.is_selected=false;
      }else{
        this.props.is_selected=true;
      }
      this.render();
    }
    click_confirm(event){
      var self = this;
      var price=self.props.orderline.price*self.props.orderline.get_unit().factor/self.env.pos.units_by_id[self.item].factor;
      self.props.orderline.price=price;
      self.props.orderline.set_unit(self.item);
      self.props.orderline.price_manually_set=true;
      this.cancel();
    }     
  }
  UnitSelectionPopupWidget.template = 'UnitSelectionPopupWidget';
  UnitSelectionPopupWidget.defaultProps = {
      title: 'Confirm ?',
      value:''
  };
  Registries.Component.add(UnitSelectionPopupWidget)

  // Inherit Orderline----------------
  const PosResOrderline = (Orderline) =>
    class extends Orderline {
      selectLine(event) {
        var self = this;
        super.selectLine(event);
        if (event && event.target && $(event.target).attr('class') == "fa fa-balance-scale"){
          var categ=[];
            for(var key in self.env.pos.units_by_id){
              if(self.env.pos.units_by_id[key].category_id[1]===self.props.line.get_unit().category_id[1]){
                categ.push({item:self.env.pos.units_by_id[key].id,label:self.env.pos.units_by_id[key].display_name,selected:false});
              }
            }
	    console.log("self.props.line",self.props.line.get_unit().i);	
            self.showPopup('UnitSelectionPopupWidget', {
              title: "Select Unit of Measure",
              list: categ,
              value:self.props.line.get_unit().id,
              orderline:self.props.line
            })
        }
      }     
    };
  Registries.Component.extend(Orderline, PosResOrderline);

});
