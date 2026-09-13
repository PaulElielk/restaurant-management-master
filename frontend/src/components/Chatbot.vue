<template>
    <!-- ── Floating Toggle Button ─────────────────────────────── -->
    <div>
        <button class="chatbot-toggle" @click="toggleChat" :class="{ open: isOpen }" title="Chat with our assistant">
            <i v-if="!isOpen" class="fas fa-comment-dots"></i>
            <i v-else class="fas fa-times"></i>
        </button>

        <!-- ── Chat Window ──────────────────────────────────────── -->
        <transition name="slide-up">
            <div v-if="isOpen" class="chatbot-window">

                <!-- Header -->
                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <div class="chatbot-avatar">🍽️</div>
                        <div>
                            <p class="chatbot-name">Resto Assistant</p>
                            <p class="chatbot-status">Online</p>
                        </div>
                    </div>
                    <button class="chatbot-close" @click="toggleChat">✕</button>
                </div>

                <!-- Messages Area -->
                <div class="chatbot-messages" ref="messagesContainer">
                    <div
                        v-for="(msg, i) in messages"
                        :key="i"
                        class="message-row"
                        :class="msg.sender === 'user' ? 'message-row--user' : 'message-row--bot'"
                    >
                        <!-- Bot avatar -->
                        <div v-if="msg.sender === 'bot'" class="bot-avatar">🤖</div>

                        <!-- Bubble -->
                        <div class="message-bubble" :class="msg.sender === 'user' ? 'bubble--user' : 'bubble--bot'">
                            <!-- Text reply (supports basic markdown **bold**) -->
                            <p class="bubble-text" v-html="formatText(msg.text)"></p>

                            <!-- Food cards (rendered when action === 'show_cards') -->
                            <div v-if="msg.cards && msg.cards.length" class="food-cards">
                                <div
                                    v-for="food in msg.cards"
                                    :key="food.food_id"
                                    class="food-card"
                                >
                                    <img :src="require(`../assets/images/${food.food_src}`)" :alt="food.food_name" />
                                    <div class="food-card-info">
                                        <p class="food-card-name">{{ food.food_name }}</p>
                                        <p class="food-card-price">{{ (parseFloat(food.food_price) - parseFloat(food.food_discount || 0)).toFixed(0) }} Fcfa</p>
                                        <button
                                            class="food-card-action"
                                            :disabled="isAddingToCart(food.food_id)"
                                            @click="addFoodToCart(food)"
                                        >
                                            {{ isAddingToCart(food.food_id) ? 'Adding...' : (user ? 'Add to cart' : 'Login to add') }}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="msg.actions && msg.actions.length" class="message-actions">
                                <button
                                    v-for="action in msg.actions"
                                    :key="action.label"
                                    class="message-action-btn"
                                    :class="{ 'message-action-btn--secondary': action.variant === 'secondary' }"
                                    @click="handleMessageAction(action)"
                                >
                                    {{ action.label }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Typing indicator -->
                    <div v-if="isTyping" class="message-row message-row--bot">
                        <div class="bot-avatar">🤖</div>
                        <div class="message-bubble bubble--bot typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>

                <!-- Quick-reply suggestion chips -->
                <div class="suggestion-chips">
                    <button v-for="chip in suggestions" :key="chip" class="chip" @click="sendChip(chip)">
                        {{ chip }}
                    </button>
                </div>

                <!-- Input Area -->
                <div class="chatbot-input-area">
                    <input
                        v-model="userInput"
                        type="text"
                        placeholder="Ask me anything..."
                        @keyup.enter="sendMessage"
                        :disabled="isTyping"
                    />
                    <button @click="sendMessage" :disabled="isTyping || !userInput.trim()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>

            </div>
        </transition>
    </div>
</template>

<script>
import axios from 'axios';
import { mapState } from 'vuex';

export default {
    name: 'Chatbot',

    data() {
        return {
            // Is the chat window open?
            isOpen: false,

            // What the user is typing
            userInput: '',

            // Is the bot "thinking"?
            isTyping: false,

            // Food cards currently being added to cart
            addingFoodIds: [],

            // The full conversation history
            messages: [
                {
                    sender: 'bot',
                    text: "Hi! I'm your restaurant assistant 🍽️. Try asking me:\n• **What's spicy?**\n• **Show me vegan options**\n• **What goes well with the tacos?**",
                    cards: []
                }
            ],

            // Quick-reply suggestion chips shown above the input
            suggestions: ['🌶️ Spicy dishes', '🌱 Vegan options', '🔥 Popular foods']
        };
    },

    computed: {
        ...mapState(['user'])
    },

    created() {
        this.resetChatState();
    },

    watch: {
        $route() {
            this.isOpen = false;
        },

        user(newUser, oldUser) {
            const newUserId = newUser && newUser.user_id ? parseInt(newUser.user_id, 10) : null;
            const oldUserId = oldUser && oldUser.user_id ? parseInt(oldUser.user_id, 10) : null;

            if (newUserId !== oldUserId) {
                this.resetChatState();
            }
        }
    },

    methods: {
        getDefaultSuggestions() {
            return ['Spicy dishes', 'Meat dishes', 'Vegan options', 'Best sellers', 'Desserts', 'Drinks'];
        },

        getWelcomeMessage() {
            return "Hi! I'm your restaurant assistant. Try asking me:\n- **What's spicy?**\n- **Show me meat dishes**\n- **Show me desserts**\n- **What drinks do you have?**\n- **Tell me about shrimp tacos**";
        },

        resetChatState() {
            this.isOpen = false;
            this.isTyping = false;
            this.userInput = '';
            this.addingFoodIds = [];
            this.messages = [
                {
                    sender: 'bot',
                    text: this.getWelcomeMessage(),
                    cards: [],
                    actions: []
                }
            ];
            this.suggestions = this.getDefaultSuggestions();
        },

        // Toggle the chat window open/closed
        toggleChat() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) {
                this.$nextTick(() => this.scrollToBottom());
            }
        },

        // Called when user clicks a suggestion chip
        sendChip(chip) {
            // Strip the emoji prefix so we send clean text to the NLP
            const cleanText = chip.replace(/^[^\w]+/, '').trim();
            this.userInput = cleanText;
            this.sendMessage();
        },

        pushBotMessage(text, options = {}) {
            this.messages.push({
                sender: 'bot',
                text,
                cards: options.cards || [],
                actions: options.actions || []
            });
            this.$nextTick(() => this.scrollToBottom());
        },

        isAddingToCart(foodId) {
            return this.addingFoodIds.includes(parseInt(foodId, 10));
        },

        async addFoodToCart(food) {
            const foodId = parseInt(food.food_id, 10);

            if (!this.user || !this.user.user_id) {
                this.pushBotMessage(
                    'Please log in or create an account to add items to your cart.',
                    {
                        actions: [
                            { label: 'Log in', route: '/login' },
                            { label: 'Create account', route: '/register', variant: 'secondary' }
                        ]
                    }
                );
                return;
            }

            if (this.isAddingToCart(foodId)) {
                return;
            }

            this.addingFoodIds.push(foodId);

            try {
                const userId = parseInt(this.user.user_id, 10);
                const existItem = await axios.get(`/cartItem/${userId}/${foodId}`);

                if (existItem.data.length === 1) {
                    await axios.put('/cartItem/', {
                        user_id: userId,
                        food_id: foodId,
                        item_qty: 1 + parseInt(existItem.data[0].item_qty, 10)
                    });
                } else {
                    await axios.post('/cartItem/', {
                        user_id: userId,
                        food_id: foodId,
                        item_qty: 1
                    });
                }

                this.pushBotMessage(`**${food.food_name}** has been added to your cart.`);
            } catch (err) {
                this.pushBotMessage(`I couldn't add **${food.food_name}** to your cart right now. Please try again.`);
            } finally {
                this.addingFoodIds = this.addingFoodIds.filter((id) => id !== foodId);
            }
        },

        handleMessageAction(action) {
            if (action && action.route) {
                this.$router.push(action.route);
            }
        },

        // Core: send user message to the backend NLP API
        async sendMessage() {
            const text = this.userInput.trim();
            if (!text) return;

            // 1. Push the user's message into the conversation
            this.messages.push({ sender: 'user', text, cards: [] });
            this.userInput = '';
            this.isTyping = true;
            this.$nextTick(() => this.scrollToBottom());

            try {
                // 2. POST to our NLP endpoint
                const res = await axios.post('/chatbot/message', {
                    message: text,
                    userId: this.user ? this.user.user_id : null
                });

                const { reply, action, data } = res.data;

                // 3. Short delay so the typing indicator feels natural
                await new Promise(r => setTimeout(r, 600));

                // 4. Push the bot's reply into the conversation
                this.messages.push({
                    sender: 'bot',
                    text: reply,
                    cards: action === 'show_cards' ? data : []
                });
            } catch (err) {
                this.messages.push({
                    sender: 'bot',
                    text: "Oops! I'm having trouble connecting. Please try again.",
                    cards: []
                });
            } finally {
                this.isTyping = false;
                this.$nextTick(() => this.scrollToBottom());
            }
        },

        // Auto-scroll the message window to the latest message
        scrollToBottom() {
            const container = this.$refs.messagesContainer;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },

        // Convert **bold** markdown to <strong> HTML tags safely
        formatText(text) {
            if (!text) return '';
            return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');
        }
    }
};
</script>

<style scoped>
/* ── Toggle Button ─────────────────────────────────────────── */
.chatbot-toggle {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 1000;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    color: #fff;
    font-size: 1.5rem;
    border: none;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(39, 174, 96, 0.45);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chatbot-toggle:hover {
    transform: scale(1.12);
    box-shadow: 0 8px 28px rgba(39, 174, 96, 0.6);
}

.chatbot-toggle.open {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    box-shadow: 0 6px 20px rgba(231, 76, 60, 0.45);
}

/* ── Slide-up transition ───────────────────────────────────── */
.slide-up-enter-active, .slide-up-leave-active {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.slide-up-enter-from, .slide-up-leave-to {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
}

/* ── Chat Window ───────────────────────────────────────────── */
.chatbot-window {
    position: fixed;
    bottom: 100px;
    right: 28px;
    z-index: 999;
    width: min(460px, calc(100vw - 32px));
    height: min(680px, calc(100vh - 140px));
    font-size: 16px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* ── Header ────────────────────────────────────────────────── */
.chatbot-header {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    padding: 16px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
}
.chatbot-header-info {
    display: flex;
    align-items: center;
    gap: 12px;
}
.chatbot-avatar {
    font-size: 32px;
}
.chatbot-name {
    font-weight: 700;
    font-size: 18px;
    margin: 0;
}
.chatbot-status {
    font-size: 14px;
    margin: 0;
    opacity: 0.85;
}
.chatbot-close {
    background: rgba(255,255,255,0.2);
    border: none;
    color: #fff;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}
.chatbot-close:hover {
    background: rgba(255,255,255,0.35);
}

/* ── Messages ──────────────────────────────────────────────── */
.chatbot-messages {
    flex: 1;
    overflow-y: auto;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #f7f9fc;
    scrollbar-width: thin;
    scrollbar-color: #c5c5c5 transparent;
}

.message-row {
    display: flex;
    align-items: flex-end;
    gap: 8px;
}
.message-row--user {
    flex-direction: row-reverse;
}

.bot-avatar {
    font-size: 24px;
    flex-shrink: 0;
}

.message-bubble {
    max-width: 78%;
    padding: 13px 16px;
    border-radius: 20px;
    line-height: 1.65;
    word-break: break-word;
}
.bubble--bot {
    background: #fff;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.bubble--user {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    color: #fff;
    border-bottom-right-radius: 4px;
}

.bubble-text {
    margin: 0;
    font-size: 17px;
}

/* ── Typing Indicator ──────────────────────────────────────── */
.typing-indicator {
    display: flex;
    gap: 5px;
    padding: 14px 18px;
    align-items: center;
}
.typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #27ae60;
    animation: bounce 1.2s infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-8px); }
}

/* ── Food Cards ────────────────────────────────────────────── */
.food-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
}
.food-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #f0faf4;
    border-radius: 10px;
    padding: 8px 12px;
    border: 1px solid #d4edda;
}
.food-card img {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
}
.food-card-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.food-card-name {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}
.food-card-price {
    font-size: 15px;
    color: #27ae60;
    font-weight: 700;
    margin: 2px 0 0;
}
.food-card-action {
    align-self: flex-start;
    margin-top: 6px;
    padding: 6px 12px;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 2px 8px rgba(39, 174, 96, 0.25);
}
.food-card-action:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(39, 174, 96, 0.32);
}
.food-card-action:disabled {
    opacity: 0.7;
    cursor: wait;
}

/* ── Suggestion Chips ──────────────────────────────────────── */
.message-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}
.message-action-btn {
    border: none;
    border-radius: 999px;
    padding: 8px 14px;
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 10px rgba(39, 174, 96, 0.25);
}
.message-action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}
.message-action-btn--secondary {
    background: #eef2f7;
    color: #1f2d3d;
    box-shadow: none;
}

.suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 14px 6px;
    background: #f7f9fc;
    border-top: 1px solid #eee;
}
.chip {
    background: #e8f5e9;
    color: #27ae60;
    border: 1px solid #c8e6c9;
    border-radius: 20px;
    padding: 7px 14px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
    white-space: nowrap;
}
.chip:hover {
    background: #27ae60;
    color: #fff;
}

/* ── Input Area ────────────────────────────────────────────── */
.chatbot-input-area {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-top: 1px solid #eee;
    background: #fff;
}
.chatbot-input-area input {
    flex: 1;
    border: 1.5px solid #e0e0e0;
    border-radius: 24px;
    padding: 12px 18px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s;
    background: #f7f9fc;
}
.chatbot-input-area input:focus {
    border-color: #27ae60;
    background: #fff;
}
.chatbot-input-area button {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(39,174,96,0.3);
    flex-shrink: 0;
}
.chatbot-input-area button:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(39,174,96,0.5);
}
.chatbot-input-area button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 480px) {
    .chatbot-window {
        width: calc(100vw - 20px);
        height: min(75vh, calc(100vh - 110px));
        right: 10px;
        bottom: 90px;
    }
}
</style>
