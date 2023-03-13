
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

    const resetWinningState = () => isWinner = false;

    return {
        getName,
        updateName,
        getToken,
        getIsWinner,
        wins,
        resetWinningState,
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
    let winningPlayer = undefined;

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
    };

    const resetGame = () => {
        GameBoard.clearBoard();
        if (winningPlayer) winningPlayer.resetWinningState();
        gameOver = false;
        isTie = false;
        activePlayer = players[0];
        winningPlayer = undefined;
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


const FormController = (function (){
    const state = {
        playAgainstComputer: false,
        playerOneName: '',
        playerTwoName: '',
    };

    return {
        state,
    };
})();


const ScreenController = (function() {
    const playerTurnDiv = document.querySelector('#turn');
    const boardDiv = document.querySelector('#board');
    const settingPanel = document.querySelector('#settingPanel');; 
    // const playerOneNameControl = document.querySelector("#playerOneName");
    // const playerTwoNameControl = document.querySelector("#playerTwoName");
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
                FormController.state.playAgainstComputer = e.target.checked;
                updateFormScreen();
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
        const checkboxDiv = createCheckboxDiv(FormController.state.playAgainstComputer);
        settingPanel.appendChild(checkboxDiv);
        if (!FormController.state.playAgainstComputer) {
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

    const changePlayerNameHandler = (e) => {
        GameController.updatePlayerName(e.target.dataset.index, e.target.value);
        if (!e.target.value) {
            GameController.updatePlayerName(
                e.target.dataset.index, 
                e.target.dataset.index === '0' ? 'Player One' : 'Player Two')
        }
        updateScreen();
    };

    const playAgainButtonHandler = () => {
        GameController.resetGame();
        updateScreen();
    };

    const submitFormHandler = (e) => {
        e.preventDefault();
        console.dir(e.target);
        FormController.state.playAgainstComputer = e.target.playAgainstComputer.checked;
        FormController.state.playerOneName = e.target.playerOneName.value;
        FormController.state.playerTwoName = e.target.playerTwoName.value;
        updateFormScreen();
    };

    // playerOneNameControl.addEventListener('input', changePlayerNameHandler);
    // playerTwoNameControl.addEventListener('input', changePlayerNameHandler);
    playAgainButton.addEventListener('click', playAgainButtonHandler);
    settingPanel.addEventListener('submit', submitFormHandler);
    settingPanel.addEventListener('submit', changePlayerNameHandler);

    updateScreen();
    updateFormScreen();
})();

