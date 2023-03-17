// SettingsController manages the game settings
const SettingsController = (function (){
    // State holds the settings' values
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


// GameBoard manages the game board
const GameBoard = (function() {
    // Initialize the board dimensions and the board itself
    const rows = 3;
    const cols = 3;
    const board = [];

    // Create the board with empty cells
    for (let i = 0 ; i < rows ; i++) {
        board[i] = [];
        for (let j = 0 ; j < cols ; j++) {
            board[i].push(Cell());
        }
    };

    // Print the board values
    const printBoard = () => {
        const boardWithCellValue = board.map((row) => row.map((cell) => cell.getValue()));
        return boardWithCellValue;
    };

    // Get the board state
    const getBoard = () => board;

    // Check if the board is full
    const isFull = () => {
        let result = true;
        board.forEach(row => {
            row.forEach(cell => {
                result = result && !!cell.getValue();
            })
        })
        return result;
    };

    // Clear the board by resetting all cells
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


// PlayerBase provides the common functionality for human and computer players
function PlayerBase() {
    // Initialize the player's winning state
    let isWinner = false;

    // Get the winning state of the player
    const getIsWinner = () => isWinner;

    // Mark the player as a winner
    const wins = () => isWinner = true;

    // Reset the player's winning state
    const resetWinningState = () => isWinner = false;

    return {
        getIsWinner,
        wins,
        resetWinningState,
    }
}


// ComputerBot represents the computer player
function ComputerBot() {
    // Inherit the base player functionality
    const prototype = PlayerBase();

    // Define computer player properties
    const name = 'Computer';
    const type = 'computer';
    const token = 2;

    // Getters for computer player properties
    const getName = () => name;
    const getToken = () => token;
    const getType = () => type;

    return Object.assign({
        getName,
        getToken,
        getType,
    }, prototype);
}


// Player represents a human player
function Player(name, token) {
    // Inherit the base player functionality
    const prototype = PlayerBase();
    const type = 'player';

    // Getters for player properties
    const getName = () => name;
    const getToken = () => token;
    const getType = () => type;

    // Update the player's name
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


// Cell represents a single cell on the game
function Cell() {
    // Initialize the cell's value
    let value = 0;

    // Get the cell's value
    const getValue = () => value;

    // Add a token to the cell
    const addToken = (playerToken) => {
        value = playerToken;
    };
    
    return {
        getValue,
        addToken,
    }
}


// GameController manages the game logic
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

    // Switch the current player
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
        board.forEach(row => {
            if (token === row[0].getValue() && 
                row[0].getValue() === row[1].getValue() && 
                row[1].getValue() === row[2].getValue()) {
                activePlayer.wins();
                winningPlayer = activePlayer;
                return;
            } 
        });
        for (let i = 0 ; i < 3 ; i++) {
            if (token === board[0][i].getValue() &&
                board[0][i].getValue() === board[1][i].getValue() &&
                board[1][i].getValue() === board[2][i].getValue()) {
                activePlayer.wins();
                winningPlayer = activePlayer;
                return;
            }
        }
        if (token === board[0][0].getValue() &&
            board[0][0].getValue() === board[1][1].getValue() &&
            board[1][1].getValue() === board[2][2].getValue()) {
            activePlayer.wins();
            winningPlayer = activePlayer;
            return;
        } else if (token === board[0][2].getValue() &&
            board[0][2].getValue() === board[1][1].getValue() &&
            board[1][1].getValue() === board[2][0].getValue()) {
            activePlayer.wins();
            winningPlayer = activePlayer;
            return;
        }
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

        // Get the board and find empty cells
        const board = GameBoard.getBoard();
        const emptyCells = [];
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].getValue() === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        // Choose a random empty cell for the computer's move
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const randomMove = emptyCells[randomIndex];
            playRound(randomMove.row, randomMove.col);
        }

        ScreenController.updateScreen();
    };

    const resetGame = () => {
        GameBoard.clearBoard();
        if (winningPlayer) winningPlayer.resetWinningState();
        initializeGame();
    }
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
    };
})();


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

