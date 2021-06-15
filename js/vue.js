const app = Vue.createApp({
    data() {
        return {
            randomizedCards: [],
            compliment: ["Goedzo!", "Goed gedaan!", "Nice!", "Klopt helemaal!", "Ik ben trots op jou!", "Slimme koekie hoor!", "DAYUMM!!!", "Zoinks!", "Wouwiieee"],
            error: ["Dat klopt niet", "Oopsie", "Uh oh", "Hmmmmm", "Ietsjes anders", "Niet helemaal", "Niet opgeven!", "Bijna!", "Dichtbij!"],
            msgWindow: document.getElementById("msgWindow"),
            onScreen: document.getElementsByClassName("on-screen"),
            flippedCards: [],
            removedCards: [],
            counter: [],
            wonGameStatus: false,
            score: 0,
            seconds: "00",
            minutes: 0,
            blocked: false
        };
    },
    created() {
        for(let i=0;i<pictures.length;i++){
            this.randomizedCards.push(i);
        }
        this.shuffleCards(this.randomizedCards);
        
        // Will use your saved data if it's available
        if(this.getCookie("save")){
            var save = JSON.parse(atob(this.getCookie("save")));
            this.score = save.score;
            this.seconds = save.seconds;
            this.minutes = save.minutes;
            this.randomizedCards = save.cardLayout;
            this.removedCards = save.cardRemoved;

            setTimeout(function(){
                for(let i=0;i<save.cardRemoved.length;i++) {
                    let card = document.getElementsByClassName("card")[parseInt(save.cardRemoved[i])];
                    card.classList.add("invis");
                    card.style.backgroundImage="url(img/"+pictures[save.cardLayout[parseInt(save.cardRemoved[i])]].img+".png)";
                }
            }, 100);
        }
        this.startCounter();
    },
    computed: {
        time() {
            return this.minutes+":"+this.seconds;
        }
    },
    methods: {
        /** Unflip all the cards, clear the arrays and give an error message */
        unflipAllCards() {
            // the staircase of Timeouts was made so the animations run smoothly and removes all classes afterwards
            while(document.getElementsByClassName("flipped").length > 0) {
                let item = document.getElementsByClassName("flipped")[0];
                item.classList.remove("flipped");
                setTimeout(function () {
                    item.classList.add("unflip");
                    setTimeout(function () {
                        item.removeAttribute("style");
                        setTimeout(function () {
                            item.classList.remove("unflip");
                        }, 150);
                    }, 150);
                }, 50);
            }
            if(this.score > 0){ this.score -= 1; }
            this.flippedCards = [];
            this.blocked = false;
        },
        /** Flips a single card if it's the same type as other flipped cards */
        flipCard(el) {
            if(this.blocked == false){
                if(this.removedCards.indexOf(el.target.id) != -1 || el.target.classList.contains("flipped") ){ return; }
                el.target.classList.add("flipped");
                const self = this;
                setTimeout(function(){
                    el.target.style.backgroundImage="url(img/"+pictures[self.randomizedCards[el.target.id]].img+".png)";
                }, 150);
                if(this.flippedCards.length != 0 && this.flippedCards.indexOf(pictures[this.randomizedCards[el.target.id]].type) == -1) {
                    this.blocked = true;
                    this.randomMessage(false);
                    setTimeout(function() {
                        self.unflipAllCards();
                    }, 1400);
                }

                this.flippedCards.push(pictures[this.randomizedCards[el.target.id]].type);

                // Flips the cards and gives you 20 points if you get 4 cards of the same type
                if (this.flippedCards.length >= 4) {
                    this.score += 20;
                    for(let i=1;i<this.flippedCards.length;i++){
                        if(this.flippedCards[i-1] == this.flippedCards[i]){
                            continue;
                        }
                        this.randomMessage(false);
                        this.unflipAllCards();
                        return;
                    }

                    // to remove the chosen cards from the game
                    while(document.getElementsByClassName("flipped").length > 0) {
                        this.removedCards.push(document.getElementsByClassName("flipped")[0].getAttribute("id"));
                        document.getElementsByClassName("flipped")[0].classList.add("invis");
                        document.getElementsByClassName("flipped")[0].classList.remove("flipped");
                    }
                    this.randomMessage(true);
                    this.flippedCards = [];
                }

                if(this.removedCards.length >= 52){
                    this.wonGame();
                }
            }
        },
        /** Sends a random message */
        randomMessage(won) {
            var self = this;

            // Timeout is used so it doesn't feel to weird after getting a wrong combination
            setTimeout(function() {
                if(won) {
                    msgWindow.textContent = self.compliment[parseInt(self.compliment.length * Math.random())];
                } else {
                    msgWindow.textContent = self.error[parseInt(self.error.length * Math.random())];
                }

                // To display and remove the window with a custom message
                msgWindow.classList.add("active"), 
                setTimeout(function () { 
                    msgWindow.classList.remove("active"); 
                }, 1100); 
            }, 200);
        },
        /** Shuffles the given array */
        shuffleCards(a) {
            for(let i=a.length-1;i>0;i--){
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
        },
        /** Resets the score, empties the arrays and reshuffles the cards */
        resetGame(){
            document.getElementById("dark-bg").classList.add("d-none");
            while(document.getElementsByClassName("flipped").length > 0) {
                document.getElementsByClassName("flipped")[0].removeAttribute("style");
                document.getElementsByClassName("flipped")[0].classList.remove("flipped");
            }
            while(document.getElementsByClassName("invis").length > 0) {
                document.getElementsByClassName("invis")[0].removeAttribute("style");
                document.getElementsByClassName("invis")[0].classList.remove("invis");
            }
            clearInterval(this.counter);
            this.shuffleCards(this.randomizedCards);
            this.removedCards = [];
            this.score = 0;
            this.seconds = "00";
            this.minutes = 0;
            this.onScreen[0].classList.remove("d-none");
            this.onScreen[1].classList.add("d-none");
            document.getElementById("dark-bg").classList.add("d-none");
            this.wonGameStatus = false;
            this.startCounter();
        },
        /** Adds 1 second to the timer every second, also saves a cookie with save data */
        startCounter(){
            const self = this;
            this.toggleTutorial;
            this.counter = setInterval(function(){
                self.seconds = parseInt(self.seconds) + 1;
                if (self.seconds > 59) {
                    self.minutes += 1;
                    self.seconds = "00";
                } else if (self.seconds < 10) {
                    self.seconds = "0" + self.seconds;
                }
                // Saves the cookie with all the game data
                self.setCookie("save", btoa(JSON.stringify({
                    "score": self.score,
                    "seconds": self.seconds,
                    "minutes": self.minutes,
                    "cardLayout": self.randomizedCards,
                    "cardRemoved": self.removedCards
                })));
            }, 999.9);
        },
        /** Toggles the tutorial screen, unless you have won the game */
        toggleTutorial() {
            if(this.wonGameStatus == false) {
                document.getElementById("dark-bg").classList.toggle("d-none");
            }
        },
        /** Swaps the tutorial screen for the "won game" screen and opens it*/
        wonGame() {
            if(this.wonGameStatus == false) {
                clearInterval(this.counter);
                document.getElementById("dark-bg").classList.toggle("d-none");
                this.onScreen[0].classList.add("d-none");
                this.onScreen[1].classList.remove("d-none");
                this.wonGameStatus = true;
            }
        },
        /** to tweet or share your score (Typed in Dutch) */
        shareButton(type){
            var str = "Wow, ik heb zojuist " + this.score + " punten van 260 gescoord in " + this.time + " op een te gekke memory game!";
            if(type == "tweet"){
                window.open("https://twitter.com/intent/tweet?text=" + encodeURI(str));
            }
            
        },
        /** a function to find a function and retrieve the value */
        getCookie(cname) {
            var name = cname + "=";
            var ca = decodeURIComponent(document.cookie).split(';');
            for(var i=0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },
        /** Makes a new cookie with a certain value */
        setCookie(cname, cvalue) {
            var d = new Date();
            d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        },
        /** console.logs the right cards */
        consoleLogAnswers(){
            var arr = {};
            var cls = document.getElementsByClassName("card");
            for(let i=0;i<pictures.length;i++){
                arr[i] = pictures[this.randomizedCards[cls[i].getAttribute("id")]].type;
            }
            console.log(arr);
        }
    }
});

app.mount("body");