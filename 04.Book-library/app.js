let loadBooksButton = document.getElementById('loadBooks');
loadBooksButton.addEventListener('click', getBooks);

let booksTableBody = document.querySelector('#books-table tbody');
booksTableBody.querySelectorAll('tr').forEach(tr => tr.remove());

let bookForm = document.getElementById('book-form');
bookForm.addEventListener('submit', handleFormSubmit);

function handleEdit(e) {
    let currentBook = e.target.closest('.book');
    let currentTitle = currentBook.querySelector('.title');
    let currentAuthor = currentBook.querySelector('.author');
    console.log(currentBook);
    let formHeading = bookForm.querySelector('h3');
    formHeading.textContent = 'Edit Form';
    bookForm.dataset.entryId = currentBook.dataset.id;
    bookForm.dataset.isEdit = true;

    let titleInput = bookForm.querySelector('input[name="title"]');
    let authorInput = bookForm.querySelector('input[name="author"]');
    titleInput.value = currentTitle.textContent;
    authorInput.value = currentAuthor.textContent;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    let form = e.currentTarget;
    let formData = new FormData(form);

    console.log(form.dataset.isEdit);
    if (form.dataset.isEdit !== undefined) {
        let id = form.dataset.entryId;
        editBook(formData, id);
    } else {
        createBook(formData);
    }
}

async function deleteBook(e) {
    let bookToDelete = e.target.closest('.book');
    let id = bookToDelete.dataset.id;
    let url = `http://localhost:3030/jsonstore/collections/books/${id}`;
    let deleteResponse = await fetch(url, {
        method: 'Delete'
    });

    if (deleteResponse.status === 200) {
        bookToDelete.remove();
    }
}

async function editBook(formData, id) {
    let editBook = {
        title: formData.get('title'),
        author: formData.get('author')
    };

    let url = `http://localhost:3030/jsonstore/collections/books/${id}`;
    let editResponse = await fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'Put',
        body: JSON.stringify(editBook)
    });

    let editResult = await editResponse.json();
    let editedBook = booksTableBody.querySelector(`tr.book[data-id="${id}"]`);
    let editedHtmlBook = createHtmlBook(editResult, editResult._id);
    editedBook.replaceWith(editedHtmlBook);
    console.log(editResult);
}

async function createBook(formData) {
    let newBook = {
        title: formData.get('title'),
        author: formData.get('author')
    };

    let url = 'http://localhost:3030/jsonstore/collections/books';
    let createResponse = await fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'Post',
        body: JSON.stringify(newBook)
    });

    let createResult = await createResponse.json();
    let createdHtmlBook = createHtmlBook(createResult, createResult._id);
    booksTableBody.appendChild(createdHtmlBook);
    console.log(createResult);
}

async function getBooks() {
    let url = 'http://localhost:3030/jsonstore/collections/books';
    let getBooksResponse = await fetch(url);
    let books = await getBooksResponse.json();
    console.log(books);

    booksTableBody.querySelectorAll('tr').forEach(tr => tr.remove());

    Object.keys(books).forEach(key => {
        let htmlBook = createHtmlBook(books[key], key);
        booksTableBody.appendChild(htmlBook);
    })
}



function createHtmlBook(book, id) {
    let titleTd = ce('td', { class: 'title' }, book.title);
    let authorTd = ce('td', { class: 'author' }, book.author);
    let editBtn = ce('button', undefined, 'Edit');
    editBtn.addEventListener('click', handleEdit);
    let deleteBtn = ce('button', undefined, 'Delete');
    deleteBtn.addEventListener('click', deleteBook);
    let buttonsTd = ce('td', undefined, editBtn, deleteBtn);
    let tr = ce('tr', { class: 'book' }, titleTd, authorTd, buttonsTd);
    tr.dataset.id = id;
    return tr;
}

function ce(tag, attributes, ...params) {
    let element = document.createElement(tag);
    let firstValue = params[0];
    if (params.length === 1 && typeof(firstValue) !== 'object') {
        if (['input', 'textarea'].includes(tag)) {
            element.value = firstValue;
        } else {
            element.textContent = firstValue;
        }
    } else {
        element.append(...params);
    }

    if (attributes !== undefined) {
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        })
    }

    return element;
}