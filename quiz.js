let timeLeft = 1800; // 30 मिनट

let timer = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    document.getElementById("timer").innerHTML =
        minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

    timeLeft--;

    if(timeLeft < 0){
        clearInterval(timer);
        submitQuiz();
    }
},1000);

function submitQuiz(){

    let score = 0;

    if(document.querySelector('input[name="q1"]:checked')?.value=="B")
        score++;

    if(document.querySelector('input[name="q2"]:checked')?.value=="C")
        score++;

    document.getElementById("result").innerHTML =
        "Score: " + score + "/2";
}
