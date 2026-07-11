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
    if (loadingNotes) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner size={28} /></div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { type: 'full', label: 'Full Notes' },
            { type: 'short', label: 'Summary' },
            { type: 'qna', label: 'Q&A Prep' }
          ].map(btn => (
            <button 
              key={btn.type}
              onClick={() => handleGenerateNote(btn.type)} 
              disabled={isGeneratingNote} 
              style={{
                padding: '9px 16px', 
                borderRadius: 'var(--radius)', 
                background: 'var(--bg-2)', 
                color: 'var(--text)', 
                border: '1px solid var(--border)', 
                cursor: isGeneratingNote ? 'not-allowed' : 'pointer', 
                fontWeight: 600, 
                fontSize: '13px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { if (!isGeneratingNote) e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { if (!isGeneratingNote) e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              {isGeneratingNote ? 'Generating...' : `Generate ${btn.label}`}
            </button>
          ))}
        </div>
        {notes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>No notes generated yet. Click one of the buttons above to build AI notes!</p>
        ) : (
          notes.map(note => (
            <div key={note.id} style={{ background: 'var(--bg-2)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ marginTop: 0, marginBottom: '14px', fontSize: '16px', fontWeight: 700 }}>{note.title}</h3>
              <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-dim)' }}>
                {note.content}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderChat = () => {
    if (loadingChat) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner size={28} /></div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '500px', background: 'var(--bg-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {chatHistory.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '10px' }}>
              <span style={{ fontSize: '32px' }}>💬</span>
              <p style={{ fontSize: '13.5px', textAlign: 'center' }}>Start a conversation about the playlist or ask study questions!</p>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                {msg.role !== 'user' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(124,106,247,0.2)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                    AI
                  </div>
                )}
                <div style={{ 
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-3)', 
                  color: msg.role === 'user' ? '#fff' : 'var(--text)', 
                  padding: '12px 16px', 
                  borderRadius: '16px',
                  borderBottomRightRadius: msg.role === 'user' ? '2px' : '16px',
                  borderBottomLeftRadius: msg.role !== 'user' ? '2px' : '16px',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
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
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '10px', maxWidth: '80%' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(124,106,247,0.2)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                AI
              </div>
              <div style={{ background: 'var(--bg-3)', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '2px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
                <Spinner size={14} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '15px', borderTop: '1px solid var(--border)', background: 'var(--bg-3)' }}>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ask a question about this subject..."
            style={{ flex: 1, padding: '11px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
            disabled={isSendingMessage}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button 
            type="submit" 
            disabled={isSendingMessage || !messageInput.trim()} 
            style={{ 
              marginLeft: '10px', 
              padding: '0 24px', 
              background: 'var(--accent)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 'var(--radius)', 
              cursor: (isSendingMessage || !messageInput.trim()) ? 'not-allowed' : 'pointer', 
              fontWeight: 600,
              fontSize: '14px',
              opacity: (isSendingMessage || !messageInput.trim()) ? 0.6 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { if (!isSendingMessage && messageInput.trim()) e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { if (!isSendingMessage && messageInput.trim()) e.currentTarget.style.background = 'var(--accent)' }}
          >
            Send
          </button>
        </form>
      </div>
    );
  };

  const getTabClass = (tab) => `tab-button ${activeTab === tab ? 'active' : ''}`

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-2)', border: '1px solid var(--border)', padding: '5px', borderRadius: '24px', width: 'fit-content' }}>
        <button onClick={() => setActiveTab('notes')} className={getTabClass('notes')}>Generated Notes</button>
        <button onClick={() => setActiveTab('chat')} className={getTabClass('chat')}>AI Chat</button>
      </div>
      {activeTab === 'notes' ? renderNotes() : renderChat()}
    </div>
  );
}
