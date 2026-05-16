import React, { useState, useEffect, useRef } from 'react';
import { getNotes, generateNote, getChatHistory, sendChatMessage } from '../api/ai';
import Spinner from './Spinner';

export default function AIAssistant({ subjectId }) {
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingChat, setLoadingChat] = useState(true);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchNotes();
    fetchChatHistory();
  }, [subjectId]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const data = await getNotes(subjectId);
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingNotes(false);
  };

  const fetchChatHistory = async () => {
    setLoadingChat(true);
    try {
      const data = await getChatHistory(subjectId);
      setChatHistory(data);
    } catch (err) {
      console.error(err);
    }
    setLoadingChat(false);
  };

  const handleGenerateNote = async (promptType) => {
    setIsGeneratingNote(true);
    try {
      const newNote = await generateNote(subjectId, promptType);
      setNotes([newNote, ...notes]);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate note.');
    }
    setIsGeneratingNote(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const msg = messageInput.trim();
    setMessageInput('');
    setChatHistory([...chatHistory, { role: 'user', content: msg }]);
    setIsSendingMessage(true);
    try {
      const newMsg = await sendChatMessage(subjectId, msg);
      setChatHistory(prev => [...prev, newMsg]);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send message.');
    }
    setIsSendingMessage(false);
  };

  const renderNotes = () => {
    if (loadingNotes) return <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner /></div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleGenerateNote('full')} disabled={isGeneratingNote} style={btnStyle}>
            {isGeneratingNote ? 'Generating...' : 'Generate Full Notes'}
          </button>
          <button onClick={() => handleGenerateNote('short')} disabled={isGeneratingNote} style={btnStyle}>
            {isGeneratingNote ? 'Generating...' : 'Generate Short Notes'}
          </button>
          <button onClick={() => handleGenerateNote('qna')} disabled={isGeneratingNote} style={btnStyle}>
            {isGeneratingNote ? 'Generating...' : 'Generate Q&A'}
          </button>
        </div>
        {notes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No notes generated yet.</p>
        ) : (
          notes.map(note => (
            <div key={note.id} style={{ background: 'var(--bg-2)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{note.title}</h3>
              <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {note.content}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderChat = () => {
    if (loadingChat) return <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Spinner /></div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {chatHistory.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>Start a conversation about the playlist...</p>
          ) : (
            chatHistory.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ 
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-3)', 
                  color: msg.role === 'user' ? '#fff' : 'var(--text)', 
                  padding: '12px 16px', 
                  borderRadius: '12px',
                  borderBottomRightRadius: msg.role === 'user' ? '0' : '12px',
                  borderBottomLeftRadius: msg.role === 'model' ? '0' : '12px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isSendingMessage && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
               <div style={{ background: 'var(--bg-3)', padding: '12px 16px', borderRadius: '12px', borderBottomLeftRadius: '0' }}>
                 <Spinner size={16} />
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '15px', borderTop: '1px solid var(--border)', background: 'var(--bg-1)', borderBottomLeftRadius: 'var(--radius)', borderBottomRightRadius: 'var(--radius)' }}>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ask a question about this subject..."
            style={{ flex: 1, padding: '10px 15px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text)', outline: 'none' }}
            disabled={isSendingMessage}
          />
          <button type="submit" disabled={isSendingMessage || !messageInput.trim()} style={{ marginLeft: '10px', padding: '0 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer', fontWeight: 600 }}>
            Send
          </button>
        </form>
      </div>
    );
  };

  const btnStyle = { padding: '8px 16px', borderRadius: 'var(--radius)', background: 'var(--bg-3)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500, fontSize: '13px' };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('notes')} style={{ ...btnStyle, background: activeTab === 'notes' ? 'var(--bg-3)' : 'transparent', borderColor: activeTab === 'notes' ? 'var(--border-hover)' : 'transparent' }}>Generated Notes</button>
        <button onClick={() => setActiveTab('chat')} style={{ ...btnStyle, background: activeTab === 'chat' ? 'var(--bg-3)' : 'transparent', borderColor: activeTab === 'chat' ? 'var(--border-hover)' : 'transparent' }}>AI Chat</button>
      </div>
      {activeTab === 'notes' ? renderNotes() : renderChat()}
    </div>
  );
}
