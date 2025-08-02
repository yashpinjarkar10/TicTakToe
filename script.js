class MegaTicTacToe {
    constructor() {
        this.currentPlayer = 'X';
        this.gameState = 'playing'; // 'playing', 'won', 'draw'
        this.winner = null;
        this.activeMiniBoard = null; // null means free choice
        this.isFirstMove = true;
        this.gameMode = 'human'; // 'human' or 'ai'
        this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.humanPlayer = 'X'; // Human always plays as X
        this.aiPlayer = 'O'; // AI always plays as O
        this.isAiThinking = false;
        
        // Statistics tracking
        this.stats = {
            gamesPlayed: parseInt(localStorage.getItem('mttt-games-played') || '0'),
            humanWins: parseInt(localStorage.getItem('mttt-human-wins') || '0'),
            aiWins: parseInt(localStorage.getItem('mttt-ai-wins') || '0'),
            draws: parseInt(localStorage.getItem('mttt-draws') || '0')
        };
        
        // Initialize game boards
        this.megaBoard = Array(9).fill(null); // Track mini-board winners
        this.miniBoards = Array(9).fill(null).map(() => Array(9).fill(null));
        
        this.initializeDOM();
        this.createBoard();
        this.attachEventListeners();
        this.updateGameStatus();
        this.updateStats();
        this.updatePlayerNames();
        this.initializeGameMode(); // Ensure initial mode is set correctly
    }
    
    initializeGameMode() {
        // Ensure the default mode (human) is properly set
        this.setGameMode('human');
    }

    initializeDOM() {
        this.megaBoardElement = document.getElementById('mega-board');
        this.gameMessageElement = document.querySelector('.game-message');
        this.playerAvatars = document.querySelectorAll('.player-avatar');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.rulesBtn = document.getElementById('rules-btn');
        this.statsBtn = document.getElementById('stats-btn');
        this.rulesModal = document.getElementById('rules-modal');
        this.statsModal = document.getElementById('stats-modal');
        this.closeModalBtns = document.querySelectorAll('.close-btn');
        this.modeTabs = document.querySelectorAll('.mode-tab');
        this.aiSettingsDiv = document.getElementById('ai-settings');
        this.difficultyBtns = document.querySelectorAll('.diff-btn');
        this.scoreValue = document.querySelector('.score-value');
    }

    createBoard() {
        this.megaBoardElement.innerHTML = '';
        
        for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
            const miniBoard = document.createElement('div');
            miniBoard.className = 'mini-board';
            miniBoard.dataset.boardIndex = boardIndex;
            
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.dataset.boardIndex = boardIndex;
                cell.dataset.cellIndex = cellIndex;
                cell.dataset.globalIndex = boardIndex * 9 + cellIndex;
                
                miniBoard.appendChild(cell);
            }
            
            this.megaBoardElement.appendChild(miniBoard);
        }
    }

    attachEventListeners() {
        // Cell click events
        this.megaBoardElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.handleCellClick(e.target);
            }
        });

        // Control buttons
        this.newGameBtn.addEventListener('click', () => this.resetGame());
        this.rulesBtn.addEventListener('click', () => this.showModal('rules-modal'));
        this.statsBtn.addEventListener('click', () => this.showModal('stats-modal'));
        
        // Close modal buttons
        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                this.hideModal(modal.id);
            });
        });
        
        // Mode tabs - Enhanced event handling
        this.modeTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const mode = tab.getAttribute('data-mode');
                this.setGameMode(mode);
            });
        });
        
        // Additional event delegation for mode tabs (backup)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.mode-tab')) {
                const tab = e.target.closest('.mode-tab');
                const mode = tab.getAttribute('data-mode');
                if (mode) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.setGameMode(mode);
                }
            }
        });
        
        // AI difficulty buttons
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setAiDifficulty(btn.dataset.difficulty);
            });
        });
        
        // Modal close on outside click
        [this.rulesModal, this.statsModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.hideModal(modal.id);
                    }
                });
            }
        });
    }

    handleCellClick(cellElement) {
        if (this.gameState !== 'playing' || this.isAiThinking) return;
        
        // In AI mode, only allow human player (X) to click
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiPlayer) return;
        
        const boardIndex = parseInt(cellElement.dataset.boardIndex);
        const cellIndex = parseInt(cellElement.dataset.cellIndex);
        
        // Check if move is valid
        if (!this.isValidMove(boardIndex, cellIndex)) return;
        
        // Make the move
        this.makeMove(boardIndex, cellIndex, cellElement);
        
        // Process the move and check for game end
        if (this.processMoveAndCheckEnd(boardIndex, cellIndex)) return;
        
        // If AI mode and now AI's turn, make AI move
        if (this.gameMode === 'ai' && this.currentPlayer === this.aiPlayer) {
            this.makeAiMove();
        }
    }

    processMoveAndCheckEnd(boardIndex, cellIndex) {
        // Check for mini-board win
        const miniWinner = this.checkMiniboardWin(boardIndex);
        if (miniWinner) {
            this.claimMiniBoard(boardIndex, miniWinner);
            
            // Check for mega-board win
            const megaWinner = this.checkMegaboardWin();
            if (megaWinner) {
                this.endGame(megaWinner);
                return true;
            }
        }
        
        // Check for draw
        if (this.checkDraw()) {
            this.endGame('draw');
            return true;
        }
        
        // Switch players and determine next active board
        this.switchPlayer();
        this.setActiveMiniBoard(cellIndex);
        this.updateGameStatus();
        this.updateVisualState();
        
        return false;
    }

    isValidMove(boardIndex, cellIndex) {
        // Check if cell is already occupied
        if (this.miniBoards[boardIndex][cellIndex] !== null) return false;
        
        // Check if mini-board is already won
        if (this.megaBoard[boardIndex] !== null) return false;
        
        // Check if this is the correct mini-board (unless it's free choice)
        if (this.activeMiniBoard !== null && this.activeMiniBoard !== boardIndex) return false;
        
        return true;
    }

    makeMove(boardIndex, cellIndex, cellElement) {
        // Update game state
        this.miniBoards[boardIndex][cellIndex] = this.currentPlayer;
        
        // Update visual
        cellElement.textContent = this.currentPlayer;
        cellElement.classList.add(this.currentPlayer.toLowerCase());
        cellElement.classList.add('disabled');
        
        this.isFirstMove = false;
    }

    checkMiniboardWin(boardIndex) {
        const board = this.miniBoards[boardIndex];
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        return null;
    }

    checkMegaboardWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.megaBoard[a] && 
                this.megaBoard[a] === this.megaBoard[b] && 
                this.megaBoard[a] === this.megaBoard[c]) {
                return this.megaBoard[a];
            }
        }
        
        return null;
    }

    checkDraw() {
        // Game is draw if all mini-boards are either won or completely filled
        for (let i = 0; i < 9; i++) {
            if (this.megaBoard[i] === null) {
                // Check if this mini-board has any empty cells
                if (this.miniBoards[i].includes(null)) {
                    return false; // Game can continue
                }
            }
        }
        return true; // All mini-boards are won or filled
    }

    claimMiniBoard(boardIndex, winner) {
        this.megaBoard[boardIndex] = winner;
        
        const miniBoardElement = document.querySelector(`[data-board-index="${boardIndex}"]`);
        miniBoardElement.classList.add('won', 'win-animation');
        miniBoardElement.dataset.winner = winner;
        
        // Disable all cells in this mini-board
        const cells = miniBoardElement.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.add('disabled'));
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updatePlayerIndicator();
    }
    
    updatePlayerIndicator() {
        this.playerAvatars.forEach(avatar => {
            const playerSymbol = avatar.querySelector('.player-symbol').textContent;
            if (playerSymbol === this.currentPlayer) {
                avatar.classList.add('current');
            } else {
                avatar.classList.remove('current');
            }
        });
    }

    setActiveMiniBoard(cellIndex) {
        // The next player must play in mini-board corresponding to cellIndex
        // unless that board is won or full
        if (this.megaBoard[cellIndex] === null && this.miniBoards[cellIndex].includes(null)) {
            this.activeMiniBoard = cellIndex;
        } else {
            // Free choice - any available mini-board
            this.activeMiniBoard = null;
        }
    }

    updateVisualState() {
        // Remove active class from all mini-boards
        document.querySelectorAll('.mini-board').forEach(board => {
            board.classList.remove('active');
        });
        
        // Add active class to valid mini-boards
        if (this.activeMiniBoard !== null) {
            const activeBoard = document.querySelector(`[data-board-index="${this.activeMiniBoard}"]`);
            activeBoard.classList.add('active');
        } else {
            // Free choice - highlight all available boards
            document.querySelectorAll('.mini-board').forEach((board, index) => {
                if (this.megaBoard[index] === null && this.miniBoards[index].includes(null)) {
                    board.classList.add('active');
                }
            });
        }
    }

    updateGameStatus() {
        let status = '';
        
        if (this.gameState === 'playing') {
            if (this.isAiThinking) {
                status = '🤖 AI is thinking...';
            } else if (this.isFirstMove) {
                if (this.gameMode === 'ai') {
                    status = `🎯 Your turn - Choose any cell to start`;
                } else {
                    status = `🎮 Player ${this.currentPlayer}'s turn - Choose any cell to start`;
                }
            } else if (this.activeMiniBoard !== null) {
                if (this.gameMode === 'ai') {
                    if (this.currentPlayer === this.humanPlayer) {
                        status = `🎯 Your turn - Play in mini-board ${this.activeMiniBoard + 1}`;
                    } else {
                        status = `🤖 AI's turn - Playing in mini-board ${this.activeMiniBoard + 1}`;
                    }
                } else {
                    status = `🎮 Player ${this.currentPlayer} must play in mini-board ${this.activeMiniBoard + 1}`;
                }
            } else {
                if (this.gameMode === 'ai') {
                    if (this.currentPlayer === this.humanPlayer) {
                        status = `🎯 Your turn - Free choice!`;
                    } else {
                        status = `🤖 AI's turn - Free choice!`;
                    }
                } else {
                    status = `🎮 Player ${this.currentPlayer}'s turn - Free choice!`;
                }
            }
        } else if (this.gameState === 'won') {
            if (this.gameMode === 'ai') {
                status = this.winner === this.humanPlayer ? 
                    `🎉 You win! Amazing! 🎉` : 
                    `🤖 AI wins! Better luck next time!`;
            } else {
                status = `🎉 Player ${this.winner} wins the game! 🎉`;
            }
        } else if (this.gameState === 'draw') {
            status = `🤝 Game ended in a draw! Well played!`;
        }
        
        this.gameMessageElement.textContent = status;
    }

    endGame(result) {
        this.gameState = result === 'draw' ? 'draw' : 'won';
        this.winner = result === 'draw' ? null : result;
        this.isAiThinking = false;
        
        // Update statistics
        this.stats.gamesPlayed++;
        if (result === 'draw') {
            this.stats.draws++;
        } else if (this.gameMode === 'ai') {
            if (result === this.humanPlayer) {
                this.stats.humanWins++;
            } else {
                this.stats.aiWins++;
            }
        }
        this.saveStats();
        this.updateStats();
        
        // Disable all cells
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.add('disabled');
        });
        
        // Remove active states
        document.querySelectorAll('.mini-board').forEach(board => {
            board.classList.remove('active');
        });
        
        this.updateGameStatus();
        
        // Show celebration or result after a delay
        setTimeout(() => {
            if (result === 'draw') {
                alert('🤝 Game ended in a draw! Well played!');
            } else if (this.gameMode === 'ai') {
                if (result === this.humanPlayer) {
                    alert('🎉 Congratulations! You beat the AI! 🎉');
                } else {
                    alert('🤖 AI wins this round! Try again?');
                }
            } else {
                alert(`🎉 Congratulations Player ${result}! You won! 🎉`);
            }
        }, 500);
    }

    resetGame() {
        this.currentPlayer = 'X';
        this.gameState = 'playing';
        this.winner = null;
        this.activeMiniBoard = null;
        this.isFirstMove = true;
        this.isAiThinking = false;
        
        this.megaBoard = Array(9).fill(null);
        this.miniBoards = Array(9).fill(null).map(() => Array(9).fill(null));
        
        this.createBoard();
        this.updateGameStatus();
        this.updatePlayerIndicator();
        this.updateStats();
    }

    setGameMode(mode) {
        this.gameMode = mode;
        
        // Force remove active class from all tabs first
        this.modeTabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Add active class to the selected tab
        this.modeTabs.forEach(tab => {
            if (tab.getAttribute('data-mode') === mode) {
                tab.classList.add('active');
            }
        });
        
        // Show/hide AI settings with animation
        if (this.aiSettingsDiv) {
            if (mode === 'ai') {
                this.aiSettingsDiv.style.display = 'block';
                // Force reflow for animation
                this.aiSettingsDiv.offsetHeight;
                this.aiSettingsDiv.classList.add('visible');
            } else {
                this.aiSettingsDiv.style.display = 'none';
                this.aiSettingsDiv.classList.remove('visible');
            }
        }
        
        // Update player names
        this.updatePlayerNames();
        
        // Reset game when switching modes
        this.resetGame();
    }
    
    setAiDifficulty(difficulty) {
        this.aiDifficulty = difficulty;
        
        // Update UI
        this.difficultyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
        });
    }
    
    updatePlayerNames() {
        const playerNames = document.querySelectorAll('.player-name');
        if (this.gameMode === 'ai') {
            if (playerNames[0]) playerNames[0].textContent = 'You';
            if (playerNames[1]) playerNames[1].textContent = 'AI';
        } else {
            if (playerNames[0]) playerNames[0].textContent = 'Player X';
            if (playerNames[1]) playerNames[1].textContent = 'Player O';
        }
    }
    
    updateStats() {
        if (this.scoreValue) {
            this.scoreValue.textContent = this.stats.gamesPlayed;
        }
        
        // Update stats modal if elements exist
        const statsElements = {
            'stat-games': this.stats.gamesPlayed,
            'stat-human-wins': this.stats.humanWins,
            'stat-ai-wins': this.stats.aiWins,
            'stat-draws': this.stats.draws
        };
        
        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    saveStats() {
        localStorage.setItem('mttt-games-played', this.stats.gamesPlayed.toString());
        localStorage.setItem('mttt-human-wins', this.stats.humanWins.toString());
        localStorage.setItem('mttt-ai-wins', this.stats.aiWins.toString());
        localStorage.setItem('mttt-draws', this.stats.draws.toString());
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            if (modalId === 'stats-modal') {
                this.updateStats();
            }
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async makeAiMove() {
        if (this.gameState !== 'playing' || this.currentPlayer !== this.aiPlayer) return;
        
        this.isAiThinking = true;
        this.updateGameStatus();
        
        // Add thinking delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        const move = this.calculateAiMove();
        
        if (move) {
            const cellElement = document.querySelector(
                `[data-board-index="${move.boardIndex}"][data-cell-index="${move.cellIndex}"]`
            );
            
            if (cellElement) {
                this.makeMove(move.boardIndex, move.cellIndex, cellElement);
                this.processMoveAndCheckEnd(move.boardIndex, move.cellIndex);
            }
        }
        
        this.isAiThinking = false;
    }

    calculateAiMove() {
        const validMoves = this.getValidMoves();
        if (validMoves.length === 0) return null;
        
        switch (this.aiDifficulty) {
            case 'easy':
                return this.getRandomMove(validMoves);
            case 'medium':
                return this.getMediumMove(validMoves);
            case 'hard':
                return this.getHardMove(validMoves);
            default:
                return this.getRandomMove(validMoves);
        }
    }

    getValidMoves() {
        const moves = [];
        
        for (let boardIndex = 0; boardIndex < 9; boardIndex++) {
            // Skip if board is won
            if (this.megaBoard[boardIndex] !== null) continue;
            
            // Check if this board is available for play
            if (this.activeMiniBoard !== null && this.activeMiniBoard !== boardIndex) continue;
            
            for (let cellIndex = 0; cellIndex < 9; cellIndex++) {
                if (this.miniBoards[boardIndex][cellIndex] === null) {
                    moves.push({ boardIndex, cellIndex });
                }
            }
        }
        
        return moves;
    }

    getRandomMove(validMoves) {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    getMediumMove(validMoves) {
        // Try to win a mini-board first
        const winningMove = this.findWinningMove(validMoves, this.aiPlayer);
        if (winningMove) return winningMove;
        
        // Block human from winning a mini-board
        const blockingMove = this.findWinningMove(validMoves, this.humanPlayer);
        if (blockingMove) return blockingMove;
        
        // Otherwise random
        return this.getRandomMove(validMoves);
    }

    getHardMove(validMoves) {
        // Try to win the mega-board
        const megaWinMove = this.findMegaWinningMove(validMoves);
        if (megaWinMove) return megaWinMove;
        
        // Block human from winning mega-board
        const megaBlockMove = this.findMegaBlockingMove(validMoves);
        if (megaBlockMove) return megaBlockMove;
        
        // Try to win a mini-board
        const winningMove = this.findWinningMove(validMoves, this.aiPlayer);
        if (winningMove) return winningMove;
        
        // Block human from winning a mini-board
        const blockingMove = this.findWinningMove(validMoves, this.humanPlayer);
        if (blockingMove) return blockingMove;
        
        // Strategic move: prefer center cells and corners
        const strategicMove = this.getStrategicMove(validMoves);
        if (strategicMove) return strategicMove;
        
        return this.getRandomMove(validMoves);
    }

    findWinningMove(validMoves, player) {
        for (const move of validMoves) {
            // Simulate the move
            this.miniBoards[move.boardIndex][move.cellIndex] = player;
            const isWin = this.checkMiniboardWin(move.boardIndex) === player;
            // Undo the move
            this.miniBoards[move.boardIndex][move.cellIndex] = null;
            
            if (isWin) return move;
        }
        return null;
    }

    findMegaWinningMove(validMoves) {
        for (const move of validMoves) {
            // Simulate winning the mini-board
            const originalWinner = this.megaBoard[move.boardIndex];
            this.megaBoard[move.boardIndex] = this.aiPlayer;
            const isWin = this.checkMegaboardWin() === this.aiPlayer;
            // Undo the simulation
            this.megaBoard[move.boardIndex] = originalWinner;
            
            if (isWin) {
                // Check if this move actually wins the mini-board
                this.miniBoards[move.boardIndex][move.cellIndex] = this.aiPlayer;
                const winsBoard = this.checkMiniboardWin(move.boardIndex) === this.aiPlayer;
                this.miniBoards[move.boardIndex][move.cellIndex] = null;
                
                if (winsBoard) return move;
            }
        }
        return null;
    }

    findMegaBlockingMove(validMoves) {
        for (const move of validMoves) {
            // Simulate human winning the mini-board
            const originalWinner = this.megaBoard[move.boardIndex];
            this.megaBoard[move.boardIndex] = this.humanPlayer;
            const humanWins = this.checkMegaboardWin() === this.humanPlayer;
            // Undo the simulation
            this.megaBoard[move.boardIndex] = originalWinner;
            
            if (humanWins) {
                // Check if human could actually win this mini-board
                const humanCanWin = this.findWinningMove([move], this.humanPlayer);
                if (humanCanWin) return move;
            }
        }
        return null;
    }

    getStrategicMove(validMoves) {
        // Prefer center cells (index 4) and corners (0, 2, 6, 8)
        const priorities = [4, 0, 2, 6, 8, 1, 3, 5, 7];
        
        for (const cellIndex of priorities) {
            const strategicMoves = validMoves.filter(move => move.cellIndex === cellIndex);
            if (strategicMoves.length > 0) {
                return strategicMoves[Math.floor(Math.random() * strategicMoves.length)];
            }
        }
        
        return null;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Fix viewport height on mobile devices
    function setViewportHeight() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Set initial viewport height
    setViewportHeight();
    
    // Update viewport height on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
        setTimeout(setViewportHeight, 100);
    });
    
    new MegaTicTacToe();
});

// Prevent zoom on double tap (mobile)
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Add service worker for offline capability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
