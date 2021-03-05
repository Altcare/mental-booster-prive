(function(win, $) {
    // #region setup
    var doc = win.document;

    //! https does not work on this machine
    var _affiliateURL = "http://51.210.245.108:81/mentalbooster/redirect.php?productId={productId}";

    var _supplements     = {};
    var _products        = {};   
    var _recommendations = []; 
    // #endregion    

    // #region  --------------------------------------------- LOADING    
    // Load Template
    function loadTemplate(file) {
        var dfd = jQuery.Deferred();

        $.get( "templates/" + file, function( data ) {
            dfd.resolve(data);
        });

        return dfd.promise();
    }

    // Load Data
    function loadJson(file) {
        var dfd = jQuery.Deferred();

        // TODO: need to add versioning to localStorage, or not use it
        let items = win.localStorage.getItem('supplements');
        if (items == null) {
            $.getJSON("js/" + file, function( data ) {
                dfd.resolve(data);
            });
        }
        else {
            dfd.resolve(JSON.parse(items));
        }        

        return dfd.promise();
    }    
    // #endregion --------------------------------------------- LOADING 

    /**
     * Load template & questions
     */
    function getSupplements() {
        return $.when( loadTemplate("supplements.tmpl"), loadJson("supplements.json") )
                .done( function(template, data) {  
                    _supplements = data;
                
                    var l  = _supplements.items.length;
                    for (var i=0; i<l; i++) {
                        var content = template
                                        .replaceAll("{title}", _supplements.items[i].title)
                                        .replaceAll("{file}" , _supplements.items[i].file)
                                        .replaceAll("{desc}" , _supplements.items[i].desc)
                                        .replaceAll("{dMin}" , _supplements.items[i].dMin)
                                        .replaceAll("{dMoy}" , _supplements.items[i].dMoy)
                                        .replaceAll("{dMax}" , _supplements.items[i].dMax)
                                        .replaceAll("{neuro}", _supplements.items[i].neuro)

                    $("#supplements").append(content);
                }
        });
    }

    function getProducts() {
        return $.when( loadTemplate("products.tmpl"), loadJson("products.json") )
                .done( function(template, data) {  
                    _products = data;
                
                    var l  = _products.items.length;
                    for (var i=0; i<l; i++) {
                        let link = _affiliateURL.replaceAll("{productId}" , _products.items[i].productId);

                        var content = template
                                        .replaceAll("{title}"     , _products.items[i].title)
                                        .replaceAll("{file}"      , _products.items[i].file)
                                        .replaceAll("{neuro}"     , _products.items[i].neuro)
                                        .replaceAll("{dMin}"      , _products.items[i].dMin)
                                        .replaceAll("{dMoy}"      , _products.items[i].dMoy)
                                        .replaceAll("{dMax}"      , _products.items[i].dMax)
                                        .replaceAll("{desc}"      , _products.items[i].desc)
                                        .replaceAll("{productId}" , _products.items[i].productId)                                        
                                        .replaceAll("{link}"      , link)

                    $("#products").append(content);
                }
        });
    }


    function filterSupplements() {
        //? maybe this can be moved to CSS now
        let supplements = $("#supplements");
        $(".item", supplements).hide();

        let deficiencyScore = win.localStorage.getItem("DeficiencyScore");

        let items;
        if (!!deficiencyScore) {
            items = JSON.parse(deficiencyScore);
        }
        else {
            throw 'localStorage.getItem("DeficiencyScore") cannot be empty';
        }

        let dopamine      = $("[data-neuro='Dopamine']"     , supplements);
        let acetylcholine = $("[data-neuro='Acétylcholine']", supplements);
        let gaba          = $("[data-neuro='GABA']"         , supplements);
        let serotonine    = $("[data-neuro='Sérotonine']"   , supplements);

        filterDisplay(dopamine     , items.dopamine);
        filterDisplay(acetylcholine, items.acetylcholine);
        filterDisplay(gaba         , items.gaba);
        filterDisplay(serotonine   , items.serotonine);         

        function filterDisplay(ele, data) {
            // levels: 0 1 2 3
            if (data.level > 0) {                
                switch (data.level) {
                    case 1: {
                        ele.each(function() {
                            let item = $(this);
                            $(".dosage.amount", item).html(item.data("dmin"));
                        });
                        break;
                    }
                    case 2: {
                        $(ele).each(function() {
                            let item = $(this);
                            $(".dosage.amount", item).html(item.data("dmoy"));
                        });
                        break;
                    }
                    case 3: {
                        $(ele).each(function() {
                            let item = $(this);
                            $(".dosage.amount", item).html(item.data("dmax"));
                        });
                        break;
                    }
                }
                
                ele.show();
            }
        }       
    }

    function filterProducts() {
        //? maybe this can be moved to CSS now
        let products = $("#products");
        $(".item", products).hide();        
      
        let deficiencyScore = win.localStorage.getItem("DeficiencyScore");

        let items;
        if (!!deficiencyScore) {
            items = JSON.parse(deficiencyScore);
        }
        else {
            throw 'localStorage.getItem("DeficiencyScore") cannot be empty';
        }        

        let dopamine      = $("[data-neuro='Dopamine']"     , products);
        let acetylcholine = $("[data-neuro='Acétylcholine']", products);
        let gaba          = $("[data-neuro='GABA']"         ,products);
        let serotonine    = $("[data-neuro='Sérotonine']"   , products);

        filterDisplay(dopamine     , items.dopamine);
        filterDisplay(acetylcholine, items.acetylcholine);
        filterDisplay(gaba         , items.gaba);
        filterDisplay(serotonine   , items.serotonine);          

        function filterDisplay(ele, data) {   
            // if level is at least > 0
            if (data.level > 0) {

                // decide if needs to be displayed
                $(ele).each(function() {
                    let item = $(this);
                    
                    let dMin = !!item.data("dmin");
                    let dmoy = !!item.data("dmoy");
                    let dMax = !!item.data("dmax");

                    // only show elements that correspond to my level of deficiency
                    if (
                           (dMin && data.level == 1)
                        || (dmoy && data.level == 2)
                        || (dMax && data.level == 3)
                        ) {
                            item.show();                            
                            _recommendations.push(item.data("productid"));
                    }
                });                
            }
        }  
    }   
    
    function saveRecommendations() {    
        win.localStorage.setItem("recommendations", _recommendations);
    }

    // #region Exports
    var public =  {
        _supplements: _supplements
    };

    win.supplements = public;
    // #endregion

    // init
    $(doc).ready(function() {
        getSupplements().done(() => {
            //? this could be moved to getSupplements() if resize is not needed
            filterSupplements();            

            getProducts().done(() => {
                //? this could be moved to getProducts() if resize is not needed
                filterProducts();
                saveRecommendations();
            });
        });        
    });

})(window, jQuery);