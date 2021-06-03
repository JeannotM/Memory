const app = Vue.createApp({
    data() {
        return {
            randomizedCards: [],
            sortedCards: [],
            flippedCards: [],
            removedCards: [],
            score: 0,
            seconds: "00",
            minutes: 0,
            blocked: false
        }
    },
    created() {
        for(let i=0;i<pictures.length;i++){
            this.randomizedCards.push(i)
            this.sortedCards.push(i)
        }
        this.shuffleCards(this.randomizedCards)
        this.startCounter()
        var tmpArr = {}
        for(let i=0;i<this.randomizedCards.length;i++){
            tmpArr[i] = pictures[this.randomizedCards[i]].type
        }
        console.log(tmpArr)
    },
    computed: {
        time() {
            return this.minutes+":"+this.seconds
        }
    },
    methods: {
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
        flipCard(el) {
            if(this.blocked == false){
                if(this.removedCards.indexOf(el.target.id) != -1 || el.target.classList.contains("flipped") ){ return }
                console.log(el.target.id)
                el.target.classList.add("flipped")
                const self = this
                setTimeout(function(){
                    el.target.style.backgroundImage="url(img/"+pictures[self.randomizedCards[el.target.id]].img+".png)"
                }, 150)
                console.log(this.flippedCards.length)
                if(this.flippedCards.length != 0 && this.flippedCards.indexOf(pictures[this.randomizedCards[el.target.id]].type) == -1) {
                    this.blocked = true
                    setTimeout(function() {
                        self.unflipAllCards()
                    }, 600)
                }

                this.flippedCards.push(pictures[this.randomizedCards[el.target.id]].type)

                if (this.flippedCards.length >= 4) {
                    this.score += 4
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
            }
        },
        shuffleCards(a) {
            for(let i=a.length-1;i>0;i--){
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
        },
        resetGame(){
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
        },
        startCounter(){
            const self = this
            setInterval(function(){
                self.seconds = parseInt(self.seconds) + 1;
                if (self.seconds > 59) {
                    self.minutes += 1;
                    self.seconds = 0;
                } else if (self.seconds < 10) {
                    self.seconds = "0" + self.seconds;
                }
            }, 999.9)
        }
    }
})

app.mount("#container")