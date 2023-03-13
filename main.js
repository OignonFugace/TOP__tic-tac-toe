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

function ComputerBot() {

    const prototype = PlayerBase();

    const name = 'Computer';
    const type = 'computer';
    const token = 2;

    const getName = () => name;
    const getToken = () => token;
    const getType = () => type;

    return Object.assign({
        getName,
        getToken,
        getType,
    }, prototype);
}

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

    let players;
    let gameOver;
    let isTie;
    let activePlayer;
    let winningPlayer;

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
    }

    initializeGame();

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
            setTimeout(playComputerRound, 800);
        }
    };

    const playComputerRound = () => {
        console.log('Computer is playing.');
        switchPlayerTurn();
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
    };
})();


const ScreenController = (function() {
    const playerTurnDiv = document.querySelector('#turn');
    const boardDiv = document.querySelector('#board');
    const settingPanel = document.querySelector('#settingPanel');; 
    const playAgainButton = document.querySelector("#playAgainButton");

    const updateScreen = () => {
        boardDiv.textContent = '';
        playAgainButton.className = "button-hidden";

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

    const playAgainButtonHandler = () => {
        GameController.resetGame();
        updateScreen();
    };

    const submitFormHandler = (e) => {
        e.preventDefault();
        SettingsController.state.playAgainstComputer = e.target.playAgainstComputerCheckbox.checked;
        SettingsController.state.playerOneName = e.target.playerOneName.value;
        SettingsController.state.playerTwoName = e.target.playerTwoName.value;
        GameController.resetGame();
        updateFormScreen();
        updateScreen();
    };

    playAgainButton.addEventListener('click', playAgainButtonHandler);
    settingPanel.addEventListener('submit', submitFormHandler);

    updateScreen();
    updateFormScreen();

    return {
        updateScreen,
    }
})();

