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
                _deficiencies = data;
                
                //! declared at bottom of deficiencies-quizz.html
                if (!!!win.isProduction && !!win.nbrQuizzQuestions) {

                    var neuroA      = data.items.filter(c => c.na == "Neuro-A");
                    var neuroAItems = neuroA.slice(0, win.nbrQuizzQuestions);

                    var neuroB      = data.items.filter(c => c.na == "Neuro-B");
                    var neuroBItems = neuroAItems.concat(neuroB.slice(0, win.nbrQuizzQuestions));
                     
                    var neuroC      = data.items.filter(c => c.na == "Neuro-C");
                    var neuroCItems = neuroBItems.concat(neuroC.slice(0, win.nbrQuizzQuestions));
                    
                    var neuroD      = data.items.filter(c => c.na == "Neuro-D");
                    var neuroDItems = neuroCItems.concat(neuroD.slice(0, win.nbrQuizzQuestions));

                    _deficiencies.items = neuroDItems;
                }                
                
                var id = 1;                
                var l  = _deficiencies.items.length;
                for (var i=0; i<l; i++) {
                    var content = template
                                    .split("{na}").join(_deficiencies.items[i].na)
                                    .split("{sect}").join(_deficiencies.items[i].sect)
                                    .split("{desc}").join(_deficiencies.items[i].desc)
                                    .split("{id}").join(id);

                    id++;
                    $(".slides").append(content);
                }
            
                _deficiencies.nbrQuestions = l;
                _deficiencies.progessStep  = 100/l;
        });
    }      

    function nextSlide(id, choice) {
        var current   = parseInt(id);
        var next      = current + 1;      
        var nextSlide = "#slide-" + next;

        _deficiencies.items[current-1].resp = choice;
        if (next <= _deficiencies.nbrQuestions) {            
            win.location.href = nextSlide;

            if (current == 1) {
                $(".slide-item .back").css("visibility", "visible"); 
            }
                        
            $(".progress div").css("width", (_deficiencies.progessStep * current) + '%');            
        }
        else {
            let a = 0;
            let d = 0;
            let g = 0;
            let s = 0;

            let count = _deficiencies.items.filter(function(item) {
                if (item.resp == true) {
                    switch (item.neuro) {
                        case "Acétylcholine":
                            a++;
                            break;
                        case "Dopamine":
                            d++;
                            break;
                        case "GABA":
                            g++;
                            break;
                        case "Sérotonine":
                            s++;
                            break;                                                                        
                    }
                }

                return item.resp == true;
            });

            if (count.length == 0) {
                win.location.href = "#slide-undetermined";
            }
            else if ( (a < 5) && (d < 5) && (g < 5) && (s < 5)) {
               saveQuizz();
                win.location.href = "#slide-finish";
            }
            else {
                saveQuizz();
                win.location.href = "#slide-finish";                
            }
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
        win.localStorage.setItem('DeficiencyQuizz', JSON.stringify(_deficiencies))
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
            console.log("Question results are saved to localStorage() : DeficiencyQuizz, via saveQuizz()");
        }       
    });

})(window, jQuery);