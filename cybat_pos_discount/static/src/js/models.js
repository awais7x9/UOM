odoo.define('cybat_pos_discount.employees', function (require) {
    "use strict";

var models = require('point_of_sale.models');

var posmodel_super = models.PosModel.prototype;
models.PosModel = models.PosModel.extend({
    load_server_data: function () {
        var self = this;
        return posmodel_super.load_server_data.apply(this, arguments).then(function () {
            var employee_ids = _.map(self.employees, function(employee){return employee.id;});
            console.log('opo');
            var records = self.rpc({
                model: 'hr.employee',
                method: 'get_barcodes_and_pin_hashed',
                args: [employee_ids],
            });
            return records.then(function (employee_data) {
                self.employees.forEach(function (employee) {
                    var data = _.findWhere(employee_data, {'id': employee.id});
                    if (data !== undefined){
                        employee.barcode = data.barcode;
                        employee.pin = data.pin;
                        employee.pos_fixed_discount_limit = data.pos_fixed_discount_limit;
                        employee.pos_percentage_discount_limit = data.pos_percentage_discount_limit;
                    }
                });
            });
        });
    },

});

});
