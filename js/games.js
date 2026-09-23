/* =========================================
   MINI GAMES - SHARED GAME SCRIPT
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const game = document.body.dataset.game;

    if (!game) return;

    switch (game) {
        case "target-clicker":
            initTargetClicker();
            break;

        case "2048":
            init2048();
            break;

        case "dont-touch-red":
            initDontTouchRed();
            break;

        case "quick-math":
            initQuickMath();
            break;

        case "dodge":
            initDodge();
            break;

        case "coin-flip":
            initCoinFlip();
            break;
    }
});


/* =========================================
   🎯 TARGET CLICKER
   ========================================= */

function initTargetClicker() {

    const area = document.getElementById("gameArea");
    const scoreEl = document.getElementById("score");
    const timeEl = document.getElementById("time");
    const bestEl = document.getElementById("best");
    const startBtn = document.getElementById("startBtn");

    if (!area || !scoreEl || !timeEl || !startBtn) return;

    let score = 0;
    let time = 30;
    let timer = null;
    let playing = false;

    let best = Number(localStorage.getItem("targetClickerBest")) || 0;
    bestEl.textContent = best;

    function createTarget() {

        area.innerHTML = "";

        const target = document.createElement("button");
        target.className = "target";

        const size = Math.max(38, 75 - Math.floor(score / 5) * 4);

        target.style.width = size + "px";
        target.style.height = size + "px";

        const maxX = Math.max(10, area.clientWidth - size - 10);
        const maxY = Math.max(10, area.clientHeight - size - 10);

        target.style.left = Math.random() * maxX + "px";
        target.style.top = Math.random() * maxY + "px";

        target.addEventListener("click", () => {

            if (!playing) return;

            score++;
            scoreEl.textContent = score;

            playSound(600, 0.06);

            createTarget();
        });

        area.appendChild(target);
    }

    function startGame() {

        score = 0;
        time = 30;
        playing = true;

        scoreEl.textContent = score;
        timeEl.textContent = time;

        startBtn.textContent = "RESTART";

        createTarget();

        clearInterval(timer);

        timer = setInterval(() => {

            time--;
            timeEl.textContent = time;

            if (time <= 0) {

                clearInterval(timer);
                playing = false;

                area.innerHTML = `
                    <div class="game-message">
                        <h2>TIME'S UP!</h2>
                        <p>Score: ${score}</p>
                    </div>
                `;

                if (score > best) {

                    best = score;
                    localStorage.setItem(
                        "targetClickerBest",
                        best
                    );

                    bestEl.textContent = best;
                }

                playSound(250, 0.3);
            }

        }, 1000);
    }

    startBtn.addEventListener("click", startGame);
}


/* =========================================
   🧩 2048 MINI
   ========================================= */

function init2048() {

    const boardEl = document.getElementById("board");
    const scoreEl = document.getElementById("score");
    const bestEl = document.getElementById("best");
    const restartBtn = document.getElementById("restartBtn");

    if (!boardEl) return;

    let board = [];
    let score = 0;

    let best = Number(localStorage.getItem("2048Best")) || 0;
    bestEl.textContent = best;

    function createBoard() {

        boardEl.innerHTML = "";

        for (let i = 0; i < 16; i++) {

            const cell = document.createElement("div");
            cell.className = "cell";

            boardEl.appendChild(cell);
        }
    }

    function startGame() {

        board = Array(16).fill(0);
        score = 0;

        scoreEl.textContent = score;

        addTile();
        addTile();

        render();
    }

    function addTile() {

        const empty = [];

        board.forEach((value, index) => {

            if (value === 0) {
                empty.push(index);
            }
        });

        if (!empty.length) return;

        const index =
            empty[Math.floor(Math.random() * empty.length)];

        board[index] =
            Math.random() < 0.9 ? 2 : 4;
    }

    function render() {

        const cells = boardEl.children;

        for (let i = 0; i < 16; i++) {

            cells[i].textContent =
                board[i] === 0 ? "" : board[i];

            cells[i].className =
                "cell" +
                (board[i] ? " tile-" + board[i] : "");
        }
    }

    function move(direction) {

        let oldBoard = [...board];

        if (direction === "left") {

            for (let row = 0; row < 4; row++) {

                const values = [];

                for (let col = 0; col < 4; col++) {
                    if (board[row * 4 + col]) {
                        values.push(board[row * 4 + col]);
                    }
                }

                const merged = mergeLine(values);

                for (let col = 0; col < 4; col++) {
                    board[row * 4 + col] =
                        merged[col] || 0;
                }
            }
        }

        if (direction === "right") {

            for (let row = 0; row < 4; row++) {

                const values = [];

                for (let col = 3; col >= 0; col--) {

                    if (board[row * 4 + col]) {
                        values.push(board[row * 4 + col]);
                    }
                }

                const merged = mergeLine(values);

                for (let col = 0; col < 4; col++) {

                    board[row * 4 + (3 - col)] =
                        merged[col] || 0;
                }
            }
        }

        if (direction === "up") {

            for (let col = 0; col < 4; col++) {

                const values = [];

                for (let row = 0; row < 4; row++) {

                    if (board[row * 4 + col]) {
                        values.push(board[row * 4 + col]);
                    }
                }

                const merged = mergeLine(values);

                for (let row = 0; row < 4; row++) {

                    board[row * 4 + col] =
                        merged[row] || 0;
                }
            }
        }

        if (direction === "down") {

            for (let col = 0; col < 4; col++) {

                const values = [];

                for (let row = 3; row >= 0; row--) {

                    if (board[row * 4 + col]) {
                        values.push(board[row * 4 + col]);
                    }
                }

                const merged = mergeLine(values);

                for (let row = 0; row < 4; row++) {

                    board[(3 - row) * 4 + col] =
                        merged[row] || 0;
                }
            }
        }

        if (JSON.stringify(oldBoard) !== JSON.stringify(board)) {

            addTile();
            render();

            playSound(450, 0.05);

            if (score > best) {

                best = score;

                localStorage.setItem(
                    "2048Best",
                    best
                );

                bestEl.textContent = best;
            }

            if (isGameOver()) {

                setTimeout(() => {

                    alert(
                        "Game Over!\nScore: " +
                        score
                    );

                }, 100);
            }
        }
    }

    function mergeLine(values) {

        const result = [];

        for (let i = 0; i < values.length; i++) {

            if (
                i < values.length - 1 &&
                values[i] === values[i + 1]
            ) {

                const value = values[i] * 2;

                result.push(value);

                score += value;

                i++;
            } else {

                result.push(values[i]);
            }
        }

        while (result.length < 4) {
            result.push(0);
        }

        return result;
    }

    function isGameOver() {

        if (board.includes(0)) {
            return false;
        }

        for (let i = 0; i < 16; i++) {

            if (
                i % 4 < 3 &&
                board[i] === board[i + 1]
            ) {
                return false;
            }

            if (
                i < 12 &&
                board[i] === board[i + 4]
            ) {
                return false;
            }
        }

        return true;
    }

    document.addEventListener("keydown", event => {

        const keys = {
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowUp: "up",
            ArrowDown: "down"
        };

        if (keys[event.key]) {

            event.preventDefault();
            move(keys[event.key]);
        }
    });

    restartBtn?.addEventListener(
        "click",
        startGame
    );

    createBoard();
    startGame();
}


/* =========================================
   🔴 DON'T TOUCH RED
   ========================================= */

function initDontTouchRed() {

    const area = document.getElementById("gameArea");
    const scoreEl = document.getElementById("score");
    const startBtn = document.getElementById("startBtn");

    if (!area || !startBtn) return;

    let score = 0;
    let playing = false;
    let timer;

    function startGame() {

        clearInterval(timer);

        score = 0;
        playing = true;

        scoreEl.textContent = score;

        area.innerHTML = "";

        createObjects();

        timer = setInterval(() => {

            score++;
            scoreEl.textContent = score;

            if (score % 5 === 0) {
                createObjects();
            }

        }, 1000);
    }

    function createObjects() {

        area.innerHTML = "";

        const count = Math.min(
            10,
            4 + Math.floor(score / 5)
        );

        for (let i = 0; i < count; i++) {

            const object = document.createElement("button");

            const isRed =
                Math.random() < 0.35;

            object.className =
                isRed ? "red-object" : "safe-object";

            const size =
                35 + Math.random() * 30;

            object.style.width = size + "px";
            object.style.height = size + "px";

            object.style.left =
                Math.random() *
                Math.max(
                    10,
                    area.clientWidth - size
                ) + "px";

            object.style.top =
                Math.random() *
                Math.max(
                    10,
                    area.clientHeight - size
                ) + "px";

            object.addEventListener("click", () => {

                if (!playing) return;

                if (isRed) {

                    playing = false;
                    clearInterval(timer);

                    playSound(180, 0.3);

                    alert(
                        "You touched red!\nScore: " +
                        score
                    );

                } else {

                    score += 2;

                    scoreEl.textContent =
                        score;

                    playSound(550, 0.05);

                    object.remove();
                }
            });

            area.appendChild(object);
        }
    }

    startBtn.addEventListener(
        "click",
        startGame
    );

    startGame();
}


/* =========================================
   🧮 QUICK MATH
   ========================================= */

function initQuickMath() {

    const questionEl =
        document.getElementById("question");

    const answerEl =
        document.getElementById("answer");

    const scoreEl =
        document.getElementById("score");

    const timeEl =
        document.getElementById("time");

    const startBtn =
        document.getElementById("startBtn");

    const submitBtn =
        document.getElementById("submitBtn");

    if (!questionEl || !answerEl) return;

    let answer = 0;
    let score = 0;
    let time = 30;
    let playing = false;
    let timer;

    function newQuestion() {

        const a =
            Math.floor(Math.random() * 20) + 1;

        const b =
            Math.floor(Math.random() * 20) + 1;

        const operations = [
            "+",
            "-",
            "×"
        ];

        const operation =
            operations[
                Math.floor(
                    Math.random() *
                    operations.length
                )
            ];

        if (operation === "+") {
            answer = a + b;
        }

        if (operation === "-") {
            answer = a - b;
        }

        if (operation === "×") {
            answer = a * b;
        }

        questionEl.textContent =
            `${a} ${operation} ${b} = ?`;

        answerEl.value = "";
        answerEl.focus();
    }

    function startGame() {

        clearInterval(timer);

        score = 0;
        time = 30;
        playing = true;

        scoreEl.textContent = score;
        timeEl.textContent = time;

        startBtn.textContent = "RESTART";

        newQuestion();

        timer = setInterval(() => {

            time--;

            timeEl.textContent =
                time;

            if (time <= 0) {

                clearInterval(timer);

                playing = false;

                questionEl.textContent =
                    "TIME'S UP!";

                playSound(220, 0.3);
            }

        }, 1000);
    }

    function submitAnswer() {

        if (!playing) return;

        const value =
            Number(answerEl.value);

        if (value === answer) {

            score++;

            scoreEl.textContent =
                score;

            playSound(700, 0.06);

        } else {

            time =
                Math.max(0, time - 2);

            timeEl.textContent =
                time;

            playSound(220, 0.08);
        }

        newQuestion();
    }

    startBtn.addEventListener(
        "click",
        startGame
    );

    submitBtn.addEventListener(
        "click",
        submitAnswer
    );

    answerEl.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                submitAnswer();
            }
        }
    );
}


/* =========================================
   🏃 DODGE
   ========================================= */

function initDodge() {

    const area =
        document.getElementById("gameArea");

    const player =
        document.getElementById("player");

    const scoreEl =
        document.getElementById("score");

    const startBtn =
        document.getElementById("startBtn");

    if (!area || !player) return;

    let playing = false;
    let score = 0;
    let playerX = 50;
    let obstacles = [];
    let timer;
    let animation;

    const keys = {
        left: false,
        right: false
    };

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "ArrowLeft") {
                keys.left = true;
            }

            if (event.key === "ArrowRight") {
                keys.right = true;
            }
        }
    );

    document.addEventListener(
        "keyup",
        event => {

            if (event.key === "ArrowLeft") {
                keys.left = false;
            }

            if (event.key === "ArrowRight") {
                keys.right = false;
            }
        }
    );

    function startGame() {

        cancelAnimationFrame(animation);
        clearInterval(timer);

        playing = true;
        score = 0;
        playerX = 50;
        obstacles = [];

        scoreEl.textContent = score;

        player.style.left =
            playerX + "%";

        area
            .querySelectorAll(".obstacle")
            .forEach(el => el.remove());

        timer = setInterval(
            createObstacle,
            700
        );

        gameLoop();
    }

    function createObstacle() {

        if (!playing) return;

        const obstacle =
            document.createElement("div");

        obstacle.className =
            "obstacle";

        obstacle.style.left =
            Math.random() * 90 + "%";

        obstacle.style.top =
            "-40px";

        area.appendChild(obstacle);

        obstacles.push({
            element: obstacle,
            y: -40
        });
    }

    function gameLoop() {

        if (!playing) return;

        if (keys.left) {
            playerX -= 1;
        }

        if (keys.right) {
            playerX += 1;
        }

        playerX =
            Math.max(
                3,
                Math.min(97, playerX)
            );

        player.style.left =
            playerX + "%";

        obstacles.forEach(
            obstacle => {

                obstacle.y +=
                    4 + score / 100;

                obstacle.element.style.top =
                    obstacle.y + "px";

                if (
                    obstacle.y >
                    area.clientHeight
                ) {

                    obstacle.element.remove();

                    score++;

                    scoreEl.textContent =
                        score;
                }

                if (
                    collision(
                        player,
                        obstacle.element
                    )
                ) {

                    gameOver();
                }
            }
        );

        animation =
            requestAnimationFrame(
                gameLoop
            );
    }

    function collision(a, b) {

        const r1 =
            a.getBoundingClientRect();

        const r2 =
            b.getBoundingClientRect();

        return !(
            r1.right < r2.left ||
            r1.left > r2.right ||
            r1.bottom < r2.top ||
            r1.top > r2.bottom
        );
    }

    function gameOver() {

        if (!playing) return;

        playing = false;

        clearInterval(timer);
        cancelAnimationFrame(animation);

        playSound(180, 0.3);

        setTimeout(() => {

            alert(
                "GAME OVER!\nScore: " +
                score
            );

        }, 100);
    }

    startBtn.addEventListener(
        "click",
        startGame
    );

    startGame();
}


/* =========================================
   🪙 COIN FLIP
   ========================================= */

function initCoinFlip() {

    const coin =
        document.getElementById("coin");

    const headsBtn =
        document.getElementById("headsBtn");

    const tailsBtn =
        document.getElementById("tailsBtn");

    const resultEl =
        document.getElementById("result");

    const scoreEl =
        document.getElementById("score");

    const streakEl =
        document.getElementById("streak");

    if (!coin) return;

    let score = 0;
    let streak = 0;
    let flipping = false;

    function flip(choice) {

        if (flipping) return;

        flipping = true;

        const result =
            Math.random() < 0.5
                ? "heads"
                : "tails";

        coin.classList.remove(
            "flip-animation"
        );

        void coin.offsetWidth;

        coin.classList.add(
            "flip-animation"
        );

        setTimeout(() => {

            const correct =
                choice === result;

            if (correct) {

                score++;
                streak++;

                resultEl.textContent =
                    "CORRECT! 🎉";

                playSound(750, 0.12);

            } else {

                streak = 0;

                resultEl.textContent =
                    `WRONG! It was ${result.toUpperCase()}`;

                playSound(220, 0.12);
            }

            scoreEl.textContent =
                score;

            streakEl.textContent =
                streak;

            flipping = false;

        }, 800);
    }

    headsBtn.addEventListener(
        "click",
        () => flip("heads")
    );

    tailsBtn.addEventListener(
        "click",
        () => flip("tails")
    );
}


/* =========================================
   🔊 SIMPLE SOUND SYSTEM
   ========================================= */

function playSound(
    frequency = 500,
    duration = 0.08
) {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        const audio =
            new AudioContext();

        const oscillator =
            audio.createOscillator();

        const gain =
            audio.createGain();

        oscillator.frequency.value =
            frequency;

        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.08,
            audio.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audio.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.start();

        oscillator.stop(
            audio.currentTime + duration
        );

    } catch (error) {

        // Sound is optional.
    }
}
