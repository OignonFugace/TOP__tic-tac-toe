
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

    return {
        getBoard,
        printBoard,
    };

})()

function Player(name, token) {

    const getName = () => name;
    const getToken = () => token;
    let isWinner = false;

    const getIsWinner = () => isWinner;

    const wins = () => isWinner = true;

    return {
        getName,
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

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        console.log(GameBoard.printBoard());
        console.log(`${activePlayer.getName()}'s turn.'`)
    };

    const updatePlayerWinState = () => {
        const token = activePlayer.getToken();
        const board = GameBoard.getBoard();
        board.forEach(row => {
            if (token === row[0].getValue() && 
                row[0].getValue() === row[1].getValue() && 
                row[1].getValue() === row[2].getValue()) {
                activePlayer.wins();
                return;
            } 
        });
        for (let i = 0 ; i < 3 ; i++) {
            if (token === board[0][i].getValue() &&
                board[0][i].getValue() === board[1][i].getValue() &&
                board[1][i].getValue() === board[2][i].getValue()) {
                activePlayer.wins();
                return;
            }
        }
        if (token === board[0][0].getValue() &&
            board[0][0].getValue() === board[1][1].getValue() &&
            board[1][1].getValue() === board[2][2].getValue()) {
            activePlayer.wins();
            return;
        } else if (token === board[0][2].getValue() &&
            board[0][2].getValue() === board[1][1].getValue() &&
            board[1][1].getValue() === board[2][0].getValue()) {
            activePlayer.wins();
            return;
        }
    };

    const playRound = (row, col) => {

        if (row < 0 || row > 2 || col < 0 || col > 2) {
            console.log('Input out of range');
            return;
        } else if (GameBoard.getBoard()[row][col].getValue()) {
            console.log('Input already taken');
            return;
        }

        console.log(`${activePlayer.getName()} tiks ${row + 1}'s row and ${col + 1}'s column.`);
        GameBoard.getBoard()[row][col].addToken(activePlayer.getToken());

        updatePlayerWinState();

        if (activePlayer.getIsWinner()) {
            console.log(`${activePlayer.getName()} wins!`);
            return;
        }

        switchPlayerTurn();
        printNewRound();
    };

    printNewRound();

    return {
        playRound,
        getActivePlayer,
    };
})();


const ScreenController = (function() {
    const playerTurnDiv = document.querySelector('#turn');
    const boardDiv = document.querySelector('#board');

    const updateScreen = () => {
        boardDiv.textContent = '';

        const activePlayer = GameController.getActivePlayer();
        playerTurnDiv.textContent = `${activePlayer.getName()}'s turn.`;

        GameBoard.getBoard().forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellButton = document.createElement('button');
                cellButton.classList.add('cell');
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.col = colIndex;
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild(cellButton);
            })
        })

    };

    const clickHandlerButton = (e) => {
        const row = e.target.dataset.row;
        const col = e.target.dataset.col;
        console.log({row, col});
        GameController.playRound(row, col);
        updateScreen();
    };
    boardDiv.addEventListener('click', clickHandlerButton);

    updateScreen();
})();

