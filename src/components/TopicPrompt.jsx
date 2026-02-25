import React, { useState } from 'react';

function TopicPrompt({ onTopicSelected }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await onTopicSelected(trimmed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="topic-prompt">
      <h2 className="topic-heading">What would you like students to practice?</h2>
      <p className="topic-subtext">
        Describe the type of graphing questions you'd like — lines, parabolas, circles, or a mix of everything.
      </p>
      <form className="topic-form" onSubmit={handleSubmit}>
        <input
          className="topic-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='e.g. "parabolas", "circles", "lines from equations", or "mix of everything"'
          disabled={loading}
          autoFocus
        />
        <button className="btn btn-submit topic-btn" type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Matching...' : 'Start'}
        </button>
      </form>
    </div>
  );
}

export default TopicPrompt;
