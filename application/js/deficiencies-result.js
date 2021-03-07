(function(win, $) {
    // #region setup
    var doc = win.document;
    // #endregion
    

    // Get number of items cheched as TRUE
    function getDeficiencyScore() {

        // TODO load score from localStorage, if comming back
        var list = JSON.parse(win.sessionStorage.getItem('DeficiencyQuizz'));

        /**
         * 0-4   : pas de carence : 0
         * 5-9   : dMin           : 1
         * 10-14 : dMoy           : 2
         * 15+   : dMax           : 3
         */            
        function getDeficiencyLevel(value) {
            switch (true) {
                case value <= 4:
                    return 0;

                case value <= 9:
                    return 1;

                case value <= 14:
                    return 2;                                                                   
            }

            return 3;
        }        
        
        var shortList     = list.items.filter(q => q.resp == true);
        var dopamine      = shortList.filter(q => q.neuro == "Dopamine").length;
        var serotonine    = shortList.filter(q => q.neuro == "Sérotonine").length;
        var gaba          = shortList.filter(q => q.neuro == "GABA").length;
        var acetylcholine = shortList.filter(q => q.neuro == "Acétylcholine").length;

        var score = {
            items: list.items,

            dopamine: {
                score: dopamine,
                level: getDeficiencyLevel(dopamine)
            },
            serotonine: {
                score: serotonine,
                level: getDeficiencyLevel(serotonine)
            },
            gaba: {
                score: gaba,
                level: getDeficiencyLevel(gaba)             
            },
            acetylcholine: {
                score: acetylcholine,
                level: getDeficiencyLevel(acetylcholine)        
            },
        };

        win.localStorage.setItem("DeficiencyScore", JSON.stringify(score));
        return score;
    }

    function showDeficiencies(score) {
                
        var items = [
            {n: "dopamine"     , v: score.dopamine.level},
            {n: "serotonine"   , v: score.serotonine.level},
            {n: "gaba"         , v: score.gaba.level},
            {n: "acetylcholine", v: score.acetylcholine.level},
        ];        

        $(".slide-container").hide();
        
        const result = items.filter(c => c.v > 0);        
        result.forEach(c => {
            $("#slide-" + c.n).show();
        });
        
    }

    function changeSlide(currentSlide, e) {  
        e = e || win.event; 
        
        var items = $(".slide-container:visible").length;
        if (items > 1) {
            e.preventDefault();
            $(currentSlide).remove();
        }
    }

    // #region Exports
    var public =  {
        changeSlide       : changeSlide,
        getDeficiencyScore: getDeficiencyScore
    };

    win.quizz = public;
    // #endregion

    // init
    $(doc).ready(function() {                
        var score = getDeficiencyScore();
        showDeficiencies(score);

        if (!!win.isProduction) {            
            $(doc).keypress(function (event) {
                if (event.keyCode === 37 || event.keyCode === 39) {
                    // disable keyboard navigation
                    event.preventDefault();
                }
            });   
        }

        //! Replace with call to save to DataBase
        console.log("Score is in: deficiencies-result.js -> replace with AJAX call to save to DB", score);
    });

})(window, jQuery);