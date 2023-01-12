'use strict';
const sortingSelector = document.getElementById('sortingSelect'),
   amountInput = document.querySelector('.amountInput'),
   draggableList = document.querySelector('.draggableList');

const minInputValue = 1;
const maxInputValue = 30;
const defaultCardsAmount = 10;

let allDataCards = [];
let defaultDataCards = [];
let slicedDataCards = [];
let sortingDataCards = [];

let listItems = [];

let dragStartIndex;

const getData = async (url) => {
   const result = await fetch(url);
   if (!result.ok) {
      throw new Error(`Failed to connect to ${url}, status: ${result.status}`);
   }
   return await result.json();
};

const removeInputValidation = () => {
   document.querySelector('.labelValidation') && document.querySelector('.labelValidation').remove()
   amountInput.classList.remove('validation');
}

const addInputValidation = () => {
   amountInput.classList.add('validation');
   const labelValidation = document.createElement('span');
   labelValidation.classList.add('labelValidation');
   labelValidation.textContent = `Enter a number from ${minInputValue} to ${maxInputValue}`;
   amountInput.after(labelValidation);
}

const sorting = () => {
   sortingSelector.addEventListener('change', (event) => {
      document.querySelectorAll('.draggableList li').forEach((item) => item.remove())
      sortingDataCards = [...(slicedDataCards.length ? slicedDataCards : defaultDataCards)]

      switch (event.target.value) {
         case 'name': {
            sortingDataCards.sort((firstItem, secondItem) => {
               if (firstItem.title.toLowerCase() > secondItem.title.toLowerCase()) {
                  return 1;
               }
               if (firstItem.title.toLowerCase() < secondItem.title.toLowerCase()) {
                  return -1;
               }
               return 0;
            })
         }
            break;
         case 'price': {
            sortingDataCards.sort((firstItem, secondItem) => {
               return firstItem.price - secondItem.price
            })
         }
            break;
      }
      createItem(sortingDataCards)
   })
}

const slicing = () => {
   amountInput.addEventListener('input', (event) => {
      sortingSelector.innerHTML += ''
      document.querySelectorAll('.draggableList li').forEach((item) => item.remove())

      if (event.target.value >= minInputValue && event.target.value <= maxInputValue) {
         removeInputValidation()
         slicedDataCards = allDataCards.slice(0, +event.target.value)
         createItem(slicedDataCards)

      } if (event.target.value > maxInputValue || event.target.value < minInputValue) {
         removeInputValidation()
         addInputValidation()

      } if (event.target.value === '') {
         removeInputValidation()
         createItem(defaultDataCards)
      }
   })
}

//Создаю список отображаемых элементов
function createItem(data) {
   listItems = [];
   [...data].forEach((item, index) => {
      const listItem = document.createElement('li');
      listItem.setAttribute('data-index', index.toString());
      const draggable = document.createElement('div');
      draggable.classList.add('draggable');
      draggable.setAttribute('draggable', 'true')
      draggable.setAttribute('id', `${item.id}`)
      draggable.innerText = `${item.title}`;
      listItem.append(draggable)
      draggableList.append(listItem);
      listItems.push(listItem);
   })

   //При наведении создается окно с подробной информацией
   const draggables = document.querySelectorAll('.draggable');
   draggables.forEach((element) => {
      element.addEventListener('mouseover', (event) => {
         element.classList.add('active')
         const cardInfo = document.createElement('div');
         cardInfo.classList.add('card');

         const { title, price, images, description } = data.find(item => item.id === +event.target.id)
         cardInfo.innerHTML = `
            <h3 id="card__title">${title}</h3>
            <span id="card__price">Price: ${price}</span>
            <img id="card__img" src=${images[0] || '#'} alt=${title}>
            <p id="card__description">Description: ${description}</p>
         `
         element.append(cardInfo);
      })

      element.addEventListener('mouseleave', () => {
         element.classList.remove('active')
         document.querySelector('.card')?.remove()
      })

      element.addEventListener('mousedown', () => {
         element.classList.remove('active')
         document.querySelector('.card')?.remove()
      })
   })
   addEventListeners();
}

getData('https://dummyjson.com/products').then(data => {
   allDataCards = [...data.products];
   defaultDataCards = allDataCards.slice(0, defaultCardsAmount)

   sorting()
   slicing()
   createItem(defaultDataCards)
})

///DND

function dragStart() {
   dragStartIndex = this.closest('li').getAttribute('data-index');
}

function dragEnter() {
   this.classList.add('over');
}

function dragLeave() {
   this.classList.remove('over');
}

function dragOver(e) {
   e.preventDefault();
}

function dragDrop() {
   const dragEndIndex = this.getAttribute('data-index');
   swapItems(dragStartIndex, dragEndIndex);

   this.classList.remove('over');
}

// Меняю местами элементы списка
function swapItems(fromIndex, toIndex) {
   const itemOne = listItems[fromIndex].querySelector('.draggable');
   const itemTwo = listItems[toIndex].querySelector('.draggable');
   listItems[fromIndex].appendChild(itemTwo);
   listItems[toIndex].appendChild(itemOne);
}

function addEventListeners() {
   const draggables = document.querySelectorAll('.draggable');
   const dragListItems = document.querySelectorAll('.draggableList li');

   draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', dragStart);
   });

   dragListItems.forEach(item => {
      item.addEventListener('dragover', dragOver);
      item.addEventListener('drop', dragDrop);
      item.addEventListener('dragenter', dragEnter);
      item.addEventListener('dragleave', dragLeave);
   });
}

