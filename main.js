
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

    return {
        getName,
        getToken,
    }
}

function Cell() {
    const value = 0;

    const getValue = () => value;

    const addToken = (player) => {
        value = player;
    }

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
    }

    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.'`)
    }

    const playRound = () => {

    };

    printNewRound();

    return {
        playRound,
        getActivePlayer,
    }
})();


