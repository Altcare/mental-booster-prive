(function(win, $) {
    // #region setup
    var doc = win.document;
    var _deficiencies = {};
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
        var deficiencies = null;
        if (deficiencies == null) {
            $.getJSON("js/" + file, function( data ) {
                dfd.resolve(data);
            });
        }
        else {
            dfd.resolve(JSON.parse(deficiencies));
        }        

        return dfd.promise();
    }    
    // #endregion --------------------------------------------- LOADING 

    /**
     * Load template & questions
     */
    function getQuestions() {
        return $.when( loadTemplate("questions.tmpl"), loadQuestions("deficiencies.json") )
            .done( function(template, data) {     
                
                //! just for testing
                var slice = 5;//data.items.length;

                _deficiencies       = data;
                _deficiencies.items = data.items.slice(0, slice);
                
                var id = 1;                
                var l  = _deficiencies.items.length;
                for (var i=0; i<l; i++) {
                    var content = template
                                    .replaceAll("{na}"   , _deficiencies.items[i].na)
                                    .replaceAll("{sect}" , _deficiencies.items[i].sect)
                                    .replaceAll("{desc}" , _deficiencies.items[i].desc)
                                    .replaceAll("{id}"   , id);

                    id++;
                    $(".slides").append(content);
                }
            
                _deficiencies.nbrQuestions = l;
                _deficiencies.progessStep  = 100/l;

                console.log(_deficiencies)
        });
    }      

    function nextSlide(id, choice, ele) {
        console.log(ele.closest(".slide-container").id);
        var current   = parseInt(id);
        var next      = current + 1;      
        var nextSlide = "#slide-" + next;

        _deficiencies.items[current-1].resp = choice;
        if (next <= _deficiencies.nbrQuestions) {            
            win.location.href = nextSlide;
            $(".progress div").css("width", (_deficiencies.progessStep * current) + '%');            
        }
        else {
            saveQuizz();
            win.location.href = "#slide-finish";
        }
    }

    function saveQuizz() {
        win.sessionStorage.setItem('DeficiencyQuizz', JSON.stringify(_deficiencies))
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
        return;
        
        // what is the viewport height ?
        var viewPortHeight = win.innerHeight;
        
        // set html/body to correct height
        $("html, body").height(viewPortHeight);            
        $("body").css("overflow","hidden");            
                    
        // Remove space used by image at the top
        var topImage = $("img.placeholder").outerHeight();

        // get the height of the main section title & buttons at bottom
        var topTitle      = $(".slide-item .question").outerHeight();
        var bottomButtons = $(".slide-radios").outerHeight();
        
        // resize the remaining area to be scrollable
        // need to remove topTitle on normal pages (intro etc)
        var resizeTo = viewPortHeight - (topImage + topTitle + bottomButtons);
        $(".slide-item .scrollable").css("overflow","auto");
        $(".slide-item .scrollable").height(resizeTo - 3); //? where is this comming from ?

        console.log("resize: " + origin);           
    }         


    // #region Exports
    var public =  {
        nextSlide: nextSlide
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