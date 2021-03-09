(function(win, $) {
    // #region setup
    var doc = win.document;
    // #endregion
    
    // Get number of items cheched as TRUE
    function getNatureScore() {
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
        filterNature(score);

        return score;
    }

    function filterNature(score) {

        var items = [
            {n: "dopamine"     , v: score.dopamine},
            {n: "serotonine"   , v: score.serotonine},
            {n: "gaba"         , v: score.gaba},
            {n: "acetylcholine", v: score.acetylcholine},
        ];

        const max = items.reduce(function(prev, current) {
            return (prev.v > current.v) ? prev : current;
        });

        $(".slide-container").hide();
        $("#slide-" + max.n).show();
    }
    // #endregion

    // init
    $(doc).ready(function() {
        var score = getNatureScore();
        
        if (!!win.isProduction) {            
            $(doc).keypress(function (event) {
                if (event.keyCode === 37 || event.keyCode === 39) {
                    // disable keyboard navigation
                    event.preventDefault();
                }
            });
        }

        //! Replace with call to save to DataBase
        if (!!!win.isProduction) {
            console.log("Score is in: nature-result.js -> replace with AJAX call to save to DB", score);
            console.log("Score results are also saved to localStorage() : NatureScore, via getNatureScore()");
        }
    });

})(window, jQuery);