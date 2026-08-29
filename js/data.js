// Данные о пиццах и ингредиентах

const PIZZAS = [
  {
    id: 1,
    name: 'Сырный цыпленок',
    description: 'Цыпленок, моцарелла, сыры чеддер и пармезан, сырный соус, томаты, соус альфредо, чеснок',
    image: 'images/pizza_syrny_ciplyonok.webp',
    price: 395,
    category: 'С курицей',
    ingredients: ['Цыпленок', 'Моцарелла', 'Чеддер', 'Пармезан'],
    rating: 4.8,
    custom: true,
    isNew: false,
  },
  {
    id: 2,
    name: 'Диабло',
    description: 'Острая чоризо, острый перец халапеньо, соус барбекю, митболы, томаты, сладкий перец, красный лук, моцарелла',
    image: 'images/pizza_diablo.webp',
    price: 449,
    category: 'Острые',
    ingredients: ['Чоризо', 'Халапеньо', 'Митболы', 'Моцарелла'],
    rating: 4.6,
    custom: true,
    isNew: false,
  },
  {
    id: 3,
    name: 'Чизбургер-пицца',
    description: 'Мясной соус болоньезе, соус бургер, соленые огурчики, томаты, красный лук, моцарелла',
    image: 'images/pizza_chizburger.webp',
    price: 399,
    category: 'Мясные',
    ingredients: ['Мясной соус', 'Соленые огурчики', 'Томаты', 'Моцарелла'],
    rating: 4.7,
    custom: true,
    isNew: false,
  },
  {
    id: 4,
    name: 'Четыре сыра 🌱',
    description: 'Сыр блю чиз, сыры чеддер и пармезан, моцарелла, соус альфредо',
    image: 'images/pizza_syrny_ciplyonok.webp',
    price: 439,
    category: 'Вегетарианские',
    ingredients: ['Блю чиз', 'Чеддер', 'Пармезан', 'Моцарелла'],
    rating: 4.9,
    custom: true,
    isNew: true,
  },
  {
    id: 5,
    name: 'Пепперони фреш',
    description: 'Пикантная пепперони, увеличенная порция моцареллы, томаты, фирменный томатный соус',
    image: 'images/pizza_pepperoni_fresh.webp',
    price: 799,
    category: 'Мясные',
    ingredients: ['Пепперони', 'Моцарелла', 'Томаты'],
    rating: 4.9,
    custom: true,
    isNew: true,
  },
  {
    id: 6,
    name: 'Маргарита 🌱',
    description: 'Увеличенная порция моцареллы, томаты, итальянские травы, фирменный томатный соус',
    image: 'images/pizza_pepperoni_fresh.webp',
    price: 349,
    category: 'Вегетарианские',
    ingredients: ['Моцарелла', 'Томаты', 'Итальянские травы'],
    rating: 4.5,
    custom: true,
    isNew: false,
  },
  {
    id: 7,
    name: 'Пицца с ветчиной',
    description: 'Ветчина, шампиньоны, увеличенная порция моцареллы, фирменный томатный соус',
    image: 'images/pizza_chizburger.webp',
    price: 499,
    category: 'Мясные',
    ingredients: ['Ветчина', 'Шампиньоны', 'Моцарелла'],
    rating: 4.4,
    custom: false,
    isNew: false,
  },
  {
    id: 8,
    name: 'Сладкая пицца 🌱',
    description: 'Ананасы, бананы, яблоки, посыпка из белого шоколада, карамельный соус',
    image: 'images/pizza_syrny_ciplyonok.webp',
    price: 459,
    category: 'Сладкие',
    ingredients: ['Ананасы', 'Бананы', 'Яблоки', 'Шоколад'],
    rating: 4.3,
    custom: false,
    isNew: false,
  },
];

// Доступные дополнительные ингредиенты
const ADDITIONAL_INGREDIENTS = [
  { name: 'Сырный бортик', price: 179, image: 'images/pizza_syrny_ciplyonok.webp' },
  { name: 'Сливочная моцарелла', price: 79, image: 'images/pizza_syrny_ciplyonok.webp' },
  { name: 'Сыры чеддер и пармезан', price: 79, image: 'images/pizza_diablo.webp' },
  { name: 'Нежный цыпленок', price: 79, image: 'images/pizza_syrny_ciplyonok.webp' },
  { name: 'Томаты', price: 39, image: 'images/pizza_chizburger.webp' },
  { name: 'Бекон', price: 99, image: 'images/pizza_chizburger.webp' },
];

// Ингредиенты для фильтрации
const FILTER_INGREDIENTS = [
  'Сырный соус',
  'Моцарелла',
  'Чеснок',
  'Соленные огурчики',
  'Красный лук',
  'Томаты',
  'Пепперони',
  'Ветчина',
  'Шампиньоны',
  'Бекон',
  'Ананасы',
  'Острый перец',
];

const CATEGORIES = ['Все', 'Мясные', 'Острые', 'Сладкие', 'Вегетарианские', 'С курицей'];

const SIZES = [
  { label: 'Маленькая', mult: 0.8, size: '25 см' },
  { label: 'Средняя', mult: 1.0, size: '30 см' },
  { label: 'Большая', mult: 1.3, size: '35 см' },
];

const DOUGH = ['Традиционное', 'Тонкое'];
