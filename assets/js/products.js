/* ==========================================================================
   products.js — single source of truth for the demo catalogue.
   To use real photos later, just change `image` to a PNG/JPG path
   (e.g. "images/products/tomato.jpg"). Nothing else needs to change.
   Currency symbol is set in CURRENCY below.
   ========================================================================== */
window.FARMART = window.FARMART || {};
window.FARMART.CURRENCY = '$';
window.FARMART.products = [
  { id: 'tomatoes', name: 'Vine Tomatoes',   category: 'Farm vegetables', price: 80,  unit: '500 g',    image: 'images/products/tomato.svg',  tint: '#fde4d7', tag: 'FARM FRESH' },
  { id: 'carrots',  name: 'Sweet Carrots',   category: 'Root vegetables', price: 60,  unit: '1 kg',     image: 'images/products/carrot.svg',  tint: '#ffefd8', tag: 'JUST PICKED' },
  { id: 'spinach',  name: 'Baby Spinach',    category: 'Leafy greens',    price: 45,  unit: '1 bunch',  image: 'images/products/spinach.svg', tint: '#e6f3d9', tag: 'LOCAL GREENS' },
  { id: 'eggs',     name: 'Farm Fresh Eggs', category: 'Dairy & eggs',    price: 150, unit: '6 pieces', image: 'images/products/eggs.svg',    tint: '#f5edcf', tag: 'FARM FAVOURITE' }
];
window.FARMART.money = amount => `${window.FARMART.CURRENCY}${amount.toLocaleString('en-US')}`;
