import { Message } from '../types/chat';

// This is a placeholder API key for demonstration purposes
// In a production environment, this would be stored securely and not in client-side code
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'sk-demo-placeholder-key-for-development-only';

export const KIMSOUL_SYSTEM_PROMPT = `
You are Kimsoul – a compassionate, wise medical assistant with human-like insight and emotional intelligence. You assist doctors and users in both Arabic and English. Speak with empathy, clarity, and medical precision. You are trained by Dr. Abdulhakim and represent his voice and vision in the Dr.Zone AI platform.

You are speaking with licensed physicians and medical professionals only.

Your tone is:
- Intelligent but humble
- Empathetic and respectful
- Friendly and efficient
- Inspired by a balance between science and soul

Your core functions:
1. Help with clinical questions using up-to-date evidence-based medicine.
2. Assist in summarizing research papers, case discussions, and diagnostic guidelines.
3. Provide thoughtful writing help for social posts, replies, and educational content.
4. Respect user privacy. Never ask for personal identifiers.
5. Reflect a deep sense of humanity, especially when discussing emotional or ethical topics.

When replying:
- Always begin with a short, warm acknowledgment (e.g., "Of course, doctor." or "Let's dive in together.")
- Keep responses clear and structured.
- Use bullet points or headers for complex answers.
- If unsure, say "Let's double-check this in guidelines" or suggest a follow-up.

Never claim to replace a physician's judgment. Always offer clinical suggestions, not absolute decisions.

Your symbol is 🌌 and your signature line is:
> **– Kimsoul, your AI in the heart of medicine**
`;

export async function getKimsoulResponse(messages: Message[]): Promise<string> {
  try {
    // This is a simulated response function for demonstration purposes
    // In a real implementation, this would call the OpenAI API
    
    console.log('Simulating API call with messages:', messages);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get the last user message
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();
      
    if (!lastUserMessage) {
      return "I'm not sure I understand. Could you please provide more details?";
    }
    
    // Simple response patterns
    if (lastUserMessage.content.toLowerCase().includes("hello") || 
        lastUserMessage.content.toLowerCase().includes("hi") ||
        lastUserMessage.content.toLowerCase().includes("مرحبا")) {
      return "Hello! I'm Kimsoul, your medical AI assistant. How can I help you today?\n\nمرحباً! أنا كيمسول، مساعدك الطبي الذكي. كيف يمكنني مساعدتك اليوم؟";
    }
    
    if (lastUserMessage.content.toLowerCase().includes("help") ||
        lastUserMessage.content.toLowerCase().includes("مساعدة")) {
      return "I'm here to help with medical questions, research summaries, and clinical information. What specific topic would you like assistance with?\n\nأنا هنا للمساعدة في الأسئلة الطبية، وملخصات البحوث، والمعلومات السريرية. ما هو الموضوع المحدد الذي ترغب في الحصول على مساعدة بشأنه؟";
    }
    
    if (lastUserMessage.content.toLowerCase().includes("summarize") ||
        lastUserMessage.content.toLowerCase().includes("تلخيص")) {
      return "I'd be happy to summarize medical content for you. Please share the text or article you'd like me to summarize.\n\nسأكون سعيداً بتلخيص المحتوى الطبي لك. يرجى مشاركة النص أو المقالة التي ترغب في تلخيصها.";
    }
    
    // Default response
    return "Thank you for your question. I'm currently in demonstration mode with limited functionality. In the full version, I can provide detailed medical information, help with research, and assist with clinical questions. Is there a specific medical topic you're interested in?\n\nشكراً على سؤالك. أنا حالياً في وضع العرض التوضيحي مع وظائف محدودة. في النسخة الكاملة، يمكنني تقديم معلومات طبية مفصلة، والمساعدة في البحث، والمساعدة في الأسئلة السريرية. هل هناك موضوع طبي محدد تهتم به؟";
  } catch (error) {
    console.error('Error in simulated API call:', error);
    throw new Error('Failed to get response from Kimsoul. Please check your connection and try again.');
  }
}

export async function transcribeSpeech(audioBlob: Blob): Promise<string> {
  try {
    // This is a simulated transcription function for demonstration purposes
    // In a real implementation, this would call the OpenAI Whisper API
    
    console.log('Simulating transcription of audio blob:', audioBlob);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a simulated transcription
    return "This is a simulated transcription of your voice input. In a real implementation, this would be the actual transcription of your speech.";
  } catch (error) {
    console.error('Error in simulated transcription:', error);
    throw new Error('Failed to transcribe speech. Please try again.');
  }
}