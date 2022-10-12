(function(){
    let dt = new Date();
    dt = dt.getMinutes() + '-' + dt.getSeconds();
    let scripts = `
    <script type="text/javascript" defer src="/cybat_pos_discount/static/src/js/discount.js?v=${dt}"></script>
    <script type="text/javascript" defer src="/cybat_pos_discount/static/src/js/models.js?v=${dt}"></script>
    `;
    console.log('deferred');
    document.write(scripts);
})();