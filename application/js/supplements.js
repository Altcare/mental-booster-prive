(function(win, $) {
    // #region setup
    var doc = win.document;

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
                                        .split("{neuro}").join(_supplements.items[i].neuro)
                                        .split("{title}").join(_supplements.items[i].title)
                                        .split("{dMin}").join(_supplements.items[i].dMin)
                                        .split("{dMoy}").join(_supplements.items[i].dMoy)
                                        .split("{dMax}").join(_supplements.items[i].dMax)
                                        .split("{desc}").join(_supplements.items[i].desc)                                        
                                        .split("{file}").join(_supplements.items[i].file)
                                        .split("{supplementId}").join(_supplements.items[i].supplementId)
                                        .split("{default}").join(_supplements.items[i].default)

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
                        var content = template
                                        .split("{neuro}").join(_products.items[i].neuro)
                                        .split("{title}").join(_products.items[i].title)
                                        .split("{desc}").join(_products.items[i].desc)                                                                                
                                        .split("{dMin}").join(_products.items[i].dMin)
                                        .split("{dMoy}").join(_products.items[i].dMoy)
                                        .split("{dMax}").join(_products.items[i].dMax)
                                        .split("{file}").join(_products.items[i].file)
                                        .split("{productId}").join(_products.items[i].productId)                                        
                                        .split("{link}").join(_products.items[i].link)
                                        .split("{default}").join(_products.items[i].default)

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
        let acetylcholine = $("[data-neuro='Ac??tylcholine']", supplements);
        let gaba          = $("[data-neuro='GABA']"         , supplements);
        let serotonine    = $("[data-neuro='S??rotonine']"   , supplements);
        let _default      = $("[data-default='1']"          , supplements);

        filterDisplay(dopamine     , items.dopamine);
        filterDisplay(acetylcholine, items.acetylcholine);
        filterDisplay(gaba         , items.gaba);
        filterDisplay(serotonine   , items.serotonine);         
        filterDisplay(_default     , items, items.acetylcholine.score < 5 && items.dopamine.score < 5 && items.gaba.score < 5 && items.serotonine.score < 5);

        function filterDisplay(ele, data, isDefault) {
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
            } else {
                if(isDefault) {
                    console.log('default')
                    ele.each(function() {
                        let item = $(this);
                        $(".dosage.amount", item).html(item.data("dmin"));
                    });
                    ele.show();
                }
            }
        } 
        for(let i = 0; i<supplements.children().length; i++) {
            if(supplements.children()[i].style.display === 'block'){
                const $div = $('div.'+supplements.children()[i].dataset.supplementid);
                if ($div.length > 1) {
                    $($div).each(function(e) {
                        const item = $(this);

                        let dosage = parseInt($(item).find('.dosage.amount').text().replace ( /[^\d.]/g, '' ));
                        $($div).each(function(e) {
                            const _item = $(this);
                            const _dosage = parseInt($(_item).find('.dosage.amount').text().replace ( /[^\d.]/g, '' ));
                            if(dosage > _dosage) $(_item).addClass('remove');
                            else if($(item)[0] != $(_item)[0] && !$(item).hasClass('remove') && dosage >= _dosage)
                                $(_item).addClass('remove');
                        });
                    });
                    $('.remove').remove();
                }    
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
        let acetylcholine = $("[data-neuro='Ac??tylcholine']", products);
        let gaba          = $("[data-neuro='GABA']"         , products);
        let serotonine    = $("[data-neuro='S??rotonine']"   , products);
        let _default      = $("[data-default='1']"          , products);

        filterDisplay(dopamine     , items.dopamine);
        filterDisplay(acetylcholine, items.acetylcholine);
        filterDisplay(gaba         , items.gaba);
        filterDisplay(serotonine   , items.serotonine);
        filterDisplay(_default     , items, items.acetylcholine.score < 5 && items.dopamine.score < 5 && items.gaba.score < 5 && items.serotonine.score < 5);

        function filterDisplay(ele, data, isDefault) {
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

                            _recommendations.push({
                                neuro  : item.data("neuro"),
                                name   : item.data("title"),
                                img    : item.data("file"),
                                dosage : item.data("desc"),
                                link   : item.data("link"),
                                carence: data.level
                            });
                    }
                });                
            } else {
                if(isDefault) {
                    $(ele).each(function() {
                        let item = $(this);
                        item.show();     
    
                        _recommendations.push({
                            neuro  : item.data("neuro"),
                            name   : item.data("title"),
                            img    : item.data("file"),
                            dosage : item.data("desc"),
                            link   : item.data("link"),
                            carence: data.level
                        });
                    });
                }
            }
        }  
        for(let i = 0; i<products.children().length; i++) {
            if(products.children()[i].style.display === 'block'){
                const $div = $('div.'+products.children()[i].dataset.productid);
                if ($div.length > 1) {
                    $($div).each(function(e) {
                        const item = $(this);
                        
                        const dosage = parseInt($(item).find('.dosage.title').text());
                        $($div).each(function(e) {
                            const _item = $(this);
                            if(item[0].style.display === 'block') {
                            const _dosage = parseInt($(_item).find('.dosage.title').text());

                            if(dosage > _dosage) $(_item).addClass('remove');
                                else if($(item)[0] != $(_item)[0] && !$(item).hasClass('remove') && dosage >= _dosage)
                                    $(_item).addClass('remove');
                            }
                        });
                    });
                    $('.remove').remove();
                }    
            }
        }
    }   
    
    function saveRecommendations() {    
        win.localStorage.setItem("Recommendations", JSON.stringify(_recommendations));
    }

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
        
        //! Replace with call to save to DataBase
        if (!!!win.isProduction) {
            console.log("Recommendations results are saved to localStorage() : Recommendations, via saveRecommendations()");
        }        
    });

})(window, jQuery);