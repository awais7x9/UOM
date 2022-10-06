let priceglobal = 0;
let globalunits = 0;
let ranPriceSet = false;
odoo.define('pos_multi_product_uom.productitem', function (require) {
	"use strict";
    var pos_model = require('point_of_sale.models');
    var SuperOrderline = pos_model.Orderline.prototype;
    const Registries = require('point_of_sale.Registries');
    const NumberBuffer = require('point_of_sale.NumberBuffer');
    const Orderline = require('point_of_sale.Orderline');
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const ProductScreen = require('point_of_sale.ProductScreen');
    
    pos_model.load_fields('product.product','uom_ids');
    // console.log("pos_model",pos_model);
    pos_model.Orderline=pos_model.Orderline.extend({
      init_from_JSON: function(json) {
          SuperOrderline.init_from_JSON.call(this,json);
          this.uom_id = json.uom_id;
          // this.uom_ids=this.product.uom_ids;
          // console.log("this.uom_ids",this.uom_ids);
          // console.log("this.uom_id",this.uom_id);
            
        },
        get_unit: function(){
          // console.log("get_unit");  
          // console.log(this)
          
          var unit =SuperOrderline.get_unit.call(this);
               
            if(!this.uom_ids){
              
              return unit;
            }
            var unit_id = this.uom_ids;
            
            for (var i = 0; i < unit_id.length; i++){
              
              return this.pos.units_by_id[unit_id[i]];
            }
            // var unit=SuperOrderline.get_unit.call(this);
            // if(!this.uom_id){
            //   // console.log("return unit",unit);
            //   return unit;
            // }
            // var unit_id = this.uom_id;
            // return this.pos.units_by_id[unit_id];
            
        },
        
        set_unit: function(uom_id){
          
          // console.log("set_unit")
          if(globalunits!=0){
            this.uom_id = globalunits;
            globalunits=0;
          }
          else{
            this.uom_id = uom_id;
          }
          // console.log("set_ubi");
          this.trigger('change', this);
          },

        set_unit_price: function(price){
          if(!ranPriceSet){
            console.log('ran price set and unit set');
          // console.log('price-global',priceglobal);
          // console.log('price',price);
          
          SuperOrderline.set_unit.call(this,globalunits);




          if(!this.price_manually_set){
            var new_price=price;
            // console.log('new price',new_price)
            SuperOrderline.set_unit_price.call(this,new_price);
            
            // console.log(SuperOrderline);
            
          }else{
            SuperOrderline.set_unit_price.call(this,price);
          }
          

          ranPriceSet=true;
      this.trigger('change', this);
        }
        
        ranPriceSet=true;
          
          // if(!this.price_manually_set){
          //   var new_price=(price*this.pos.units_by_id[this.product.uom_ids[0]].factor)/this.get_unit().factor;
          //   SuperOrderline.set_unit_price.call(this,new_price);
          // }
          // else{
          //   SuperOrderline.set_unit_price.call(this,price);
          // }
          // if(!this.price_manually_set){
          //   var new_price=(price*this.pos.units_by_id[this.product.uom_id[0]].factor)/this.get_unit().factor;
          //   SuperOrderline.set_unit_price.call(this,new_price);
          // }else{
          //   SuperOrderline.set_unit_price.call(this,price);
          // }
        },

        export_as_JSON: function() {
          // var pack_lot_ids = SuperOrderline.export_as_JSON.call(this);
          // pack_lot_ids.uom_ids=this.get_unit();
          // console.log("pack_lot_ids",pack_lot_ids);
          // return pack_lot_ids;
          // SuperOrderline.set_unit.call(this,globalunits);
          var pack_lot_ids = SuperOrderline.export_as_JSON.call(this);
          pack_lot_ids.uom_id=this.get_unit().id;

          return pack_lot_ids;
        },
      });
    




    class UnitSelectionPopupWidget extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            var self = this;
            // console.log("Hunain iqbal",self);
            self.item='';
            self.value=''||self.props.value;
            // console.log("self.value",self.value);
            self.props.is_selected = self.props.is_selected || false;
            // console.log("self.props.is_selected",self.props.is_selected);
            self.list = self.props.list || [];
            // console.log("self.list",self.list);
            // for(var el in self.list) {
            //     self.list[el].selected=true;
                
            //     // if(self.list[el].item==self.value){
            //     //     // console.log("self.list[el].item",self.list[el].item);
            //     //   self.list[el].selected=self;
            //     // }
                
            //     // self.list[el].selected=self;
            // }
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
          // SuperOrderline.set_quantity.call(this,1);
          // console.log("conform",this)
          
        //   var self = this;
        //   self.props.orderline.price=100;

        //  // console.log("this.pos.orderline",this.props);
        //  // console.log(self.item);
        //  this.uom_ids=self.item;
          
          
        //   this.props.orderline.by_id.pos.units[self.item]
          
        //   this.cancel();

          var self = this;
          // console.log("self props",self);
          
          self.price=0;
          // console.log(priceglobal);
          priceglobal = self.price;
          globalunits = self.item;
          ranPriceSet=false;
          var obj=document.getElementsByClassName('number-char');
          // console.log(obj);
          // console.log(obj[0]);
          obj[0].click();
          // this.SuperOrderline.set_unit.call(this,globalunits);
          // console.log("globalunits",globalunits);
          // console.log("yourGlobalVariable",priceglobal);
          NumberBuffer.reset();
          // var price=self.props.orderline.price*self.props.orderline.get_unit().factor/self.env.pos.units_by_id[self.item].factor;
          // self.props.orderline.set_unit_price(400);
          // console.log("order line",self.props.orderline)
          // self.props.orderline.set_unit(self.item);
          // self.props.orderline.price_manually_set=true;
          // this.cancel();
          
          // var price=self.props.orderline.price*self.env.pos.units[self.item]/self.env.pos.units_by_id[self.item];
          // self.props.orderline.price=price;
          // self.props.orderline.set_unit(self.env.pos.units[self.item]['name']);
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










    const ProductItempopup = (ProductScreen) =>
    
    class extends ProductScreen {
      constructor() {
        super(...arguments);
      }
      async _clickProduct(event){ 
      console.log('clicked product');
      globalunits=0;
      ranPriceSet=false;

        if (!this.currentOrder) {
          this.env.pos.add_new_order();
      }
      const product = event.detail;
      var options = await this._getAddProductOptions(product);
      // Do not add product if options is undefined.
      if (!options) return;
      // Add the product after having the extra information.
      // options['quantity']=1
      // console.log('options Test',options);
      this.currentOrder.add_product(product, options);
      NumberBuffer.reset(); 
      
                var self = this;
                var pro = event.detail;
                // console.log("pro",pro);
                // console.log("self",self)
                // if (event && event.target && $(event.target).attr('class') == "product"){
                  // console.log('id',pro.uom_ids);
                var categ = [];
                var ShouldPopUpShow=false;
                if (pro.uom_ids !== null){
                for(var index in pro.uom_ids){
                    var key = pro.uom_ids[index];
                   for (var vl in self.env.pos.units){
                    // console.log(self.env.pos.units[vl]);
                    // console.log('id vl',vl['íd']);
                    // console.log('set var')
                    var unitobj=self.env.pos.units[vl];
                    // console.log('objtype',unitobj.id);
                    // console.log('dicttype',unitobj['id']);
                    // console.log('key',key);
                    // console.log('condition===',(unitobj.id===key));
                    // console.log('condition==',(unitobj.id==key));
                    if(unitobj.id==key){
                      // console.log(unitobj.id);
                      categ.push({item:unitobj.id,label:unitobj.name,selected:false});
                      // console.log('name',categ);
                      ShouldPopUpShow=true;

                    }
                            
                    // }
                    } 
                    // if(pro.uom_ids[key].category_id[1]===pro.uom_ids){
                          
                      // categ.push(self.env.pos.units[key]['name']);
                     
                      }
                      // console.log(this.currentOrder);
                      
                      if(ShouldPopUpShow){
                          self.showPopup('UnitSelectionPopupWidget', {
                            title: "Select Unit of Measure",
                            list: categ,
                            value:self.env.pos.units.id, 
                            orderline:this.currentOrder.orderlines
                          });
                        }
                        
                  }
                      // pro.uom_ids.forEach(function(keys){
                      //   categ.push(keys);
                      // });
                    // if (!this.currentOrder) {
                    //     this.env.pos.add_new_order();
                    // }
                    // const product = event.detail;
                    // const options = await this._getAddProductOptions(product);
                    // // Do not add product if options is undefined.
                    // if (!options) return;
                    // // Add the product after having the extra information.
                    // console.log("this",product);
                    // console.log("options",options);
                    // this.currentOrder.add_product(product, options);
                    // NumberBuffer.reset();
                    // console.log("Current Order",this.currentOrder);
                    
                
              
                
                
            }
            
        };
    Registries.Component.extend(ProductScreen, ProductItempopup);
    // Registries.Component.extend(EditListPopup, PosEditlistpopup);

    return ProductScreen;
});
