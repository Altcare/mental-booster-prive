(function(win, $) {
    // #region setup
    var doc = win.document;
    var _nature = {};
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

    // Load Questions
    function loadQuestions(file) {
        var dfd = jQuery.Deferred();

        // TODO: need to add versioning to localStorage, or not use it
        var nature = null;
        if (nature == null) {
            $.getJSON("js/" + file, function( data ) {
                dfd.resolve(data);
            });
        }
        else {
            dfd.resolve(JSON.parse(nature));
        }        

        return dfd.promise();
    }   
    // #endregion --------------------------------------------- LOADING 

    /**
     * Load template & questions
     */
    function getQuestions() {
        return $.when( loadTemplate("questions.tmpl"), loadQuestions("nature.json") )
            .done( function(template, data) {  
                
                //! just for testing
                var slice = 5;//data.items.length;

                _nature       = data;
                _nature.items = data.items.slice(0, slice);

                var id = 1;                
                var l  = _nature.items.length;
                for (var i=0; i<l; i++) {
                    var content = template
                                    .replaceAll("{na}"   , _nature.items[i].na)
                                    .replaceAll("{sect}" , _nature.items[i].sect)
                                    .replaceAll("{desc}" , _nature.items[i].desc)
                                    .replaceAll("{id}"   , id);

                    id++;
                    $(".slides").append(content);
                } 
            
            _nature.nbrQuestions = l;
            _nature.progessStep  = 100/l;
        });
    }      

    function nextSlide(id, choice) {
        var current   = parseInt(id);
        var next      = current + 1;      
        var nextSlide = "#slide-" + next;

        _nature.items[current-1].resp = choice;
        if (next <= _nature.nbrQuestions) {            
            win.location.href = nextSlide;
            $(".progress div").css("width", (_nature.progessStep * current) + '%');            
        }
        else {
            saveQuizz();
            win.location.href = "#slide-finish";
        }
    }

    function saveQuizz() {
        win.sessionStorage.setItem('NatureQuizz', JSON.stringify(_nature))
    }

    function pageChanged(page) {
        //$(".progress").toggle(/[0-9]]$/.test(page));
        //console.log( page );
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
        var header = $(".calc-header:first").outerHeight();

        // get the height of the main section title & buttons at bottom
        //var middle = $(".slide-item .question").height();
        var middle = $(".calc-page:first").outerHeight() - $(".calc-middle:first").outerHeight();
        var footer = $(".calc-footer:first").outerHeight();
        
        // resize the remaining area to be scrollable
        var resizeTo = viewPortHeight - (header + middle + footer);
        $(".scrollable").css("overflow","auto");
        $(".scrollable").height(resizeTo - 3); //? where is this comming from ?

        console.log("resize: " + origin);           
    }    


    // #region Exports
    var public =  {
        nextSlide: nextSlide,
        resize: resize
    };

    win.quizz = public;
    // #endregion

    // init
    $(doc).ready(function() {
        getQuestions().done(() => resize("getQuestions"));

        $(doc).keypress(function (event) {
            if (event.keyCode === 37 || event.keyCode === 39) {
                // disable keyboard navigation
                //event.preventDefault();
            }
        });   
        
        // get current page
        $(win).on('hashchange', function(e) {            
            pageChanged(window.location.hash);

            resize("hashchange");
        });

        $(win).on("resize", () => resize("resize"));
    });

})(window, jQuery);