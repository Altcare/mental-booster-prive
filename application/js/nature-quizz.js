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
                _nature = data;

                //! declared at bottom of nature-quizz.html
                if (!!!win.isProduction && !!win.nbrQuizzQuestions) {
                    var neuroA      = data.items.filter(c => c.na == "Neuro-A");
                    var neuroAItems = neuroA.slice(0, win.nbrQuizzQuestions);

                    var neuroB      = data.items.filter(c => c.na == "Neuro-B");
                    var neuroBItems = neuroAItems.concat(neuroB.slice(0, win.nbrQuizzQuestions));
                     
                    var neuroC      = data.items.filter(c => c.na == "Neuro-C");
                    var neuroCItems = neuroBItems.concat(neuroC.slice(0, win.nbrQuizzQuestions));
                    
                    var neuroD      = data.items.filter(c => c.na == "Neuro-D");
                    var neuroDItems = neuroCItems.concat(neuroD.slice(0, win.nbrQuizzQuestions));

                    _nature.items = neuroDItems;
                }

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

            if (current == 1) {
                $(".slide-item .back").css("visibility", "visible");
            }
            
            $(".progress div").css("width", (_nature.progessStep * current) + '%');            
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
            $(".slide-item .back").css("visibility", "hidden");
        }        

        win.location.href = previousSlide;
    }

    function saveQuizz() {
        win.sessionStorage.setItem('NatureQuizz', JSON.stringify(_nature))
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

        if (!!win.isProduction) {            
            $(doc).keypress(function (event) {
                if (event.keyCode === 37 || event.keyCode === 39) {
                    // disable keyboard navigation
                    event.preventDefault();
                }
            });   
        }

        //! INFO
        if (!!!win.isProduction) {
            console.log("Question results are saved to sessionStorage() : NatureQuizz, via saveQuizz()");
        }        
    });

})(window, jQuery);