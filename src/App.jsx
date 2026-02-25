import React, { useState, useRef, useCallback } from 'react';
import './App.css';
import TwoPointDrawing from './components/TwoPointDrawing';
import ParabolaGraphing from './components/ParabolaGraphing';
import CircleDrawing from './components/CircleDrawing';
import TopicPrompt from './components/TopicPrompt';
import { createQuestion, createRandomQuestion, graphTypeForQuestion } from './engine/questionRegistry.js';
import { buildFeedback } from './engine/feedback/buildFeedback.js';
import { matchTopic } from './engine/topicMatcher.js';

function makeQuestion(topicId) {
  return topicId === 'mixed' ? createRandomQuestion() : createQuestion(topicId);
}

function App() {
  const drawingRef = useRef(null);
  const [topicId, setTopicId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleTopicSelected = useCallback(async (userInput) => {
    const matched = await matchTopic(userInput);
    setTopicId(matched);
    setCurrentQuestion(makeQuestion(matched));
    setFeedback(null);
    setIsCorrect(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!drawingRef.current || !currentQuestion) return;
    const studentData = drawingRef.current.getStudentDrawingData();
    const result = currentQuestion.grade(studentData);

    setIsCorrect(result.isCorrect);

    if (result.isCorrect) {
      setFeedback(null);
    } else {
      const questions = buildFeedback(result, currentQuestion.typeId);
      setFeedback(questions);
    }
  }, [currentQuestion]);

  const handleNewQuestion = useCallback(() => {
    if (drawingRef.current) drawingRef.current.reset();
    setCurrentQuestion(makeQuestion(topicId));
    setFeedback(null);
    setIsCorrect(null);
  }, [topicId]);

  const handleNewTopic = useCallback(() => {
    if (drawingRef.current) drawingRef.current.reset();
    setTopicId(null);
    setCurrentQuestion(null);
    setFeedback(null);
    setIsCorrect(null);
  }, []);

  const graphType = currentQuestion ? graphTypeForQuestion(currentQuestion.typeId) : 'linear';

  if (!topicId) {
    return (
      <div className="app-container">
        <main className="app-main">
          <div className="card">
            <TopicPrompt onTopicSelected={handleTopicSelected} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <main className="app-main">
        <div className="card">
          <h2 className="prompt-text">{currentQuestion?.prompt}</h2>

          <div className="applet-wrapper">
            {graphType === 'parabola' && <ParabolaGraphing ref={drawingRef} />}
            {graphType === 'circle' && <CircleDrawing ref={drawingRef} />}
            {graphType === 'linear' && <TwoPointDrawing ref={drawingRef} />}
          </div>

          <div className="toolbar">
            <button className="btn btn-submit" onClick={handleSubmit}>
              Submit
            </button>
            <button className="btn btn-new" onClick={handleNewQuestion}>
              New Question
            </button>
            <button className="btn btn-topic" onClick={handleNewTopic}>
              New Topic
            </button>
          </div>
        </div>

        {isCorrect !== null && (
          <div className={`feedback-card ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
            {isCorrect ? (
              <p className="feedback-text correct-text">Answer correct.</p>
            ) : (
              <>
                <p className="feedback-heading">Not quite — consider these questions:</p>
                <ul className="feedback-list">
                  {feedback && feedback.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
