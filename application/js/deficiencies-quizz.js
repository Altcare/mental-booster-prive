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

            if (current == 1) {
                $(".slide-item .back").show();
            }
                        
            $(".progress div").css("width", (_deficiencies.progessStep * current) + '%');            
        }
        else {
            saveQuizz();
            win.location.href = "#slide-finish";
        }
    }

    function previousSlide(id) {
        var current       = parseInt(id);
        var previous      = current - 1;      
        var previousSlide = "#slide-" + previous;

        if (current == 2) {
            $(".slide-item .back").hide();
        }        

        win.location.href = previousSlide;
    }    

    function saveQuizz() {
        win.sessionStorage.setItem('DeficiencyQuizz', JSON.stringify(_deficiencies))
    }

    function pageChanged(page) {
        //$(".progress").toggle(/[0-9]]$/.test(page));
        //console.log( page );
    }

    // #region Exports
    var public =  {
        nextSlide    : nextSlide,
        previousSlide: previousSlide
    };

    win.quizz = public;
    // #endregion

    // init
    $(doc).ready(function() {                
        getQuestions();

        $(doc).keypress(function (event) {
            if (event.keyCode === 37 || event.keyCode === 39) {
                // disable keyboard navigation
                //event.preventDefault();
            }
        });   
        
        // get current page
        $(win).on('hashchange', function(e) {            
            pageChanged(window.location.hash);
        });
    });

})(window, jQuery);