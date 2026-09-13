import { NlpManager } from 'node-nlp';
import {
    getFoods,
    getSpicyFoods,
    getVeganFoods,
    getFoodByName,
    getPopularFoods,
    getRecommendedFoodsForUser,
    getUsersAlsoBought,
    getIngredientsByFoodId,
    getFoodsByIngredient,
} from './FoodModel.js';

const manager = new NlpManager({ languages: ['en'], forceNER: true });

const trainingDocuments = [
    ['hello', 'greetings.hello'],
    ['hi', 'greetings.hello'],
    ['hey', 'greetings.hello'],
    ['good morning', 'greetings.hello'],
    ['howdy', 'greetings.hello'],

    ['what do you recommend?', 'restaurant.recommendation'],
    ['what is good here?', 'restaurant.recommendation'],
    ['suggest something', 'restaurant.recommendation'],
    ["i don't know what to eat", 'restaurant.recommendation'],
    ['what are the popular dishes?', 'restaurant.recommendation'],
    ['best sellers', 'restaurant.recommendation'],
    ['what should i order', 'restaurant.recommendation'],
    ['customer favorites', 'restaurant.recommendation'],

    ['i want something spicy', 'restaurant.recommend_spicy'],
    ['do you have spicy food?', 'restaurant.recommend_spicy'],
    ['anything hot and spicy?', 'restaurant.recommend_spicy'],
    ['spicy dishes', 'restaurant.recommend_spicy'],
    ['i like it hot', 'restaurant.recommend_spicy'],
    ['what is spicy on the menu?', 'restaurant.recommend_spicy'],

    ['i want vegetarian food', 'restaurant.recommend_vegan'],
    ['are there any vegan options?', 'restaurant.recommend_vegan'],
    ["i don't eat meat", 'restaurant.recommend_vegan'],
    ['meatless dishes please', 'restaurant.recommend_vegan'],
    ['plant based options', 'restaurant.recommend_vegan'],
    ['vegetarian menu', 'restaurant.recommend_vegan'],
    ['show me vegan dishes', 'restaurant.recommend_vegan'],
    ['show me meat dishes', 'restaurant.recommend_meat'],
    ['non vegan options', 'restaurant.recommend_meat'],
    ['i want non vegan food', 'restaurant.recommend_meat'],
    ['show me meaty dishes', 'restaurant.recommend_meat'],

    ['what is in the burger?', 'restaurant.check_dish_ingredient'],
    ['tell me about the pizza', 'restaurant.dish_info'],
    ['describe the tacos', 'restaurant.dish_info'],
    ['what does the nachos contain?', 'restaurant.check_dish_ingredient'],
    ['what are the ingredients of the salad?', 'restaurant.check_dish_ingredient'],
    ['tell me about shrimp tacos', 'restaurant.dish_info'],
    ['what comes in the burrito', 'restaurant.check_dish_ingredient'],
    ['what dishes have plantain?', 'restaurant.query_by_ingredient'],
    ['what dishes contain shrimp?', 'restaurant.query_by_ingredient'],
    ['foods with cheese', 'restaurant.query_by_ingredient'],
    ['do you have anything with cassava?', 'restaurant.query_by_ingredient'],
    ['what do you make with chicken?', 'restaurant.query_by_ingredient'],
    ['show me dishes with plantain', 'restaurant.query_by_ingredient'],
    ['what food has tuna?', 'restaurant.query_by_ingredient'],
    ['which meals contain attieke?', 'restaurant.query_by_ingredient'],
    ['meals made with beef', 'restaurant.query_by_ingredient'],
    ['dishes containing garlic', 'restaurant.query_by_ingredient'],
    ['foods containing shrimp', 'restaurant.query_by_ingredient'],
    ['does garba have tuna in it?', 'restaurant.check_dish_ingredient'],
    ['does the burger contain onions?', 'restaurant.check_dish_ingredient'],
    ['is there cheese in the tacos?', 'restaurant.check_dish_ingredient'],
    ['what are the ingredients of kedjenou?', 'restaurant.check_dish_ingredient'],
    ['what is inside the burger?', 'restaurant.check_dish_ingredient'],
    ['what is in garba?', 'restaurant.check_dish_ingredient'],
    ['ingredients of alloco', 'restaurant.check_dish_ingredient'],
    ['what is in the chicken burger?', 'restaurant.check_dish_ingredient'],

    ['what goes well with the burger?', 'restaurant.also_bought'],
    ['what do people order with the tacos?', 'restaurant.also_bought'],
    ['i like the pizza, what else should i try?', 'restaurant.also_bought'],
    ['what is usually ordered alongside the nachos?', 'restaurant.also_bought'],
    ['suggest something to pair with my order', 'restaurant.also_bought'],
    ['what should i pair with shrimp tacos?', 'restaurant.also_bought'],

    ['show me the menu', 'restaurant.menu_overview'],
    ['what foods do you have?', 'restaurant.menu_overview'],
    ['what can i order?', 'restaurant.menu_overview'],
    ['what is on the menu?', 'restaurant.menu_overview'],
    ['show me your food options', 'restaurant.menu_overview'],
];

const additionalTrainingDocuments = [
    ['hello there', 'greetings.hello'],
    ['hi there', 'greetings.hello'],
    ['good afternoon', 'greetings.hello'],
    ['good evening', 'greetings.hello'],
    ['hey assistant', 'greetings.hello'],
    ['can you help me', 'greetings.hello'],
    ['i need help ordering', 'greetings.hello'],
    ['are you there', 'greetings.hello'],
    ['start chat', 'greetings.hello'],
    ['restaurant assistant', 'greetings.hello'],
    ['help me choose food', 'greetings.hello'],
    ['i need some help', 'greetings.hello'],
    ['please assist me', 'greetings.hello'],
    ['can you assist with ordering', 'greetings.hello'],
    ['i need assistance choosing food', 'greetings.hello'],

    ['recommend a meal for me', 'restaurant.recommendation'],
    ['give me a recommendation', 'restaurant.recommendation'],
    ['what should i try today', 'restaurant.recommendation'],
    ['pick something for me', 'restaurant.recommendation'],
    ['what are your top picks', 'restaurant.recommendation'],
    ['show customer favorites', 'restaurant.recommendation'],
    ['what is everyone ordering', 'restaurant.recommendation'],
    ['suggest a popular meal', 'restaurant.recommendation'],
    ['i want your best food', 'restaurant.recommendation'],
    ['help me decide what to eat', 'restaurant.recommendation'],
    ['recommend something tasty', 'restaurant.recommendation'],
    ['what do people like most', 'restaurant.recommendation'],
    ['give me a strong pick', 'restaurant.recommendation'],
    ['show me recommended dishes', 'restaurant.recommendation'],

    ['show hot dishes', 'restaurant.recommend_spicy'],
    ['recommend something with chili', 'restaurant.recommend_spicy'],
    ['i want a spicy meal', 'restaurant.recommend_spicy'],
    ['what has heat on the menu', 'restaurant.recommend_spicy'],
    ['give me spicy options', 'restaurant.recommend_spicy'],
    ['any jalapeno dishes', 'restaurant.recommend_spicy'],
    ['i like chili food', 'restaurant.recommend_spicy'],
    ['show food with spice', 'restaurant.recommend_spicy'],
    ['which meals are hot', 'restaurant.recommend_spicy'],
    ['bring me something spicy', 'restaurant.recommend_spicy'],
    ['spiciest menu items', 'restaurant.recommend_spicy'],
    ['hot food recommendations', 'restaurant.recommend_spicy'],
    ['recommend spicy tacos', 'restaurant.recommend_spicy'],
    ['what is the hottest dish', 'restaurant.recommend_spicy'],

    ['show vegetarian options', 'restaurant.recommend_vegan'],
    ['i need vegan food', 'restaurant.recommend_vegan'],
    ['what can i eat without meat', 'restaurant.recommend_vegan'],
    ['recommend plant based meals', 'restaurant.recommend_vegan'],
    ['give me vegetarian dishes', 'restaurant.recommend_vegan'],
    ['show no meat options', 'restaurant.recommend_vegan'],
    ['i prefer plant based food', 'restaurant.recommend_vegan'],
    ['do you serve vegan meals', 'restaurant.recommend_vegan'],
    ['meat free menu items', 'restaurant.recommend_vegan'],
    ['vegetarian choices please', 'restaurant.recommend_vegan'],
    ['what dishes are vegan friendly', 'restaurant.recommend_vegan'],
    ['show vegan tacos or sides', 'restaurant.recommend_vegan'],
    ['i want something without meat', 'restaurant.recommend_vegan'],
    ['plant based recommendations', 'restaurant.recommend_vegan'],
    ['food with no meat please', 'restaurant.recommend_vegan'],
    ['meat free choices', 'restaurant.recommend_vegan'],
    ['without animal meat please', 'restaurant.recommend_vegan'],
    ['no meat meals please', 'restaurant.recommend_vegan'],

    ['recommend meat options', 'restaurant.recommend_meat'],
    ['i want a meat meal', 'restaurant.recommend_meat'],
    ['show dishes with meat', 'restaurant.recommend_meat'],
    ['give me beef or chicken options', 'restaurant.recommend_meat'],
    ['what meat dishes do you have', 'restaurant.recommend_meat'],
    ['i am not vegetarian', 'restaurant.recommend_meat'],
    ['show non vegetarian food', 'restaurant.recommend_meat'],
    ['recommend chicken or beef', 'restaurant.recommend_meat'],
    ['what has meat in it', 'restaurant.recommend_meat'],
    ['meat based meals please', 'restaurant.recommend_meat'],
    ['show me pork or beef dishes', 'restaurant.recommend_meat'],
    ['i want something with chicken', 'restaurant.recommend_meat'],
    ['non vegan meals please', 'restaurant.recommend_meat'],
    ['best meat meals', 'restaurant.recommend_meat'],
    ['show beef dishes', 'restaurant.recommend_meat'],
    ['beef dishes please', 'restaurant.recommend_meat'],
    ['food with beef please', 'restaurant.recommend_meat'],
    ['not vegan dishes please', 'restaurant.recommend_meat'],
    ['not vegetarian dishes', 'restaurant.recommend_meat'],

    ['what is inside shrimp tacos', 'restaurant.check_dish_ingredient'],
    ['what ingredients are in burrito', 'restaurant.check_dish_ingredient'],
    ['tell me what comes with nachos', 'restaurant.dish_info'],
    ['describe carne asada tacos', 'restaurant.dish_info'],
    ['what does the burrito include', 'restaurant.check_dish_ingredient'],
    ['give details about churros', 'restaurant.dish_info'],
    ['what is included in margarita', 'restaurant.dish_info'],
    ['tell me more about coca cola', 'restaurant.dish_info'],
    ['what is the description of pizza', 'restaurant.dish_info'],
    ['what comes with chicken nachos', 'restaurant.dish_info'],
    ['explain the vegan tacos', 'restaurant.dish_info'],
    ['what is in bean cheese burrito', 'restaurant.check_dish_ingredient'],
    ['details for shrimp nachos', 'restaurant.dish_info'],
    ['ingredients in corn salad', 'restaurant.check_dish_ingredient'],

    ['dishes with plantain', 'restaurant.query_by_ingredient'],
    ['foods with avocado', 'restaurant.query_by_ingredient'],
    ['meals with rice', 'restaurant.query_by_ingredient'],
    ['anything made with plantains', 'restaurant.query_by_ingredient'],
    ['what dishes have peanut sauce', 'restaurant.query_by_ingredient'],
    ['foods containing eggs', 'restaurant.query_by_ingredient'],
    ['what do you have with fish', 'restaurant.query_by_ingredient'],
    ['dishes with mushrooms', 'restaurant.query_by_ingredient'],
    ['meals made with chicken', 'restaurant.query_by_ingredient'],
    ['foods with bacon', 'restaurant.query_by_ingredient'],
    ['options with shrimp', 'restaurant.query_by_ingredient'],
    ['dishes with cassava', 'restaurant.query_by_ingredient'],
    ['any meals with onions', 'restaurant.query_by_ingredient'],

    ['does kedjenou have chicken', 'restaurant.check_dish_ingredient'],
    ['is there pork in the burrito', 'restaurant.check_dish_ingredient'],
    ['what ingredients are in attieke', 'restaurant.check_dish_ingredient'],
    ['what goes into garba', 'restaurant.check_dish_ingredient'],
    ['what are the ingredients of the burger', 'restaurant.check_dish_ingredient'],
    ['is there tuna in garba', 'restaurant.check_dish_ingredient'],
    ['does alloco contain plantains', 'restaurant.check_dish_ingredient'],
    ['what is inside tacos', 'restaurant.check_dish_ingredient'],
    ['ingredients of foutou', 'restaurant.check_dish_ingredient'],
    ['what comes in kedjenou', 'restaurant.check_dish_ingredient'],
    ['does the pizza have cheese', 'restaurant.check_dish_ingredient'],

    ['what pairs with burritos', 'restaurant.also_bought'],
    ['what should i order with nachos', 'restaurant.also_bought'],
    ['what drink goes with tacos', 'restaurant.also_bought'],
    ['what sides go well with burrito', 'restaurant.also_bought'],
    ['what else do people buy with pizza', 'restaurant.also_bought'],
    ['suggest a side for tacos', 'restaurant.also_bought'],
    ['what can i add to this meal', 'restaurant.also_bought'],
    ['show pairings for shrimp tacos', 'restaurant.also_bought'],
    ['what is commonly bought together', 'restaurant.also_bought'],
    ['what goes alongside burritos', 'restaurant.also_bought'],
    ['what do customers pair with nachos', 'restaurant.also_bought'],
    ['recommend something to go with my food', 'restaurant.also_bought'],
    ['what should accompany my order', 'restaurant.also_bought'],
    ['side dish pairing please', 'restaurant.also_bought'],

    ['open the menu', 'restaurant.menu_overview'],
    ['list available dishes', 'restaurant.menu_overview'],
    ['show all categories', 'restaurant.menu_overview'],
    ['what categories are available', 'restaurant.menu_overview'],
    ['browse menu items', 'restaurant.menu_overview'],
    ['show restaurant menu', 'restaurant.menu_overview'],
    ['what meals are available', 'restaurant.menu_overview'],
    ['show dishes by category', 'restaurant.menu_overview'],
    ['what food categories do you have', 'restaurant.menu_overview'],
    ['display menu options', 'restaurant.menu_overview'],
    ['let me see the menu', 'restaurant.menu_overview'],
    ['what can i buy here', 'restaurant.menu_overview'],
    ['show available food', 'restaurant.menu_overview'],
    ['menu categories please', 'restaurant.menu_overview'],
];

const allTrainingDocuments = [...trainingDocuments, ...additionalTrainingDocuments];

allTrainingDocuments.forEach(([text, intent]) => manager.addDocument('en', text, intent));

manager.addAnswer(
    'en',
    'greetings.hello',
    "Hello! I am your restaurant assistant. I can recommend dishes, show categories, and help you find specific foods."
);
manager.addAnswer(
    'en',
    'greetings.hello',
    "Hi there! Ask me about tacos, drinks, vegan dishes, best sellers, pairings, or any food on the menu."
);

console.log('[Chatbot] Training NLP model...');
manager.train().then(() => {
    manager.save();
    console.log('[Chatbot] NLP model trained and ready.');
});

const promisifyCallback = (fn, ...args) =>
    new Promise((resolve, reject) => {
        fn(...args, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });

const STOP_WORDS = new Set([
    'a', 'about', 'all', 'an', 'and', 'any', 'are', 'at', 'best', 'can', 'do', 'for',
    'from', 'get', 'give', 'good', 'have', 'i', 'in', 'is', 'it', 'like', 'me', 'menu',
    'my', 'of', 'on', 'or', 'please', 'recommend', 'show', 'something', 'suggest',
    'tell', 'the', 'to', 'want', 'what', 'which', 'with', 'would', 'you', 'your'
]);

const CATEGORY_ALIASES = {
    taco: ['taco', 'tacos'],
    burrito: ['burrito', 'burritos'],
    nachos: ['nacho', 'nachos'],
    sides: ['side', 'sides', 'side dish', 'side dishes'],
    dessert: ['dessert', 'desserts', 'sweet', 'sweets'],
    drink: ['drink', 'drinks', 'beverage', 'beverages', 'juice', 'juices', 'cocktail', 'cocktails'],
    burger: ['burger', 'burgers', 'cheeseburger', 'hamburger'],
    chicken: ['chicken'],
    sandwich: ['sandwich', 'sandwiches'],
    street_food: ['street food', 'street-food'],
    grill: ['grill', 'grilled', 'braise', 'braised'],
    stew: ['stew', 'stews', 'sauce', 'soup'],
    rice: ['rice'],
    traditional: ['traditional'],
    quick_bite: ['quick bite', 'quick bites', 'snack', 'snacks'],
};

const STATUS_ALIASES = {
    'best seller': ['best seller', 'best sellers', 'popular', 'most popular', 'customer favorite', 'customer favorites'],
    'online only': ['online only', 'delivery only', 'available online'],
    'seasonal dishes': ['seasonal', 'seasonal dishes', 'limited time'],
    'new dishes': ['new dishes', 'new items', 'latest dishes', 'just added'],
    'sale off': ['sale', 'sale off', 'discount', 'discounted', 'promo', 'promotion', 'special offer'],
};

const CUISINE_ALIASES = {
    african: ['african'],
    mexican: ['mexican'],
    american: ['american'],
    italian: ['italian'],
    middle_eastern: ['middle eastern', 'middle-eastern'],
    international: ['international'],
};

const MEAT_ALIASES = {
    beef: ['beef', 'carne', 'barbacoa'],
    chicken: ['chicken'],
    pork: ['pork', 'carnitas', 'pastor'],
    seafood: ['seafood', 'shrimp', 'fish'],
    fish: ['fish'],
    shrimp: ['shrimp'],
    vegan: ['vegan', 'vegetarian', 'plant based', 'plant-based', 'meatless'],
};

const PAIRING_PATTERNS = [
    'goes well with', 'pair with', 'pairings for', 'ordered with', 'alongside',
    'with my order', 'with the', 'what else should i try'
];

const INFO_PATTERNS = [
    'tell me about', 'describe', 'details for', 'give details', 'tell me more about',
    'explain the', 'description of'
];

const QUERY_INGREDIENT_PATTERNS = [
    /(?:what|which)\s+(?:dishes|foods?|meals?|options?)\s+(?:have|contain|feature)\s+([a-z\s]+?)(?:\?|$|\.|\b(?:on the menu|in it|inside|please|available)\b)/i,
    /(?:what|which)\s+do\s+you\s+(?:have|make)\s+with\s+([a-z\s]+?)(?:\?|$|\.|\b(?:on the menu|in it|inside|please|available)\b)/i,
    /(?:do\s+you\s+have\s+)?anything\s+(?:with|containing|made\s+with)\s+([a-z\s]+?)(?:\?|$|\.|\b(?:on the menu|in it|inside|please|available)\b)/i,
    /(?:show\s+me\s+)?(?:dishes|foods?|meals?|options?)\s+(?:with|containing|made\s+with)\s+([a-z\s]+?)(?:\?|$|\.|\b(?:on the menu|in it|inside|please|available)\b)/i,
    /(?:any\s+)?(?:dishes|foods?|meals?|options?)\s+(?:with|containing)\s+([a-z\s]+?)(?:\?|$|\.|\b(?:on the menu|in it|inside|please|available)\b)/i,
    /(?:what\s+food\s+has|what\s+foods\s+have)\s+([a-z\s]+?)(?:\?|$|\.|\b(?:on the menu|in it|inside|please|available)\b)/i,
    /(?:meals|dishes|foods?)\s+made\s+with\s+([a-z\s]+?)(?:\?|$|\.|\b(?:on the menu|in it|inside|please|available)\b)/i,
    /(?:dishes|foods?|meals?)\s+containing\s+([a-z\s]+?)(?:\?|$|\.|\b(?:on the menu|in it|inside|please|available)\b)/i,
    /(?:foods?|dishes|meals?)\s+with\s+([a-z\s]+?)(?:\?|$|\.|\b(?:on the menu|in it|inside|please|available)\b)/i,
];

const DISH_INGREDIENT_SPECIFIC_PATTERNS = [
    /(?:does|do)\s+(.+?)\s+(?:have|contain|include)\s+([a-z\s]+?)(?:\s+in\s+it)?(?:\?|$|\.)/i,
    /is\s+there\s+([a-z\s]+?)\s+in\s+(?:the\s+)?(.+?)(?:\?|$|\.)/i,
    /has\s+(.+?)\s+got\s+([a-z\s]+?)(?:\?|$|\.)/i,
];

const DISH_INGREDIENT_GENERAL_PATTERNS = [
    /(?:what\s+are\s+the\s+ingredients\s+(?:of|for|in)|ingredients\s+(?:of|for|in))\s+(?:the\s+)?(.+?)(?:\?|$|\.)/i,
    /(?:what\s+is\s+inside|what(?:\s*s|\s+is)\s+in)\s+(?:the\s+)?(.+?)(?:\?|$|\.)/i,
    /what\s+ingredients\s+(?:are\s+in|go\s+into)\s+(?:the\s+)?(.+?)(?:\?|$|\.)/i,
    /what\s+(?:does|do)\s+(?:the\s+)?(.+?)\s+contain(?:\?|$|\.)/i,
    /what\s+comes\s+(?:in|with)\s+(?:the\s+)?(.+?)(?:\?|$|\.)/i,
];

const MENU_OVERVIEW_PATTERNS = [
    'show me the menu', 'show menu', 'what foods do you have', 'what can i order',
    'what is on the menu', 'food options', 'menu options', 'available dishes'
];

const CHEAP_PATTERNS = ['cheap', 'affordable', 'budget', 'low price', 'low priced'];
const PREMIUM_PATTERNS = ['premium', 'expensive', 'high end', 'higher price'];
const SPICY_PATTERNS = ['spicy', 'hot', 'chili', 'jalapeno'];
const MILD_PATTERNS = ['mild', 'not spicy', 'no spice'];
const VEGAN_PATTERNS = ['vegan', 'vegetarian', 'plant based', 'plant-based', 'meatless', "don't eat meat", 'do not eat meat', "can't eat meat", 'cannot eat meat', 'no meat', 'meat free'];
const NON_VEGAN_PATTERNS = ['non vegan', 'non-vegan', 'not vegan', 'not vegetarian', 'meat dishes', 'meat options', 'meaty dishes', 'beef dishes', 'chicken dishes', 'pork dishes'];

const normalizeText = (value = '') =>
    value
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const containsPhrase = (haystack, needle) => {
    const normalizedNeedle = normalizeText(needle);
    if (!haystack || !normalizedNeedle) {
        return false;
    }
    return ` ${haystack} `.includes(` ${normalizedNeedle} `);
};

const tokenize = (value = '') =>
    normalizeText(value)
        .split(' ')
        .filter((token) => token && !STOP_WORDS.has(token));

const toNumber = (value) => Number.parseFloat(value) || 0;
const discountedPrice = (food) => Math.max(0, toNumber(food.food_price) - toNumber(food.food_discount));
const popularityScore = (food) => (Number.parseInt(food.order_count, 10) || 0) * 1000 + (Number.parseInt(food.food_vote, 10) || 0);
const titleCase = (value = '') => value.split(' ').filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(' ');

const getCategory = (food) => normalizeText(food.category || food.food_category);
const getCuisine = (food) => normalizeText(food.cuisine_type);
const getFoodType = (food) => normalizeText(food.food_type);
const getMeatType = (food) => normalizeText(food.meat_type);
const getStatus = (food) => normalizeText(food.food_status);
const isVeganFood = (food) => Number.parseInt(food.is_vegan, 10) === 1 || getFoodType(food) === 'vegan';
const isNonVeganFood = (food) => !isVeganFood(food);

const isSpicyFood = (food) => {
    const spiceLevel = normalizeText(food.spice_level);
    const searchableText = `${normalizeText(food.food_name)} ${normalizeText(food.food_desc)} ${normalizeText(food.description)}`;
    return ['medium', 'hot', 'spicy'].includes(spiceLevel) || /(spicy|chili|jalapeno|salsa)/.test(searchableText);
};

const sortFoodsByPopularity = (foods) =>
    foods
        .slice()
        .sort((a, b) => popularityScore(b) - popularityScore(a) || discountedPrice(a) - discountedPrice(b));

const sortFoodsByPrice = (foods, direction = 'asc') =>
    foods
        .slice()
        .sort((a, b) => {
            const diff = discountedPrice(a) - discountedPrice(b);
            return direction === 'asc' ? diff : -diff;
        });

const formatFoodList = (foods) => {
    if (!foods || foods.length === 0) {
        return null;
    }

    return foods
        .map((food) => `- **${food.food_name}** - ${discountedPrice(food).toFixed(0)} Fcfa`)
        .join('\n');
};

const findAliasMatch = (normalizedMessage, aliasMap) => {
    for (const [key, aliases] of Object.entries(aliasMap)) {
        if (aliases.some((alias) => containsPhrase(normalizedMessage, alias))) {
            return key;
        }
    }
    return null;
};

const findDynamicValueMatch = (normalizedMessage, values = []) => {
    let bestMatch = null;
    for (const value of values) {
        const normalizedValue = normalizeText(value);
        if (!normalizedValue) {
            continue;
        }

        if (containsPhrase(normalizedMessage, normalizedValue)) {
            if (!bestMatch || normalizedValue.length > bestMatch.length) {
                bestMatch = normalizedValue;
            }
        }
    }

    return bestMatch;
};

const resolveFoodFromCatalog = (message, catalog = []) => {
    const normalizedMessage = normalizeText(message);
    const messageTokens = tokenize(message);
    let bestMatch = null;

    for (const food of catalog) {
        const normalizedName = normalizeText(food.food_name);
        if (!normalizedName) {
            continue;
        }

        const foodTokens = tokenize(food.food_name);
        let score = 0;

        if (containsPhrase(normalizedMessage, normalizedName)) {
            score = 1000 + normalizedName.length;
        } else if (normalizedName.includes(normalizedMessage) && normalizedMessage.length >= 4) {
            score = 700 + normalizedMessage.length;
        } else {
            const overlap = foodTokens.filter((token) => messageTokens.includes(token));
            const allTokensMatch = foodTokens.length > 0 && foodTokens.every((token) => messageTokens.includes(token));

            if (allTokensMatch) {
                score = 500 + (overlap.length * 50);
            } else if (overlap.length >= Math.min(2, foodTokens.length)) {
                score = 300 + (overlap.length * 40);
            } else if (foodTokens.length === 1 && overlap.length === 1 && overlap[0].length >= 5) {
                score = 250;
            } else if (overlap.length >= 1 && (overlap.some((t) => t === foodTokens[0]) || overlap.some((t) => t.length >= 5))) {
                score = 280 + (overlap.length * 30);
            }
        }

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { food, score };
        }
    }

    return bestMatch && bestMatch.score >= 250 ? bestMatch.food : null;
};

const looksLikePairingQuestion = (normalizedMessage) =>
    PAIRING_PATTERNS.some((pattern) => containsPhrase(normalizedMessage, pattern));

const extractQueryIngredient = (message) => {
    const clean = normalizeText(message);
    for (const pattern of QUERY_INGREDIENT_PATTERNS) {
        const match = clean.match(pattern);
        if (match && match[1]) {
            let candidate = match[1].trim();
            candidate = candidate.replace(/\b(on the menu|in it|inside|please|available|today|here)\b/gi, '').trim();
            if (candidate.length >= 2) {
                return candidate;
            }
        }
    }
    return null;
};

const extractDishIngredientInquiry = (message) => {
    const clean = normalizeText(message);

    // Sub-case A: Specific ingredient check
    for (let i = 0; i < DISH_INGREDIENT_SPECIFIC_PATTERNS.length; i++) {
        const match = clean.match(DISH_INGREDIENT_SPECIFIC_PATTERNS[i]);
        if (match) {
            const dish = (i === 1 ? match[2] : match[1]).trim();
            const ingr = (i === 1 ? match[1] : match[2]).trim();
            if (!['you', 'we', 'i', 'they', 'u'].includes(dish.toLowerCase())) {
                return {
                    dishCandidate: dish,
                    targetIngredient: ingr,
                };
            }
        }
    }

    // Sub-case B: General ingredients of dish
    for (const pattern of DISH_INGREDIENT_GENERAL_PATTERNS) {
        const match = clean.match(pattern);
        if (match && match[1]) {
            return {
                dishCandidate: match[1].trim(),
                targetIngredient: null,
            };
        }
    }

    return null;
};

const looksLikeQueryByIngredient = (normalizedMessage) =>
    extractQueryIngredient(normalizedMessage) !== null ||
    /(?:what\s+dishes\s+have|what\s+dishes\s+contain|dishes\s+with|foods\s+with|meals\s+with|dishes\s+containing|foods\s+containing|meals\s+containing|anything\s+with|what\s+food\s+has|which\s+meals\s+contain)/i.test(
        normalizedMessage
    );

const looksLikeDishIngredientCheck = (normalizedMessage) =>
    extractDishIngredientInquiry(normalizedMessage) !== null ||
    /(?:ingredients\s+(?:of|for|in)|what\s+are\s+the\s+ingredients|what\s+is\s+inside|what(?:\s*s|\s+is)\s+in|what\s+does\s+.+\s+contain|does\s+.+\s+(?:have|contain)|is\s+there\s+.+\s+in)/i.test(
        normalizedMessage
    );

const looksLikeDishInfoQuestion = (normalizedMessage) =>
    INFO_PATTERNS.some((pattern) => containsPhrase(normalizedMessage, pattern));

const looksLikeMenuOverviewRequest = (normalizedMessage) =>
    MENU_OVERVIEW_PATTERNS.some((pattern) => containsPhrase(normalizedMessage, pattern));

const extractDishNameCandidate = (message) => {
    const aboutMatch = message.match(/(?:tell\s+me\s+about|describe|about|info\s+on)\s+(?:the\s+|a\s+|an\s+)?([a-z\s]+?)(?:\?|$|,|\.)/i);
    if (aboutMatch && aboutMatch[1].trim()) {
        return aboutMatch[1].trim();
    }
    const match = message.match(/(?:the|a|an)\s+([a-z\s]+?)(?:\?|$|,|\.)/i);
    return match ? match[1].trim() : null;
};

const detectMenuFilters = (message, catalog = []) => {
    const normalizedMessage = normalizeText(message);

    const catalogCategories = Array.from(new Set(catalog.map((food) => getCategory(food)).filter(Boolean)));
    const catalogCuisines = Array.from(new Set(catalog.map((food) => getCuisine(food)).filter(Boolean)));
    const catalogMeats = Array.from(new Set(catalog.map((food) => getMeatType(food)).filter(Boolean)));

    const category = findAliasMatch(normalizedMessage, CATEGORY_ALIASES) || findDynamicValueMatch(normalizedMessage, catalogCategories);
    const status = findAliasMatch(normalizedMessage, STATUS_ALIASES);
    const cuisine = findAliasMatch(normalizedMessage, CUISINE_ALIASES) || findDynamicValueMatch(normalizedMessage, catalogCuisines);
    const explicitVegan = VEGAN_PATTERNS.some((pattern) => containsPhrase(normalizedMessage, pattern));
    const explicitNonVegan = normalizedMessage === 'meat'
        || NON_VEGAN_PATTERNS.some((pattern) => containsPhrase(normalizedMessage, pattern));
    const meatIntent = explicitNonVegan
        ? 'meat'
        : findAliasMatch(normalizedMessage, MEAT_ALIASES) || findDynamicValueMatch(normalizedMessage, catalogMeats);

    const vegan = !explicitNonVegan && (explicitVegan || meatIntent === 'vegan');
    const meatType = vegan ? null : meatIntent;
    const spicy = SPICY_PATTERNS.some((pattern) => containsPhrase(normalizedMessage, pattern))
        ? 'spicy'
        : MILD_PATTERNS.some((pattern) => containsPhrase(normalizedMessage, pattern))
            ? 'mild'
            : null;
    const pricePreference = CHEAP_PATTERNS.some((pattern) => containsPhrase(normalizedMessage, pattern))
        ? 'cheap'
        : PREMIUM_PATTERNS.some((pattern) => containsPhrase(normalizedMessage, pattern))
            ? 'premium'
            : null;

    if (!category && !status && !cuisine && !vegan && !meatType && !spicy && !pricePreference) {
        return null;
    }

    return { category, status, cuisine, vegan, meatType, spicy, pricePreference };
};

const filterCatalogFoods = (catalog = [], filters) => {
    let filtered = catalog.filter((food) => {
        if (filters.category && getCategory(food) !== normalizeText(filters.category)) {
            return false;
        }

        if (filters.status && !getStatus(food).includes(normalizeText(filters.status))) {
            return false;
        }

        if (filters.cuisine && getCuisine(food) !== normalizeText(filters.cuisine)) {
            return false;
        }

        if (filters.vegan && !isVeganFood(food)) {
            return false;
        }

        if (filters.meatType) {
            const normalizedMeat = normalizeText(filters.meatType);
            const foodMeatType = getMeatType(food);
            const foodName = normalizeText(food.food_name);

            if (normalizedMeat === 'meat') {
                if (!isNonVeganFood(food)) {
                    return false;
                }
            } else if (normalizedMeat === 'seafood') {
                if (!['seafood', 'fish', 'shrimp'].includes(foodMeatType) && !/(shrimp|fish|seafood)/.test(foodName)) {
                    return false;
                }
            } else if (foodMeatType !== normalizedMeat && !foodName.includes(normalizedMeat)) {
                return false;
            }
        }

        if (filters.spicy === 'spicy' && !isSpicyFood(food)) {
            return false;
        }

        if (filters.spicy === 'mild' && isSpicyFood(food)) {
            return false;
        }

        return true;
    });

    if (filters.pricePreference === 'cheap') {
        filtered = sortFoodsByPrice(filtered, 'asc');
    } else if (filters.pricePreference === 'premium') {
        filtered = sortFoodsByPrice(filtered, 'desc');
    } else {
        filtered = sortFoodsByPopularity(filtered);
    }

    return filtered;
};

const buildFilterDescription = (filters) => {
    const parts = [];

    if (filters.pricePreference === 'cheap') {
        parts.push('budget-friendly');
    } else if (filters.pricePreference === 'premium') {
        parts.push('premium');
    }

    if (filters.status) {
        parts.push(normalizeText(filters.status));
    }

    if (filters.vegan) {
        parts.push('vegan');
    } else if (filters.meatType) {
        parts.push(normalizeText(filters.meatType));
    }

    if (filters.spicy === 'spicy') {
        parts.push('spicy');
    } else if (filters.spicy === 'mild') {
        parts.push('mild');
    }

    if (filters.cuisine) {
        parts.push(`${normalizeText(filters.cuisine)} style`);
    }

    if (filters.category) {
        parts.push(normalizeText(filters.category));
    } else {
        parts.push('dishes');
    }

    return titleCase(parts.join(' ').replace(/\s+/g, ' ').trim());
};

const buildDishInfoReply = async (food) => {
    const details = [];
    const category = getCategory(food);
    const cuisine = getCuisine(food);
    const meatType = getMeatType(food);
    const spiceLevel = normalizeText(food.spice_level);

    if (category) {
        details.push(titleCase(category));
    }

    if (isVeganFood(food)) {
        details.push('Vegan');
    } else if (meatType) {
        details.push(titleCase(meatType));
    } else if (getFoodType(food)) {
        details.push(titleCase(getFoodType(food)));
    }

    if (spiceLevel) {
        details.push(titleCase(spiceLevel));
    }

    if (cuisine) {
        details.push(titleCase(cuisine));
    }

    let ingredientsText = '';
    try {
        const rawIngredients = await promisifyCallback(getIngredientsByFoodId, food.food_id);
        const ingredientNames = Array.isArray(rawIngredients)
            ? rawIngredients.map((r) => (r.ingredient_name || '').trim()).filter(Boolean)
            : [];
        if (ingredientNames.length > 0) {
            ingredientsText = `\n\n**Ingredients:** ${ingredientNames.join(', ')}`;
        }
    } catch {
        // Non-fatal, proceed without ingredients
    }

    return {
        reply: `**${food.food_name}** - ${discountedPrice(food).toFixed(0)} Fcfa\n${details.length ? `${details.join(' | ')}\n` : ''}${food.description || food.food_desc || 'No description available.'}${ingredientsText}`,
        action: 'show_cards',
        data: [food],
    };
};

const handleQueryByIngredient = async (ingredient) => {
    if (!ingredient || typeof ingredient !== 'string' || !ingredient.trim()) {
        return {
            reply: 'Which ingredient are you looking for? Try asking: "What dishes have plantain?" or "Foods with cheese."',
            action: 'none',
            data: [],
        };
    }

    const cleanIngredient = ingredient.trim();

    try {
        const foods = await promisifyCallback(getFoodsByIngredient, `%${cleanIngredient}%`);
        if (foods && foods.length > 0) {
            const list = formatFoodList(foods);
            return {
                reply: `Here are our dishes containing ${cleanIngredient}:\n\n${list}`,
                action: 'show_cards',
                data: foods,
            };
        }

        return {
            reply: `I couldn't find any dishes containing ${cleanIngredient} on our menu.`,
            action: 'none',
            data: [],
        };
    } catch (err) {
        console.error('[Chatbot] Error querying foods by ingredient:', err);
        return {
            reply: `Sorry, I encountered an issue checking the ingredients for "${cleanIngredient}". Please try again.`,
            action: 'none',
            data: [],
        };
    }
};

const handleDishIngredientCheck = async (dishCandidate, targetIngredient, catalog, userMessage, directFoodMatch) => {
    let food = null;

    if (dishCandidate) {
        const cleanedDish = dishCandidate.replace(/^(the|a|an)\s+/i, '').trim();
        food = resolveFoodFromCatalog(cleanedDish, catalog);
        if (!food) {
            try {
                food = await promisifyCallback(getFoodByName, cleanedDish);
            } catch {
                food = null;
            }
        }
    }

    if (!food && directFoodMatch) {
        food = directFoodMatch;
    }

    if (!food) {
        const fallbackCandidate = extractDishNameCandidate(userMessage);
        if (fallbackCandidate) {
            food = resolveFoodFromCatalog(fallbackCandidate, catalog);
            if (!food) {
                try {
                    food = await promisifyCallback(getFoodByName, fallbackCandidate);
                } catch {
                    food = null;
                }
            }
        }
    }

    if (!food) {
        return {
            reply: 'Which dish would you like to check ingredients for? Try asking: "What are the ingredients of Kedjenou?" or "Does Garba have tuna in it?"',
            action: 'none',
            data: [],
        };
    }

    try {
        const rawIngredients = await promisifyCallback(getIngredientsByFoodId, food.food_id);
        const ingredientNames = Array.isArray(rawIngredients)
            ? rawIngredients.map((row) => (row.ingredient_name || '').trim()).filter(Boolean)
            : [];

        // Sub-case A: A specific ingredient was queried
        if (targetIngredient && targetIngredient.trim()) {
            const cleanTarget = targetIngredient.trim().toLowerCase();
            const hasIngredient = ingredientNames.some((name) => {
                const lower = name.toLowerCase();
                return lower.includes(cleanTarget) || cleanTarget.includes(lower);
            });

            if (hasIngredient) {
                const list = ingredientNames.join(', ');
                return {
                    reply: list
                        ? `Yes, the **${food.food_name}** contains ${targetIngredient.trim()}. Here are its ingredients: ${list}.`
                        : `Yes, the **${food.food_name}** contains ${targetIngredient.trim()}.`,
                    action: 'show_cards',
                    data: [food],
                };
            }

            const list = ingredientNames.join(', ');
            return {
                reply: list
                    ? `No, the **${food.food_name}** does not contain ${targetIngredient.trim()}. Its ingredients are: ${list}.`
                    : `No, the **${food.food_name}** does not contain ${targetIngredient.trim()}.`,
                action: 'show_cards',
                data: [food],
            };
        }

        // Sub-case B: General ingredients inquiry
        if (ingredientNames.length > 0) {
            return {
                reply: `The **${food.food_name}** is made with: ${ingredientNames.join(', ')}.`,
                action: 'show_cards',
                data: [food],
            };
        }

        // Fallback if legacy dish has no rows in food_ingredients
        const desc = food.description || food.food_desc;
        return {
            reply: desc
                ? `We don't have a detailed ingredients breakdown for **${food.food_name}** yet, but here is what it is: ${desc}`
                : `We don't have detailed ingredient information for **${food.food_name}** yet.`,
            action: 'show_cards',
            data: [food],
        };
    } catch (err) {
        console.error('[Chatbot] Error fetching dish ingredients:', err);
        return {
            reply: `Sorry, I could not retrieve ingredient details for **${food.food_name}** right now.`,
            action: 'none',
            data: [],
        };
    }
};

const buildMenuOverviewReply = (catalog = []) => {
    const categoryCounts = Object.entries(
        catalog.reduce((acc, food) => {
            const category = getCategory(food);
            if (!category) {
                return acc;
            }
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]);

    const summary = categoryCounts
        .slice(0, 8)
        .map(([category, count]) => `- ${titleCase(category)} (${count})`)
        .join('\n');

    const featuredFoods = sortFoodsByPopularity(catalog).slice(0, 5);

    return {
        reply: `We currently have ${catalog.length} items on the menu.\n\nYou can explore categories like:\n${summary}\n\nTry asking for drinks, desserts, tacos, spicy dishes, vegan options, best sellers, or African food.`,
        action: featuredFoods.length ? 'show_cards' : 'none',
        data: featuredFoods,
    };
};

const buildNoResultsReply = (filters) => ({
    reply: `I could not find any ${buildFilterDescription(filters).toLowerCase()} right now. Try asking for a different category, status, or food type.`,
    action: 'none',
    data: [],
});

export const processChatMessage = async (userMessage, userId) => {
    const normalizedMessage = normalizeText(userMessage);
    const catalog = await promisifyCallback(getFoods);
    const directFoodMatch = resolveFoodFromCatalog(userMessage, catalog);
    const menuFilters = detectMenuFilters(userMessage, catalog);

    if (looksLikePairingQuestion(normalizedMessage)) {
        let food = directFoodMatch;

        if (!food) {
            const dishNameCandidate = extractDishNameCandidate(userMessage);
            if (dishNameCandidate) {
                food = await promisifyCallback(getFoodByName, dishNameCandidate);
            }
        }

        if (!food) {
            return {
                reply: 'Which dish would you like pairings for? Try asking: "What goes well with shrimp tacos?"',
                action: 'none',
                data: [],
            };
        }

        const pairings = await promisifyCallback(getUsersAlsoBought, food.food_id, 5);
        const list = formatFoodList(pairings);

        return {
            reply: list
                ? `Customers who order the **${food.food_name}** also like:\n\n${list}`
                : `The **${food.food_name}** does not have any strong pairing data yet.`,
            action: pairings.length ? 'show_cards' : 'none',
            data: pairings,
        };
    }

    if (looksLikeQueryByIngredient(normalizedMessage)) {
        const ingredient = extractQueryIngredient(userMessage);
        if (ingredient) {
            return await handleQueryByIngredient(ingredient);
        }
    }

    if (looksLikeDishIngredientCheck(normalizedMessage)) {
        const inquiry = extractDishIngredientInquiry(userMessage);
        if (inquiry) {
            return await handleDishIngredientCheck(
                inquiry.dishCandidate,
                inquiry.targetIngredient,
                catalog,
                userMessage,
                directFoodMatch
            );
        }
    }

    if (looksLikeDishInfoQuestion(normalizedMessage) || (directFoodMatch && tokenize(userMessage).length <= 4)) {
        if (directFoodMatch) {
            return await buildDishInfoReply(directFoodMatch);
        }

        const dishNameCandidate = extractDishNameCandidate(userMessage);
        if (dishNameCandidate) {
            const food = await promisifyCallback(getFoodByName, dishNameCandidate);
            if (food) {
                return await buildDishInfoReply(food);
            }
        }
    }

    if (looksLikeMenuOverviewRequest(normalizedMessage) && !menuFilters) {
        return buildMenuOverviewReply(catalog);
    }

    if (menuFilters) {
        const foods = filterCatalogFoods(catalog, menuFilters).slice(0, 5);

        if (!foods.length) {
            return buildNoResultsReply(menuFilters);
        }

        return {
            reply: `Here are some ${buildFilterDescription(menuFilters).toLowerCase()} from our menu:\n\n${formatFoodList(foods)}`,
            action: 'show_cards',
            data: foods,
        };
    }

    const response = await manager.process('en', userMessage);
    const intent = response.intent;

    console.log(`[Chatbot] "${userMessage}" -> Intent: ${intent} (confidence: ${response.score.toFixed(2)})`);

    if (intent === 'None' || response.score < 0.5) {
        return {
            reply: 'I am not fully sure what you mean yet. Try asking for tacos, desserts, drinks, best sellers, vegan dishes, spicy food, or details about a specific item.',
            action: 'none',
            data: [],
        };
    }

    switch (intent) {
        case 'greetings.hello':
            return { reply: response.answer, action: 'none', data: [] };

        case 'restaurant.menu_overview':
            return buildMenuOverviewReply(catalog);

        case 'restaurant.recommendation': {
            const foods = await promisifyCallback(getRecommendedFoodsForUser, userId, {
                limit: 5,
                minHistory: 3,
                excludeCart: true,
            });
            const fallbackFoods = foods && foods.length ? foods : await promisifyCallback(getPopularFoods, 5);
            const list = formatFoodList(fallbackFoods);

            return {
                reply: list
                    ? `Here are some strong picks from the menu:\n\n${list}`
                    : "Sorry, I couldn't find recommendations at the moment.",
                action: 'show_cards',
                data: fallbackFoods,
            };
        }

        case 'restaurant.recommend_spicy': {
            const foods = await promisifyCallback(getSpicyFoods, 5);
            const list = formatFoodList(foods);
            return {
                reply: list
                    ? `Here are our spiciest dishes:\n\n${list}`
                    : "We do not have any spicy dishes listed right now.",
                action: foods.length ? 'show_cards' : 'none',
                data: foods,
            };
        }

        case 'restaurant.recommend_vegan': {
            const foods = await promisifyCallback(getVeganFoods, 5);
            const list = formatFoodList(foods);
            return {
                reply: list
                    ? `Here are our vegan-friendly options:\n\n${list}`
                    : "Sorry, we do not have any vegan items listed right now.",
                action: foods.length ? 'show_cards' : 'none',
                data: foods,
            };
        }

        case 'restaurant.recommend_meat': {
            const foods = sortFoodsByPopularity(catalog.filter((food) => isNonVeganFood(food))).slice(0, 5);
            const list = formatFoodList(foods);
            return {
                reply: list
                    ? `Here are some meat dishes from our menu:\n\n${list}`
                    : 'Sorry, I could not find any meat dishes right now.',
                action: foods.length ? 'show_cards' : 'none',
                data: foods,
            };
        }

        case 'restaurant.query_by_ingredient': {
            const ingredient = extractQueryIngredient(userMessage) || tokenize(userMessage).pop();
            return await handleQueryByIngredient(ingredient);
        }

        case 'restaurant.check_dish_ingredient': {
            const inquiry = extractDishIngredientInquiry(userMessage);
            return await handleDishIngredientCheck(
                inquiry ? inquiry.dishCandidate : null,
                inquiry ? inquiry.targetIngredient : null,
                catalog,
                userMessage,
                directFoodMatch
            );
        }

        case 'restaurant.dish_info': {
            const dishNameCandidate = extractDishNameCandidate(userMessage);
            const food = directFoodMatch || (dishNameCandidate ? await promisifyCallback(getFoodByName, dishNameCandidate) : null);

            if (!food) {
                return {
                    reply: 'Which dish would you like to know about? Try asking: "Tell me about shrimp tacos."',
                    action: 'none',
                    data: [],
                };
            }

            return await buildDishInfoReply(food);
        }

        case 'restaurant.also_bought': {
            const dishNameCandidate = extractDishNameCandidate(userMessage);
            const food = directFoodMatch || (dishNameCandidate ? await promisifyCallback(getFoodByName, dishNameCandidate) : null);

            if (!food) {
                return {
                    reply: 'Which dish would you like pairings for? Try: "What goes well with the burger?"',
                    action: 'none',
                    data: [],
                };
            }

            const pairings = await promisifyCallback(getUsersAlsoBought, food.food_id, 5);
            const list = formatFoodList(pairings);

            return {
                reply: list
                    ? `Customers who order the **${food.food_name}** also like:\n\n${list}`
                    : `The **${food.food_name}** does not have any strong pairings recorded yet.`,
                action: pairings.length ? 'show_cards' : 'none',
                data: pairings,
            };
        }

        default:
            return {
                reply: 'I am still learning, but I can already help with categories, spicy dishes, vegan food, best sellers, pairings, and menu search.',
                action: 'none',
                data: [],
            };
    }
};
