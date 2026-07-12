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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Action triggers */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { type: 'full', label: 'Full Notes 📝' },
            { type: 'short', label: 'Summary 📋' },
            { type: 'qna', label: 'Q&A Prep ❓' }
          ].map(btn => (
            <button 
              key={btn.type}
              onClick={() => handleGenerateNote(btn.type)} 
              disabled={isGeneratingNote} 
              className="sketch-btn sketch-btn-accent"
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              {isGeneratingNote ? 'Generating...' : `Generate ${btn.label}`}
            </button>
          ))}
        </div>

        {/* Pinned Note Documents */}
        {notes.length === 0 ? (
          <p 
            style={{ 
              color: 'var(--text-muted)', 
              fontFamily: 'var(--hand)',
              fontWeight: 'bold',
              fontSize: '16px', 
              textAlign: 'center', 
              padding: '40px 0',
              border: '2px dashed var(--border)',
              borderRadius: '8px'
            }}
          >
            No notes compiled yet. Click one of the buttons above to let Doodly scan your lectures! 💡
          </p>
        ) : (
          notes.map(note => (
            <div 
              key={note.id} 
              className="sketch-border taped taped-yellow"
              style={{ 
                background: '#fffdf0', /* Soft paper note card */
                padding: '24px', 
                boxShadow: '4px 4px 0px var(--border)',
                transform: 'rotate(-0.5deg)',
                backgroundImage: 'linear-gradient(rgba(44, 42, 41, 0.04) 1px, transparent 1px)',
                backgroundSize: '100% 26px',
                lineHeight: '26px'
              }}
            >
              <h3 
                style={{ 
                  marginTop: 0, 
                  marginBottom: '16px', 
                  fontSize: '18px', 
                  fontWeight: 800,
                  fontFamily: 'var(--sans)',
                  borderBottom: '2.5px solid var(--border)',
                  paddingBottom: '8px',
                  lineHeight: 1
                }}
              >
                📝 {note.title}
              </h3>
              
              <div 
                style={{ 
                  fontSize: '16px', 
                  fontFamily: 'var(--hand)',
                  fontWeight: 'bold',
                  whiteSpace: 'pre-wrap', 
                  color: 'var(--text)' 
                }}
              >
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
      <div 
        className="sketch-border-sm"
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '520px', 
          background: '#faf8f4', /* Lighter notebook section background */
          backgroundImage: 'radial-gradient(rgba(44, 42, 41, 0.03) 1px, transparent 1px)',
          backgroundSize: '15px 15px',
          overflow: 'hidden', 
          boxShadow: '3px 3px 0px var(--border)' 
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {chatHistory.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '12px' }}>
              <span style={{ fontSize: '36px' }}>💬</span>
              <p style={{ fontSize: '15px', fontFamily: 'var(--hand)', fontWeight: 'bold', textAlign: 'center' }}>
                Ask Doodly anything about the playlist, clear concepts, or generate study cards!
              </p>
            </div>
          ) : (
            chatHistory.map((msg, idx) => {
              const isUser = msg.role === 'user'
              return (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    alignSelf: isUser ? 'flex-end' : 'flex-start', 
                    maxWidth: '85%' 
                  }}
                >
                  {!isUser && (
                    <div 
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        background: 'var(--hl-purple)', 
                        border: '2px solid var(--border)', 
                        color: 'var(--text)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        flexShrink: 0,
                        boxShadow: '1px 1px 0px var(--border)'
                      }}
                    >
                      🤖
                    </div>
                  )}
                  
                  <div 
                    className="sketch-border-sm"
                    style={{ 
                      background: isUser ? 'var(--hl-blue)' : '#ffffff', 
                      color: 'var(--text)', 
                      padding: '10px 14px', 
                      boxShadow: '1.5px 1.5px 0px var(--border)',
                      whiteSpace: 'pre-wrap',
                      fontSize: '15px',
                      fontFamily: 'var(--hand)',
                      fontWeight: 'bold',
                      lineHeight: '1.4',
                      transform: isUser ? 'rotate(-0.5deg)' : 'rotate(0.5deg)'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })
          )}
          
          {isSendingMessage && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '10px', maxWidth: '85%' }}>
              <div 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: 'var(--hl-purple)', 
                  border: '2px solid var(--border)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0 
                }}
              >
                🤖
              </div>
              <div 
                className="sketch-border-sm"
                style={{ 
                  background: '#ffffff', 
                  padding: '10px 14px', 
                  display: 'flex', 
                  alignItems: 'center',
                  boxShadow: '1px 1px 0 var(--border)' 
                }}
              >
                <Spinner size={14} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        {/* Send message form */}
        <form 
          onSubmit={handleSendMessage} 
          style={{ 
            display: 'flex', 
            padding: '14px', 
            borderTop: '2px solid var(--border)', 
            background: 'var(--bg-card)',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            className="sketch-input"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Ask Doodly a study question..."
            disabled={isSendingMessage}
            style={{ flex: 1, padding: '6px 4px', lineHeight: 1 }}
          />
          <button 
            type="submit" 
            disabled={isSendingMessage || !messageInput.trim()} 
            className="sketch-btn sketch-btn-accent"
            style={{ marginLeft: '12px', padding: '6px 16px', height: '36px' }}
          >
            Send ➔
          </button>
        </form>
      </div>
    );
  };

  return (
    <div>
      {/* Mini folder sub-tabs */}
      <div 
        style={{ 
          display: 'flex', 
          gap: '2px', 
          marginBottom: '20px', 
          background: 'transparent', 
          borderBottom: '2.5px solid var(--border)', 
          paddingBottom: '2px' 
        }}
      >
        <button 
          onClick={() => setActiveTab('notes')} 
          className="tab-button"
          style={{
            border: '2px solid transparent',
            borderRadius: '6px 6px 0 0',
            ...(activeTab === 'notes' ? {
              borderColor: 'var(--border) var(--border) transparent var(--border)',
              background: '#ffffff',
              bottom: '-4px'
            } : {})
          }}
        >
          📝 Study Notes
        </button>
        <button 
          onClick={() => setActiveTab('chat')} 
          className="tab-button"
          style={{
            border: '2px solid transparent',
            borderRadius: '6px 6px 0 0',
            ...(activeTab === 'chat' ? {
              borderColor: 'var(--border) var(--border) transparent var(--border)',
              background: '#ffffff',
              bottom: '-4px'
            } : {})
          }}
        >
          💬 Chat with Doodly
        </button>
      </div>
      
      {activeTab === 'notes' ? renderNotes() : renderChat()}
    </div>
  );
}
