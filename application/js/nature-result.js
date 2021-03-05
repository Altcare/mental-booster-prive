(function(win, $) {
    // #region setup
    var doc = win.document;
    var _nature = {};
    // #endregion
    

    function nextSlide(id, choice) {
        var current   = parseInt(id);
        var next      = current + 1;      
        var nextSlide = "#slide-" + next;

        if (next <= _nature.nbrQuestions) {            
            win.location.href = nextSlide;         
        }
        else {
            win.location.href = "#slide-finish";
        }
    }


    // Get number of items cheched as TRUE
    function getNatureScore() {
        // TODO load score from localStorage, if comming back
        var list = JSON.parse(win.sessionStorage.getItem('NatureQuizz'));

        var shortList     = list.items.filter(q => q.resp == true);
        var dopamine      = shortList.filter(q => q.neuro == "Dopamine").length;
        var serotonine    = shortList.filter(q => q.neuro == "Sérotonine").length;
        var gaba          = shortList.filter(q => q.neuro == "GABA").length;
        var acetylcholine = shortList.filter(q => q.neuro == "Acétylcholine").length;

        var score = {
            items: list.items,

            dopamine     : dopamine,
            serotonine   : serotonine,
            gaba         : gaba,
            acetylcholine: acetylcholine
        };

        win.localStorage.setItem("NatureScore", JSON.stringify(score));
        return score;
    }

    function showScore(score) {
        // TODO add display logic to hide unwanted slides
        
        var items = [
            {n: "dopamine", v: score.dopamine},
            {n: "serotonine", v: score.serotonine},
            {n: "gaba", v: score.gaba},
            {n: "acetylcholine", v: score.acetylcholine},
        ];

        const max = items.reduce(function(prev, current) {
            return (prev.v > current.v) ? prev : current
        })

        $(".slide-container").css("display", "none");        
        $("#slide-"+max.n+".slide-container").css("display", "block");  
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
        var middle = $(".calc-middle:first").outerHeight();
        var footer = $(".calc-footer:first").outerHeight();

        // resize the remaining area to be scrollable
        var resizeTo = viewPortHeight - (header + middle + footer);

        $(".scrollable").css("overflow","auto");
        $(".scrollable").height(resizeTo - 3); //? where is this comming from ?

        console.log("resize: " + origin);           
    }    

    // #region Exports
    var public =  {
        nextSlide         : nextSlide,
        getNatureScore    : getNatureScore,
    };

    win.quizz = public;
    // #endregion

    // init
    $(doc).ready(function() {
        resize("results");
        var score = getNatureScore();
        console.log(score)        
        showScore(score);

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