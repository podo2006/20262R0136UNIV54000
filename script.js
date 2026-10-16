"use strict";

const BOARD_SIZE = 4;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

let board = Array(CELL_COUNT).fill(0);
let score = 0;
let winAcknowledged = false;
let inputLocked = false;

function mergeLine(line) {
  const values = line.filter((value) => value !== 0);
  const merged = [];
  let gainedScore = 0;

  for (let index = 0; index < values.length; index += 1) {
    if (values[index] === values[index + 1]) {
      const combinedValue = values[index] * 2;
      merged.push(combinedValue);
      gainedScore += combinedValue;
      index += 1;
    } else {
      merged.push(values[index]);
    }
  }

  while (merged.length < BOARD_SIZE) {
    merged.push(0);
  }

  return { line: merged, score: gainedScore };
}

function addRandomTile() {
  const emptyIndexes = [];

  board.forEach((value, index) => {
    if (value === 0) {
      emptyIndexes.push(index);
    }
  });

  if (emptyIndexes.length === 0) {
    return;
  }

  const targetIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  board[targetIndex] = Math.random() < 0.9 ? 2 : 4;
}

function calculateMove(direction) {
  const nextBoard = Array(CELL_COUNT).fill(0);
  let gainedScore = 0;

  for (let lineIndex = 0; lineIndex < BOARD_SIZE; lineIndex += 1) {
    let line;

    if (direction === "left" || direction === "right") {
      const rowStart = lineIndex * BOARD_SIZE;
      line = board.slice(rowStart, rowStart + BOARD_SIZE);
    } else {
      line = [];
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        line.push(board[row * BOARD_SIZE + lineIndex]);
      }
    }

    const isReverse = direction === "right" || direction === "down";
    const preparedLine = isReverse ? line.slice().reverse() : line;
    const result = mergeLine(preparedLine);
    const movedLine = isReverse ? result.line.slice().reverse() : result.line;
    gainedScore += result.score;

    for (let offset = 0; offset < BOARD_SIZE; offset += 1) {
      if (direction === "left" || direction === "right") {
        nextBoard[lineIndex * BOARD_SIZE + offset] = movedLine[offset];
      } else {
        nextBoard[offset * BOARD_SIZE + lineIndex] = movedLine[offset];
      }
    }
  }

  return { board: nextBoard, score: gainedScore };
}

function isGameOver() {
  if (board.includes(0)) {
    return false;
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const index = row * BOARD_SIZE + column;

      if (column < BOARD_SIZE - 1 && board[index] === board[index + 1]) {
        return false;
      }

      if (row < BOARD_SIZE - 1 && board[index] === board[index + BOARD_SIZE]) {
        return false;
      }
    }
  }

  return true;
}

function setupGame() {
  const boardElement = document.querySelector("#board");
  const scoreElement = document.querySelector("#score");
  const newGameButton = document.querySelector("#new-game");
  const overlay = document.querySelector("#overlay");
  const modalTitle = document.querySelector("#modal-title");
  const modalMessage = document.querySelector("#modal-message");
  const continueButton = document.querySelector("#continue-game");
  const restartButton = document.querySelector("#restart-game");
  const directionButtons = document.querySelectorAll("[data-direction]");

  function render() {
    boardElement.replaceChildren();

    board.forEach((value) => {
      const tile = document.createElement("div");
      const valueClass = value > 2048 ? "tile-super" : `tile-${value}`;
      tile.className = `tile ${valueClass}`;
      tile.setAttribute("role", "gridcell");
      tile.setAttribute("aria-label", value === 0 ? "빈 칸" : String(value));
      tile.textContent = value === 0 ? "" : String(value);
      boardElement.append(tile);
    });

    scoreElement.textContent = String(score);
  }

  function hideOverlay() {
    overlay.hidden = true;
    inputLocked = false;
  }

  function showOverlay(type) {
    inputLocked = true;
    overlay.hidden = false;

    if (type === "win") {
      modalTitle.textContent = "승리!";
      modalMessage.textContent = "2048 타일을 만들었습니다.";
      continueButton.hidden = false;
      continueButton.focus();
    } else {
      modalTitle.textContent = "게임 오버";
      modalMessage.textContent = "더 이상 움직일 수 없습니다.";
      continueButton.hidden = true;
      restartButton.focus();
    }
  }

  function checkGameState() {
    if (!winAcknowledged && board.some((value) => value >= 2048)) {
      showOverlay("win");
      return;
    }

    if (isGameOver()) {
      showOverlay("game-over");
    }
  }

  function move(direction) {
    if (inputLocked) {
      return;
    }

    const result = calculateMove(direction);
    const changed = result.board.some((value, index) => value !== board[index]);

    if (!changed) {
      return;
    }

    board = result.board;
    score += result.score;
    addRandomTile();
    render();
    checkGameState();
  }

  function startNewGame() {
    board = Array(CELL_COUNT).fill(0);
    score = 0;
    winAcknowledged = false;
    inputLocked = false;
    overlay.hidden = true;
    continueButton.hidden = false;
    addRandomTile();
    addRandomTile();
    render();
  }

  directionButtons.forEach((button) => {
    button.addEventListener("click", () => move(button.dataset.direction));
  });

  document.addEventListener("keydown", (event) => {
    const directions = {
      ArrowUp: "up",
      ArrowLeft: "left",
      ArrowDown: "down",
      ArrowRight: "right"
    };
    const direction = directions[event.key];

    if (direction) {
      event.preventDefault();
      move(direction);
    }
  });

  newGameButton.addEventListener("click", startNewGame);
  restartButton.addEventListener("click", startNewGame);
  continueButton.addEventListener("click", () => {
    winAcknowledged = true;
    hideOverlay();

    if (isGameOver()) {
      showOverlay("game-over");
    }
  });

  startNewGame();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", setupGame);
}
