const apiUrl = 'http://jservice.io/api/';

const numCategories = 6;
const numQuestions = 5;

const gameState = Array.from({ length: numQuestions }, () =>
  Array.from({ length: numCategories }, () => ({ question: '?', answer: 'Answer' }))
);

async function fetchCategoriesAndQuestions() {
  try {
    const response = await fetch(apiUrl + 'categories?count=6');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const categoriesData = await response.json();

    for (let col = 0; col < numCategories; col++) {
      const categoryId = categoriesData[col].id;
      const questionsResponse = await fetch(apiUrl + `clues?category=${categoryId}&count=${numQuestions}`);
      if (!questionsResponse.ok) {
        throw new Error('Network response was not ok');
      }
      const questionsData = await questionsResponse.json();

      for (let row = 0; row < numQuestions; row++) {
        gameState[row][col] = { question: '?', answer: 'Answer' }; // Inicializa con '?'
      }
    }
    updateGameTable();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function updateGameTable() {
  const table = document.querySelector('table');
  for (let row = 0; row < numQuestions; row++) {
    const tr = table.rows[row + 1];
    for (let col = 0; col < numCategories; col++) {
      const cell = tr.cells[col];
      cell.textContent = gameState[row][col].question;
      cell.classList.add('clickable');
      cell.addEventListener('click', () => onCellClick(row, col));
    }
  }
}

async function onCellClick(row, col) {
  if (gameState[row][col].question === '?') {
    try {
      const response = await fetch(apiUrl + 'random');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const question = data[0].question;
      const answer = data[0].answer;

      gameState[row][col].question = question;
      gameState[row][col].answer = answer;

      updateGameTable();
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  } else if (gameState[row][col].answer !== 'Answer') {
    gameState[row][col].answer = 'Answer';
    updateGameTable();
  }
}

function restartGame() {
  for (let row = 0; row < numQuestions; row++) {
    for (let col = 0; col < numCategories; col++) {
      gameState[row][col] = { question: '?', answer: 'Answer' };
    }
  }
  updateGameTable();
}

document.getElementById('restart-button').addEventListener('click', restartGame);

fetchCategoriesAndQuestions();
