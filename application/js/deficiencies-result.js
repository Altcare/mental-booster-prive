(function(win, $) {
    // #region setup
    var doc = win.document;
    var _deficiencies = {};
    // #endregion
    

    function nextSlide(id, choice) {
        var current   = parseInt(id);
        var next      = current + 1;      
        var nextSlide = "#slide-" + next;

        if (next <= _deficiencies.nbrQuestions) {            
            win.location.href = nextSlide;           
        }
        else {
            win.location.href = "#slide-finish";
        }
    }

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
        // TODO add display logic to hide unwanted slides
        
        var items = [
            {n: "dopamine", v: score.dopamine.level},
            {n: "serotonine", v: score.serotonine.level},
            {n: "gaba", v: score.gaba.level},
            {n: "acetylcholine", v: score.acetylcholine.level},
        ];

        var nature = items.reduce(function(accumulator, currentValue) {
            return (currentValue.v > 0) ? currentValue : accumulator;
        })
    }

    function pageChanged(page) {
        //$(".progress").toggle(/[0-9]]$/.test(page));
    }

    // #region Exports
    var public =  {
        nextSlide         : nextSlide,
        getDeficiencyScore: getDeficiencyScore
    };

    win.quizz = public;
    // #endregion

    // init
    $(doc).ready(function() {                
        var score = getDeficiencyScore();
        showDeficiencies(score);

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