class SudokuGame {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.difficulty = 'medium';
        this.init();
    }

    init() {
        this.createGrid();
        this.setupEventListeners();
        this.newGame();
    }

    createGrid() {
        const gridElement = document.getElementById('sudoku-grid');
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.selectCell(i));
            gridElement.appendChild(cell);
        }
    }

    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('solve').addEventListener('click', () => this.showSolution());
        document.getElementById('clear').addEventListener('click', () => this.clearGrid());
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });

        document.addEventListener('keydown', (e) => {
            if (this.selectedCell !== null && e.key >= '1' && e.key <= '9') {
                this.placeNumber(parseInt(e.key));
            } else if (this.selectedCell !== null && (e.key === 'Delete' || e.key === 'Backspace')) {
                this.placeNumber(0);
            }
        });
    }

    selectCell(index) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => cell.classList.remove('selected'));
        
        this.selectedCell = index;
        cells[index].classList.add('selected');
    }

    placeNumber(num) {
        if (this.selectedCell === null) return;
        
        const row = Math.floor(this.selectedCell / 9);
        const col = this.selectedCell % 9;
        
        if (this.grid[row][col] !== 0 && document.querySelectorAll('.cell')[this.selectedCell].classList.contains('given')) {
            return;
        }

        this.grid[row][col] = num;
        this.updateDisplay();
        
        if (num !== 0) {
            this.validateMove(row, col, num);
        }
        
        if (this.isComplete()) {
            this.showMessage('Congratulations! You solved the puzzle!', 'success');
        }
    }

    validateMove(row, col, num) {
        const isValid = this.isValidMove(row, col, num);
        const cell = document.querySelectorAll('.cell')[row * 9 + col];
        
        cell.classList.remove('error', 'correct');
        if (!isValid) {
            cell.classList.add('error');
            this.showMessage('Invalid move!', 'error');
        } else {
            cell.classList.add('correct');
            this.showMessage('', '');
        }
    }

    isValidMove(row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (i !== col && this.grid[row][i] === num) return false;
            if (i !== row && this.grid[i][col] === num) return false;
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (i !== row && j !== col && this.grid[i][j] === num) return false;
            }
        }

        return true;
    }

    generateSolution() {
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.solveSudoku(this.solution);
    }

    solveSudoku(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (let num of numbers) {
                        if (this.isValidPlacement(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (this.solveSudoku(grid)) {
                                return true;
                            }
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValidPlacement(grid, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num || grid[i][col] === num) return false;
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (grid[i][j] === num) return false;
            }
        }

        return true;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    createPuzzle() {
        this.grid = this.solution.map(row => [...row]);
        
        const difficultySettings = {
            easy: 35,
            medium: 45,
            hard: 55
        };
        
        const cellsToRemove = difficultySettings[this.difficulty];
        const cellIndices = this.shuffleArray(Array.from({length: 81}, (_, i) => i));
        
        for (let i = 0; i < cellsToRemove; i++) {
            const index = cellIndices[i];
            const row = Math.floor(index / 9);
            const col = index % 9;
            this.grid[row][col] = 0;
        }
    }

    newGame() {
        this.showMessage('Generating new puzzle...', '');
        setTimeout(() => {
            this.generateSolution();
            this.createPuzzle();
            this.updateDisplay();
            this.markGivenCells();
            this.showMessage('New game started!', 'success');
        }, 100);
    }

    markGivenCells() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            
            cell.classList.remove('given', 'error', 'correct');
            if (this.grid[row][col] !== 0) {
                cell.classList.add('given');
            }
        });
    }

    updateDisplay() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.grid[row][col];
            cell.textContent = value === 0 ? '' : value;
        });
    }

    showSolution() {
        this.grid = this.solution.map(row => [...row]);
        this.updateDisplay();
        this.showMessage('Solution revealed!', 'success');
        
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('given', 'error');
            cell.classList.add('correct');
        });
    }

    clearGrid() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            
            if (!cell.classList.contains('given')) {
                this.grid[row][col] = 0;
                cell.textContent = '';
                cell.classList.remove('error', 'correct');
            }
        });
        this.showMessage('User entries cleared!', '');
    }

    isComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) return false;
                if (!this.isValidMove(row, col, this.grid[row][col])) return false;
            }
        }
        return true;
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        
        if (type === 'error') {
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = 'message';
            }, 3000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});