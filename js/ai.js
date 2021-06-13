var position, cards, curr_char, curr_pos, scope, i;
var card_chars = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "K", "Q", "J"];

/** Not the most professional looking one, but gets the job done */
function coole_ai(){
    curr_char = 0;
    curr_pos = 0;
    position = [];
    cards = document.getElementsByClassName("card");
    i = 0;
    scope = setInterval(function(){check_scope()}, 100)
}

function check_scope(){
    if(i == cards.length){
        if(document.getElementsByClassName("flipped").length > 0){
            cards[parseInt(cards.length - 2 * Math.random())].click();
            setTimeout(function(){
                if(document.getElementsByClassName("flipped").length > 0){
                    cards[parseInt(cards.length - 2 * Math.random())].click();
                }
            }, 500)
            
        }
        clearInterval(scope);
        setTimeout(function(){
            scope = setInterval(function() {
                if(curr_char == card_chars.length){
                    clearInterval(scope);
                }
                for(let a = 0;a<4;a++) {
                    if(position.indexOf(card_chars[curr_char], curr_pos) != -1){
                        cards[position.indexOf(card_chars[curr_char], curr_pos)].click();
                        curr_pos = position.indexOf(card_chars[curr_char], curr_pos)+1
                    }
                }
                curr_char++;
                curr_pos=0;
            }, 500)   
        }, 1000)
    } else {
        if(cards[i].classList.contains("flipped") && cards[i].hasAttribute("style")){
            var tmp = cards[i].getAttribute("style").replace('background-image: url("img/', "").replace('.png");', "")
            for(let a=0;a<pictures.length;a++){
                if(pictures[a].img == tmp){
                    position.push(pictures[a].type)
                }
            }
            i++;
        } else if (cards[i].classList.contains("flipped") == false) {
            cards[i].click();
        }
    }
}