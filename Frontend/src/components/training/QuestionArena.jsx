import React from 'react';

const QuestionArena = ({ question, onAnswer }) => {
    if (!question) return <div className="loading-arena">Preparing next challenge...</div>;

    return (
        <div className="question-arena">
            <div className="arena-header">
                <span className="topic-tag">{question.topic}</span>
                <span className="difficulty-tag">LVL {question.difficulty}</span>
            </div>
            <h3 className="arena-question">{question.question}</h3>
            <div className="options-grid">
                {question.options.map((option, idx) => (
                    <button
                        key={idx}
                        className="option-btn"
                        onClick={() => onAnswer(option)}
                    >
                        <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuestionArena;
