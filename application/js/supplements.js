(function(win, $) {
    // #region setup
    var doc = win.document;
    var _supplements = {};
    var _products    = {};    
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
                //win.localStorage.setItem('supplements', JSON.stringify(data))
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
                        var content = template
                                        .replaceAll("{title}", _products.items[i].title)
                                        .replaceAll("{file}" , _products.items[i].file)
                                        .replaceAll("{neuro}", _products.items[i].neuro)
                                        .replaceAll("{dMin}" , _products.items[i].dMin)
                                        .replaceAll("{dMoy}" , _products.items[i].dMoy)
                                        .replaceAll("{dMax}" , _products.items[i].dMax)
                                        .replaceAll("{desc}" , _products.items[i].desc)
                                        .replaceAll("{link}" , _products.items[i].link)

                    $("#products").append(content);
                }
        });
    }

    /**
     * Resize needs to happen on pageload after questions are bound
     * And on any resize/hashchange event
     */
    function resize(origin) {
        // comment to deactivate and test via CSS
        //return;

        // what is the viewport height ?
        var viewPortHeight = win.innerHeight;
        
        // set html/body to correct height
        $("html, body").height(viewPortHeight);            
        $("body").css("overflow","hidden");            
        
        // Remove space used by image at the top
        var header = $(".calc-header").outerHeight();
        
        // get the height of the main section title & buttons at bottom
        var middle = $(".calc-page").outerHeight() - $(".calc-middle").outerHeight();
        var footer = $(".calc-footer").outerHeight();
        
        // resize the remaining area to be scrollable
        var resizeTo = viewPortHeight - (header + middle + footer);
        $(".scrollable").css("overflow","auto");
        $(".scrollable").height(resizeTo - 14); //? where is that 14 comming from ?

        console.log("resize: " + origin);           
    }      

    
    // #region Exports
    var public =  {
        _supplements: _supplements
    };

    win.supplements = public;
    // #endregion

    // init
    $(doc).ready(function() {
        resize("initial");

        getSupplements().done(() => {
            resize("getSupplements");
            getProducts().done(() => resize("getProducts"));
        });        

        $(win).on("resize", () => resize("resize"));              
    });

})(window, jQuery);