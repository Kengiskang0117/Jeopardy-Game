const apiUrl = 'https://opentdb.com/api.php';

const numCategories = 6;
const numQuestions = 5;

const gameState = Array.from({ length: numQuestions }, () =>
  Array.from({ length: numCategories }, () => ({ question: '?', answer: 'Answer' }))
);

async function fetchCategoriesAndQuestions() {
  try {
    const response = await fetch(`${apiUrl}?amount=${numCategories}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    for (let col = 0; col < numCategories; col++) {
      const categoryName = data.results[col].category;
      const questionsResponse = await fetch(`${apiUrl}?amount=${numQuestions}&category=${categoryName}`);
      if (!questionsResponse.ok) {
        throw new Error('Network response was not ok');
      }
      const questionsData = await questionsResponse.json();

      for (let row = 0; row < numQuestions; row++) {
        gameState[row][col] = { question: '?', answer: 'Answer' };
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
      const response = await fetch(`${apiUrl}?amount=1&type=multiple`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const question = data.results[0].question;
      const answer = data.results[0].correct_answer;

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
