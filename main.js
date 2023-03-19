/* The game starts by initializing the game and updating the screen. Players take turns placing tokens on the board until one of them wins or the board is full, resulting in a tie. The game can be played against a computer, which makes random moves. */

const deepCopyBoard = (board) => {
    const newBoard = [];
    for (let i = 0; i < board.length; i++) {
        newBoard[i] = [];
        for (let j = 0; j < board[i].length; j++) {
            newBoard[i][j] = Cell();
            newBoard[i][j].addToken(board[i][j].getValue());
        }
    }
    return newBoard;
};


/* SettingsController: Manages the game settings and holds the state for the settings' values, such as player names and whether the game is played against a computer. */
const SettingsController = (function (){
    const state = {
        playAgainstComputer: false,
        playerOneName: 'Player One',
        playerTwoName: 'Player Two',
        playerName: 'Player',
    };

    return {
        state,
    };
})();

/* GameBoard: Manages the game board, including creating the board with empty cells, printing the board values, checking if the board is full, and clearing the board. */
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
                result = result && !!cell.getValue();
            })
        })
        return result;
    };

    const clearBoard = () => {
        board.forEach(row => {
            row.forEach(cell => {
                cell.addToken(0);
            })
        })
    };

    return {
        getBoard,
        clearBoard,
        printBoard,
        isFull,
    };

})();


/* PlayerBase: Provides common functionality for human and computer players, including getting and setting the winning state. */
function PlayerBase() {
    let isWinner = false;

    const getIsWinner = () => isWinner;

    const wins = () => isWinner = true;

    const resetWinningState = () => isWinner = false;

    return {
        getIsWinner,
        wins,
        resetWinningState,
    }
}


/* ComputerBot: Represents the computer player and inherits the base player functionality. It defines the computer player properties like name, type, and token. */
function ComputerBot() {
    const prototype = PlayerBase();

    const name = 'Computer';
    const type = 'computer';
    const token = 2;

    const getName = () => name;
    const getToken = () => token;
    const getType = () => type;

     // Implement the Minimax function
    const minimax = (board, depth, maximizingPlayer) => {
        if (GameController.checkWinningState(board, 2)) {
            return 10 - depth;
        } else if (GameController.checkWinningState(board, 1)) {
            return -10 + depth;
        } else if (GameController.checkFullBoard(board)) {
            return 0;
        }

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j].getValue() === 0) {
                        board[i][j].addToken(token);
                        let eval = minimax(board, depth + 1, false);
                        board[i][j].addToken(0);
                        maxEval = Math.max(maxEval, eval);
                    }
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j].getValue() === 0) {
                        board[i][j].addToken(3 - token);
                        let eval = minimax(board, depth + 1, true);
                        board[i][j].addToken(0);
                        minEval = Math.min(minEval, eval);
                    }
                }
            }
            return minEval;
        }
    };

    const makeBestMove = (board) => {
        let bestValue = -Infinity;
        let bestMove = { row: -1, col: -1 };

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].getValue() === 0) {
                    board[i][j].addToken(token);
                    const moveValue = minimax(board, 0, false);
                    board[i][j].addToken(0);

                    if (moveValue > bestValue) {
                        bestValue = moveValue;
                        bestMove = { row: i, col: j };
                    }

                    console.log({i, j, moveValue});
                }
            }
        }

        return bestMove;
    };

    return Object.assign({
        getName,
        getToken,
        getType,
        makeBestMove,
    }, prototype);
}


/* Player: Represents a human player and inherits the base player functionality. It allows for updating the player's name and getting player properties like name, token, and type. */
function Player(name, token) {
    const prototype = PlayerBase();
    const type = 'player';

    const getName = () => name;
    const getToken = () => token;
    const getType = () => type;

    const updateName = (newName) => {
        name = newName;  
    };

    return Object.assign({
        updateName,
        getName,
        getToken,
        getType,
    }, prototype);
}


/* Cell: Represents a single cell on the game board. It initializes the cell's value and provides methods to get the cell's value and add a token to the cell. */
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


/* GameController: Manages the game logic, including initializing the game, switching player turns, updating player win state, playing a round, and resetting the game. It also handles computer player moves. */
const GameController = (function() {
    let players;
    let gameOver;
    let isTie;
    let activePlayer;
    let winningPlayer;
    let paused;
    let computerIsPlaying;

    const initializeGame = () => {
        if (SettingsController.state.playAgainstComputer) {
            players = [
                Player(
                    playerOneName = SettingsController.state.playerName, 
                    1),
                ComputerBot(),
            ];
        } else {
            players = [
                Player(
                    playerOneName = SettingsController.state.playerOneName, 
                    1),
                Player(
                    playerTwoName = SettingsController.state.playerTwoName, 
                    2),
            ];
        }

        gameOver = false;
        isTie = false;
        activePlayer = players[0];
        winningPlayer = undefined;
        paused = false;
        computerIsPlaying = false;
    };

    initializeGame();

    const pause = () => paused = true;
    const resume = () => paused = false;
    const getPausedState = () => paused;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer;
    const getGameOver = () => gameOver;
    const getIsTie = () => isTie;
    const getWinningPlayer = () => winningPlayer;
    const getComputerIsPlaying = () => computerIsPlaying;

    const updatePlayerName = (playerIndex, newName) => {
        players[playerIndex].updateName(newName);
    };

    const updatePlayerWinState = () => {
        const token = activePlayer.getToken();
        const board = GameBoard.getBoard();

        if (checkWinningState(board, token)) {
            activePlayer.wins();
            winningPlayer = activePlayer;
            return;
        }
    };

    const checkWinningState = (board, token) => {
        for (let i = 0; i < 3; i++) {
            if (
                (board[i][0].getValue() === token &&
                    board[i][0].getValue() === board[i][1].getValue() &&
                    board[i][1].getValue() === board[i][2].getValue()) ||
                (board[0][i].getValue() === token &&
                    board[0][i].getValue() === board[1][i].getValue() &&
                    board[1][i].getValue() === board[2][i].getValue())
            ) {
                return true;
            }
        }
        if (
            (board[0][0].getValue() === token &&
                board[0][0].getValue() === board[1][1].getValue() &&
                board[1][1].getValue() === board[2][2].getValue()) ||
            (board[0][2].getValue() === token &&
                board[0][2].getValue() === board[1][1].getValue() &&
                board[1][1].getValue() === board[2][0].getValue())
        ) {
            return true;
        }
        return false;
    };
    
    const checkFullBoard = (board) => {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].getValue() === 0) {
                    return false;
                }
            }
        }
        return true;
    };

    const playRound = (row, col) => {

        if (paused) {
            return;
        }

        if (row < 0 || row > 2 || col < 0 || col > 2) {
            return;
        } else if (GameBoard.getBoard()[row][col].getValue()) {
            return;
        }

        GameBoard.getBoard()[row][col].addToken(activePlayer.getToken());

        updatePlayerWinState();

        if (activePlayer.getIsWinner()) {
            gameOver = true;
            return;
        }

        if (!winningPlayer && GameBoard.isFull()) {
            isTie = true;
            gameOver = true;
            return
        }

        switchPlayerTurn();

        if (activePlayer.getType() === 'computer') {
            computerIsPlaying = true;
            pause();
            setTimeout(playComputerRound, 800);
        }
    };

    const playComputerRound = () => {
        computerIsPlaying = false;
        resume();

        // Get the board
        const board = deepCopyBoard(GameBoard.getBoard());

        // Find the best move for the computer
        const bestMove = activePlayer.makeBestMove(board);
        playRound(bestMove.row, bestMove.col);

        ScreenController.updateScreen();
    };

    const resetGame = () => {
        GameBoard.clearBoard();
        if (winningPlayer) winningPlayer.resetWinningState();
        initializeGame();
    };

    return {
        playRound,
        getActivePlayer,
        getGameOver,
        getIsTie,
        getWinningPlayer,
        updatePlayerName,
        resetGame,
        pause,
        resume,
        getPausedState,
        getComputerIsPlaying,
        checkWinningState,
        checkFullBoard,
    };
})();


/* ScreenController: Manages the user interface, including updating the screen to show the current state of the game, handling user input, and updating the game settings form. */
const ScreenController = (function() {
    const playerTurnDiv = document.querySelector('#turn');
    const boardDiv = document.querySelector('#board');
    const settingPanel = document.querySelector('#settingPanel');; 
    const playAgainButton = document.querySelector("#playAgainButton");

    function blurBoard() {
        document.querySelector('#main-wrapper').classList.add('blur');
    }
    function unblurBoard() {
        document.querySelector('#main-wrapper').classList.remove('blur');
    }

    const updateScreen = () => {
        boardDiv.textContent = '';
        playAgainButton.className = "button-hidden";

        if (GameController.getPausedState() && !GameController.getComputerIsPlaying()) {
            blurBoard();
        } else {
            unblurBoard();
        }

        const activePlayer = GameController.getActivePlayer();
        if (GameController.getWinningPlayer()) {
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
        });

        if (GameController.getGameOver()) {
            playAgainButton.className = 'button-visible';
        }
    };

    const updateFormScreen = () => {
        settingPanel.innerHTML = '';

        const createCheckboxDiv = (checked) => {
            const checkbox = document.createElement('input');
            checkbox.setAttribute('type', 'checkbox');
            checkbox.id = 'playAgainstComputerCheckbox';
            checkbox.checked = checked;
            checkbox.onchange = (e) => {
                SettingsController.state.playAgainstComputer = e.target.checked;
                GameController.resetGame();
                updateFormScreen();
                updateScreen();
            };
            const label = document.createElement('label');
            label.textContent = 'Play against the computer';
            label.setAttribute('for', 'playAgainstComputerCheckbox');
            const div = document.createElement('div')
            div.appendChild(checkbox);
            div.appendChild(label);
            return div;
        };

        const createPlayerInput = (inputId) => {
            const label = document.createElement('label');
            label.setAttribute('for', inputId);
            label.textContent = inputId === 'playerOneName' ? 'Player One Name: ' :
                                inputId === 'playerTwoName' ? 'Player Two Name: ' :
                                'Player Name: ';
            const input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('data-index', inputId === 'playerTwoName' ? '2' : '1');
            input.id = inputId;
            const div = document.createElement('div');
            div.appendChild(label);
            div.appendChild(input);
            return div;
        };

        const createSaveButton = (id) => {
            const button = document.createElement('button');
            button.textContent = 'Save and Play';
            button.setAttribute('type', 'submit');
            button.id = id;
            return button
        };

        const formHeader = document.createElement('header');
        formHeader.innerHTML = '<h1>Game Settings: </h1>';
        settingPanel.appendChild(formHeader);
        const checkboxDiv = createCheckboxDiv(SettingsController.state.playAgainstComputer);
        settingPanel.appendChild(checkboxDiv);
        if (!SettingsController.state.playAgainstComputer) {
            const playerOneInputDiv = createPlayerInput('playerOneName');
            const playerTwoInputDiv = createPlayerInput('playerTwoName');
            settingPanel.appendChild(playerOneInputDiv);
            settingPanel.appendChild(playerTwoInputDiv);
        } else {
            const playerOneInputDiv = createPlayerInput('playerName');
            settingPanel.appendChild(checkboxDiv);
            settingPanel.appendChild(playerOneInputDiv);
        }
        const saveButton = createSaveButton('saveButton');
        settingPanel.appendChild(saveButton);

        const inputList = document.querySelectorAll('input');
        Array.from(inputList).forEach(input => {
            input.addEventListener('focus', () => {
                GameController.pause();
                updateScreen();
            });
        })
    };

    const clickHandlerButton = (e) => {
        if (!GameController.getGameOver()) {
            const row = e.target.dataset.row;
            const col = e.target.dataset.col;
            GameController.playRound(row, col);
            console.dir(e.target.dataset.isClickable);
            updateScreen();
        } else {

        };
    };
    boardDiv.addEventListener('click', clickHandlerButton);

    const playAgainButtonHandler = () => {
        GameController.resetGame();
        updateScreen();
    };

    const submitFormHandler = (e) => {
        e.preventDefault();
        SettingsController.state.playAgainstComputer = e.target.playAgainstComputerCheckbox.checked;
        if (SettingsController.state.playAgainstComputer) {
            SettingsController.state.playerName = e.target.playerName.value || 'Player';
        } else {
            SettingsController.state.playerOneName = e.target.playerOneName.value || 'Player One';
            SettingsController.state.playerTwoName = e.target.playerTwoName.value || 'Player Two';
        }
        GameController.resetGame();
        GameController.resume();
        console.log(GameController.getPausedState());
        updateFormScreen();
        updateScreen();
    };

    playAgainButton.addEventListener('click', playAgainButtonHandler);
    settingPanel.addEventListener('submit', submitFormHandler);

    GameController.pause();
    updateScreen();
    updateFormScreen();

    return {
        updateScreen,
    }
})();

