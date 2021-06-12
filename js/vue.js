const app = Vue.createApp({
    data() {
        return {
            randomizedCards: [],
            flippedCards: [],
            removedCards: [],
            wonGameStatus: false,
            score: 0,
            seconds: "00",
            minutes: 0,
            blocked: false
        }
    },
    created() {
        for(let i=0;i<pictures.length;i++){
            this.randomizedCards.push(i)
        }
        this.shuffleCards(this.randomizedCards)

        // Will use your saved data if it's available
        if(this.getCookie("save")){
            var save = JSON.parse(atob(this.getCookie("save")))
            this.score = save.score
            this.seconds = save.seconds
            this.minutes = save.minutes
            this.randomizedCards = save.cardLayout
            this.removedCards = save.cardRemoved

            setTimeout(function(){
                for(let i=0;i<save.cardRemoved.length;i++) {
                    let card = document.getElementsByClassName("card")[parseInt(save.cardRemoved[i])]
                    card.classList.add("invis")
                    card.style.backgroundImage="url(img/"+pictures[save.cardLayout[parseInt(save.cardRemoved[i])]].img+".png)"
                }
            }, 50)
            
        }
        
        this.startCounter()
    },
    computed: {
        time() {
            return this.minutes+":"+this.seconds
        }
    },
    methods: {
        /** Unflip all the cards, clear the arrays and give an error message */
        unflipAllCards() {
            alert("Oopsie, looks like that wasn't right.")
            while(document.getElementsByClassName("flipped").length > 0) {
                document.getElementsByClassName("flipped")[0].removeAttribute("style")
                document.getElementsByClassName("flipped")[0].classList.remove("flipped")
            }
            if(this.score > 0){this.score -= 1}
            this.flippedCards = []
            this.blocked = false
        },
        /** Flips a single card if it's the same type as other flipped cards */
        flipCard(el) {
            if(this.blocked == false){
                if(this.removedCards.indexOf(el.target.id) != -1 || el.target.classList.contains("flipped") ){ return }
                el.target.classList.add("flipped")
                const self = this
                setTimeout(function(){
                    el.target.style.backgroundImage="url(img/"+pictures[self.randomizedCards[el.target.id]].img+".png)"
                }, 150)
                if(this.flippedCards.length != 0 && this.flippedCards.indexOf(pictures[this.randomizedCards[el.target.id]].type) == -1) {
                    this.blocked = true
                    setTimeout(function() {
                        self.unflipAllCards()
                    }, 600)
                }

                this.flippedCards.push(pictures[this.randomizedCards[el.target.id]].type)

                // Flips the cards and gives you 20 points if you get 4 cards of the same type
                if (this.flippedCards.length >= 4) {
                    this.score += 20
                    for(let i=1;i<this.flippedCards.length;i++){
                        if(this.flippedCards[i-1] == this.flippedCards[i]){
                            continue
                        }
                        this.unflipAllCards()
                        return
                    }
                    while(document.getElementsByClassName("flipped").length > 0) {
                        this.removedCards.push(document.getElementsByClassName("flipped")[0].getAttribute("id"))
                        document.getElementsByClassName("flipped")[0].classList.add("invis")
                        document.getElementsByClassName("flipped")[0].classList.remove("flipped")
                    }
                    this.flippedCards = []
                }

                if(this.removedCards.length >= 52){
                    this.wonGame();
                }
            }
        },
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
                document.getElementsByClassName("flipped")[0].removeAttribute("style")
                document.getElementsByClassName("flipped")[0].classList.remove("flipped")
            }
            while(document.getElementsByClassName("invis").length > 0) {
                document.getElementsByClassName("invis")[0].removeAttribute("style")
                document.getElementsByClassName("invis")[0].classList.remove("invis")
            }
            this.shuffleCards(this.randomizedCards)
            this.removedCards = []
            this.score = 0
            this.seconds = "00"
            this.minutes = 0
            document.getElementsByClassName("on-screen")[0].classList.remove("d-none");
            document.getElementsByClassName("on-screen")[1].classList.add("d-none");
        },
        /** Adds 1 second to the timer every second, also saves a cookie with save data */
        startCounter(){
            const self = this
            this.toggleTutorial
            setInterval(function(){
                self.seconds = parseInt(self.seconds) + 1;
                if (self.seconds > 59) {
                    self.minutes += 1;
                    self.seconds = "00";
                } else if (self.seconds < 10) {
                    self.seconds = "0" + self.seconds;
                }
                self.setCookie("save", btoa(JSON.stringify({
                    "score": self.score,
                    "seconds": self.seconds,
                    "minutes": self.minutes,
                    "cardLayout": self.randomizedCards,
                    "cardRemoved": self.removedCards
                })), 7)
            }, 999.9)
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
                document.getElementById("dark-bg").classList.toggle("d-none");
                document.getElementsByClassName("on-screen")[0].classList.add("d-none");
                document.getElementsByClassName("on-screen")[1].classList.remove("d-none");
                this.wonGameStatus = true
            }
        },
        /** to tweet or share your score (Typed in Dutch) */
        shareButton(type){
            var str = "Wow, ik heb zojuist " + this.score + " punten van 260 gescoord in " + this.time + " op een te gekke memory game!";
            if(type == "tweet"){
                window.open("https://twitter.com/intent/tweet?text=" + encodeURI(str));
            }
            
        },
        getCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
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
        setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }
    }
})

app.mount("body")