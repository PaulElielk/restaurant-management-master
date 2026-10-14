// Controller for receiving chatbot messages and delegating to ChatbotService.
import { processChatMessage } from "../models/ChatbotService.js";

export const handleChatbotMessage = async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({ reply: "Please send a message." });
        }

        // Pass the message and the optional userId to our NLP service
        const botResponse = await processChatMessage(message, userId);

        res.json(botResponse);
    } catch (err) {
        console.error("Chatbot Error:", err);
        res.status(500).json({ reply: "Oops, something went wrong with the chatbot!" });
    }
};
