import React, { useState, useEffect } from "react";
import Question from "./components/Question";
import { decode } from "html-entities"; // The API returns some HTML char codes, so I need this to display the correct message

export default function App() {
  const [startScreen, setStartScreen] = useState(true);
  const [checkAnswers, setCheckAnswers] = useState(false);
  const [questions, setQuestions] = useState([]);

  // I created this function by myself and I'm proud of it \º/
  function shuffleArray(arr) {
    if (arr.length <= 1) {
      return arr;
    }
    let newArr = [...arr];
    const randomIndex = Math.floor(Math.random() * newArr.length);
    return [...newArr.splice(randomIndex, 1), ...shuffleArray(newArr)];
  }

  useEffect(() => {
    if (!checkAnswers) {
      // Runs at the begining and after clicking on "Play again"
      fetch(
        "https://opentdb.com/api.php?amount=5&category=18&difficulty=easy&type=multiple"
      )
        .then((res) => res.json())
        .then((data) =>
          setQuestions(
            data.results.map((question) => {
              const answers = [
                {
                  answer: decode(question.correct_answer),
                  correct: true,
                },
                ...question.incorrect_answers.map((answer) => ({
                  answer: decode(answer),
                })),
              ];
              return {
                question: decode(question.question),
                answers: shuffleArray(answers),
              };
            })
          )
        );
    }
  }, [checkAnswers]);

  function check() {
    setCheckAnswers((prev) => {
      if (!prev) {
        // Check answers
        return true;
      }
      setQuestions([]); // Play again
      return false;
    });
  }

  function selectAnswer(questionIndex, answerIndex) {
    if (!checkAnswers) {
      // If I'm checking the results I can't select answers anymore
      setQuestions((prev) =>
        prev.map((question, index) => {
          if (index === questionIndex) {
            let answers = question.answers.map((answer, index) => {
              return { ...answer, selected: index === answerIndex };
            });
            return { ...question, answers };
          }
          return question;
        })
      );
    }
  }

  function countCorrect() {
    let correctAnswers = 0;
    questions.forEach((question) => {
      question.answers.forEach((answer) => {
        if (answer.selected && answer.correct) {
          correctAnswers++;
        }
      });
    });
    return correctAnswers;
  }

  const questionElements = questions.map((question, index) => (
    <Question
      key={index}
      question={question.question}
      answers={question.answers}
      validate={checkAnswers}
      selectAnswer={(answerIndex) => selectAnswer(index, answerIndex)}
    />
  ));

  return startScreen ? (
    <div className="container container--start">
      <img className="blob blob--bottom" src="./images/blob-start-blue.png" />
      <div className="start">
        <h1>Quizzical</h1>
        <p>Check your knowledge about Computer Science</p>
        <button
          onClick={() => setStartScreen(false)}
          className="btn btn--start"
        >
          Start quiz
        </button>
      </div>
      <img className="blob blob--top" src="./images/blob-start-yellow.png" />
    </div>
  ) : (
    <div className="container">
      <img className="blob blob--bottom" src="./images/blob-quizz-blue.png" />
      <div className="quizz">
        {questions.length === 5 ? (
          <>
            {questionElements}
            <div className={`check ${checkAnswers ? "checked" : ""}`}>
              {checkAnswers && (
                <p>You scored {countCorrect()}/5 correct answers</p>
              )}
              <button onClick={check} className="btn">
                {!checkAnswers ? "Check answers" : "Play again"}
              </button>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <img className="blob blob--top" src="./images/blob-quizz-yellow.png" />
    </div>
  );
}
