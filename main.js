
const GameBoard = (function() {
    const rows = 3;
    const cols = 3;
    const board = [];

    for (let i = 0 ; i < rows ; i++) {
        board[i] = [];
        for (let j = 0 ; j < cols ; j++) {
            board[i].push(Cell());
        }
    };

    const printBoard = () => {
        const boardWithCellValue = board.map((row) => row.map((cell) => cell.getValue()));
        return boardWithCellValue;
    };

    const getBoard = () => board;

    const isFull = () => {
        let result = true;
        board.forEach(row => {
            row.forEach(cell => {
                result = result && cell.getValue();
            })
        })
        return result;
    };

    return {
        getBoard,
        printBoard,
        isFull,
    };

})()

function Player(name, token) {

    const getName = () => name;
    const getToken = () => token;
    let isWinner = false;

    const getIsWinner = () => isWinner;

    const wins = () => isWinner = true;

    const updateName = (newName) => {
        name = newName;  
    };

    return {
        getName,
        updateName,
        getToken,
        getIsWinner,
        wins,
    }
}

function Cell() {
    let value = 0;

    const getValue = () => value;

    const addToken = (playerToken) => {
        value = playerToken;
    };

    return {
        getValue,
        addToken,
    }
}

const GameController = (function(
    playerOneName = 'Player One',
    playerTwoName = 'Player Two'
) {

    const players = [
        Player(playerOneName, 1),
        Player(playerTwoName, 2)
    ];

    let gameOver = false;
    let isTie = false;
    let activePlayer = players[0];
    let winningPlayer;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;
    const getGameOver = () => gameOver;
    const getIsTie = () => isTie;
    const getWinningPlayer = () => winningPlayer;

    const updatePlayerName = (playerIndex, newName) => {
        players[playerIndex].updateName(newName);
    };

    const updatePlayerWinState = () => {
        const token = activePlayer.getToken();
        const board = GameBoard.getBoard();
        board.forEach(row => {
            if (token === row[0].getValue() && 
                row[0].getValue() === row[1].getValue() && 
                row[1].getValue() === row[2].getValue()) {
                activePlayer.wins();
                winningPlayer = activePlayer;
                gameOver = true
                return;
            } 
        });
        for (let i = 0 ; i < 3 ; i++) {
            if (token === board[0][i].getValue() &&
                board[0][i].getValue() === board[1][i].getValue() &&
                board[1][i].getValue() === board[2][i].getValue()) {
                activePlayer.wins();
                winningPlayer = activePlayer;
                gameOver = true;
                return;
            }
        }
        if (token === board[0][0].getValue() &&
            board[0][0].getValue() === board[1][1].getValue() &&
            board[1][1].getValue() === board[2][2].getValue()) {
            activePlayer.wins();
            winningPlayer = activePlayer;
            gameOver = true;
            return;
        } else if (token === board[0][2].getValue() &&
            board[0][2].getValue() === board[1][1].getValue() &&
            board[1][1].getValue() === board[2][0].getValue()) {
            activePlayer.wins();
            winningPlayer = activePlayer;
            gameOver = true;
            return;
        }
    };

    const playRound = (row, col) => {

        if (row < 0 || row > 2 || col < 0 || col > 2) {
            return;
        } else if (GameBoard.getBoard()[row][col].getValue()) {
            return;
        }

        GameBoard.getBoard()[row][col].addToken(activePlayer.getToken());

        updatePlayerWinState();

        if (activePlayer.getIsWinner()) {
            return;
        }

        if (!winningPlayer && GameBoard.isFull()) {
            isTie = true;
            return
        }

        switchPlayerTurn();
    };

    return {
        playRound,
        getActivePlayer,
        getGameOver,
        getIsTie,
        getWinningPlayer,
        updatePlayerName,
    };
})();


const ScreenController = (function() {
    const playerTurnDiv = document.querySelector('#turn');
    const boardDiv = document.querySelector('#board');
    const playerOneNameControl = document.querySelector("#playerOneName");
    const playerTwoNameControl = document.querySelector("#playerTwoName");

    const updateScreen = () => {
        boardDiv.textContent = '';

        const activePlayer = GameController.getActivePlayer();
        if (GameController.getGameOver()) {
            playerTurnDiv.textContent = `${GameController.getWinningPlayer().getName()} Wins!`;
        } else if (GameController.getIsTie()) {
            playerTurnDiv.textContent = "It's a tie";
        } else {
            playerTurnDiv.textContent = `${activePlayer.getName()}'s turn.`;
        };

        GameBoard.getBoard().forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellButton = document.createElement('button');
                cellButton.classList.add('cell');
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.col = colIndex;
                cellButton.textContent = cell.getValue() === 0 ? '' : 
                    cell.getValue() === 1 ? 'x' : 
                    'o';
                boardDiv.appendChild(cellButton);
            })
        })
    };

    const clickHandlerButton = (e) => {
        if (!GameController.getGameOver()) {
            const row = e.target.dataset.row;
            const col = e.target.dataset.col;
            GameController.playRound(row, col);
            updateScreen();
        } else {

        };
    };
    boardDiv.addEventListener('click', clickHandlerButton);

    const changePlayerNameHandler = (e) => {
        GameController.updatePlayerName(e.target.dataset.index, e.target.value);
        if (!e.target.value) {
            GameController.updatePlayerName(
                e.target.dataset.index, 
                e.target.dataset.index === '0' ? 'Player One' : 'Player Two')
        }
        updateScreen();
    };
    playerOneNameControl.addEventListener('input', changePlayerNameHandler);
    playerTwoNameControl.addEventListener('input', changePlayerNameHandler);

    updateScreen();
})();

