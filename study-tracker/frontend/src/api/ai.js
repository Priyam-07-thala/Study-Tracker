import client from './client';

export const getNotes = async (subjectId) => {
    const response = await client.get(`/api/ai/subjects/${subjectId}/notes`);
    return response.data;
};

export const generateNote = async (subjectId, promptType) => {
    const response = await client.post(`/api/ai/subjects/${subjectId}/notes`, { prompt_type: promptType });
    return response.data;
};

export const getChatHistory = async (subjectId) => {
    const response = await client.get(`/api/ai/subjects/${subjectId}/chat`);
    return response.data;
};

export const sendChatMessage = async (subjectId, message) => {
    const response = await client.post(`/api/ai/subjects/${subjectId}/chat`, { message });
    return response.data;
};
