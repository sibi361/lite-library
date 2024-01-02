const MAX_PAGE_COUNT = 10000;
const BOOKS_FETCH_URL = "/getBooks";
const BOOKS_VIEW_URL = "/view";
const BOOKS_CREATE_URL = "/api/create";
const BOOKS_UPDATE_URL = "/api/update";
const BOOKS_DELETE_URL = "/api/delete";
// const REPORT_URL = "/report";
const STATS_URL = "/stats";
const IMAGE_ROOT =
    "https://raw.githubusercontent.com/benoitvallon/100-best-books/master/static/";

const searchForm = document.querySelector(".form-search");
const newBookForm = document.querySelector(".form-new-book");
const formSearch = document.querySelector("#book-search");
const formTitle = document.querySelector("#book-title");
const formAuthor = document.querySelector("#book-author");
const formPages = document.querySelector("#book-pageCount");
const formUnread = document.querySelector('img[alt="unread"]');
const formRead = document.querySelector('img[alt="read"]');
const formSubmit = document.querySelector("#submit");
const templateCard = document.querySelector("#template-card");
const logoutFooter = document.querySelector("#logoutBtn");
let libraryRoot = document.querySelector(".content-inner");

function addClass(element, className) {
    element.classList.add(className);
}

function removeClass(element, className) {
    element.classList.remove(className);
}

function addRemoveClass(className, toRemove, toAdd) {
    toRemove.classList.remove(className);
    addClass(toAdd, className);
}

function hideElement(element) {
    addClass(element, "hidden");
}

function highlightError(field, focus = false) {
    addClass(field, "invalid-input");
    if (focus) field.focus();
}

function showConfirmPopup(message) {
    return confirm(message);
}

// localStorage wrappers
// we decided to go lite on the browser so we ain't using these
function readLs(key) {
    return false;
    // const localStorageTemp = localStorage.getItem(key);
    // if (localStorageTemp !== null) return localStorageTemp;
    // else return false;
}

function writeLs(key, value) {
    localStorage.setItem(key, value);
}

function clearLs() {
    localStorage.clear();
}

function saveLibraryToLs() {
    // writeLs("library", JSON.stringify(library));
}

let cardTemplate = "";
async function initFillLibrary() {
    libraryRoot.innerHTML = "";

    if (!library.length) {
        let booksFetchUrl = BOOKS_FETCH_URL;
        if (document.location.pathname.includes("liteShare"))
            booksFetchUrl = document.location.pathname.replace(
                "liteShare",
                "view"
            );
        await fetch(booksFetchUrl)
            .then((resp) => resp.json())
            .then(
                (json) =>
                    (library = json.map((book) => ({
                        ...book,
                        fav: book.fav === "1" ? true : false,
                        read: book.read === "1" ? true : false,
                    })))
            );
        saveLibraryToLs();
    }

    templateCard.removeAttribute("id");
    cardTemplate = templateCard.outerHTML;
    templateCard.remove();

    if (library.length === 0)
        if (document.location.pathname.includes("liteShare"))
            libraryRoot.textContent = "liteShare Not Found";
        else libraryRoot.textContent = "No Books Saved";
    else library.forEach((book) => addBookToDomLibrary(book));
}

function addBookToDomLibrary(book, scrollToCard = false) {
    // clear "No Books Saved" message
    if (libraryRoot.childElementCount === 0) libraryRoot.innerHTML = "";

    libraryRoot.innerHTML += cardTemplate
        .replace("Book Title", book.title)
        .replace("Book Author", book.author);

    let cards = libraryRoot.querySelectorAll(".card");
    let card = cards[cards.length - 1];

    const pages = card.querySelectorAll(".card-text")[1];
    if (book.pages !== 0 && book.pages !== "0")
        pages.textContent = `${book.pages} pages`;
    else pages.remove();

    let bookImg = card.querySelector("img");
    if (!book.imageLink) bookImg.src = "";
    else if (
        book.imageLink?.startsWith("http") ||
        book.imageLink?.startsWith("/")
    )
        bookImg.src = book.imageLink;
    else bookImg.src = `${IMAGE_ROOT}${book.imageLink}`;
    bookImg.setAttribute(
        "alt",
        `Cover photo of ${book.title} by ${book.author}`
    );

    const notFavBtn = card.querySelector(".not-fav");
    const favBtn = card.querySelector(".fav");
    if (book.fav) {
        hideElement(notFavBtn);
    } else {
        hideElement(favBtn);
    }

    const unreadBtn = card.querySelector(".unread");
    const readBtn = card.querySelector(".read");
    if (book.read) {
        hideElement(unreadBtn);
    } else {
        hideElement(readBtn);
    }

    addListeners();

    if (scrollToCard) {
        card.scrollIntoView();
        addClass(card, "new-card");
    }
}

function addListeners() {
    const libraryRoot = document.querySelector(".content-inner");
    const cards = libraryRoot.querySelectorAll(".card");

    cards.forEach((card, i) => {
        const book = library[i];

        const bookImg = card.querySelector("img");

        if (book.link !== "")
            bookImg.addEventListener("click", () => window.open(book.link));

        const notFavBtn = card.querySelector(".not-fav");
        const favBtn = card.querySelector(".fav");
        const unreadBtn = card.querySelector(".unread");
        const readBtn = card.querySelector(".read");
        const toggleBtnList = [notFavBtn, favBtn, unreadBtn, readBtn];
        const deleteBtn = card.querySelector(".delete");

        toggleBtnList.forEach((btn) =>
            btn.addEventListener("click", toggleCardButtonState)
        );
        deleteBtn.addEventListener("click", deleteBook);

        if (!document.location.pathname.includes("liteShare"))
            card.querySelector(".card-title").addEventListener("click", () =>
                window.open(
                    `liteShare/${document
                        .querySelector("#logoutBtn")
                        .textContent.trim()
                        .split(" ")[3]
                        .replace(":", "")}/${book.liteId}`
                )
            );
        else {
            if (getUsername() === document.location.pathname.split("/")[2]) {
                // hideElement(reportBtn);
            } else {
                toggleBtnList.forEach((btn) => btn.parentElement.remove());
                deleteBtn.remove();

                reportBtn.addEventListener(
                    "click",
                    () => {
                        prompt("Why are you reporting this book?");
                        alert("Thank you for reporting");
                    }
                    // fetch(REPORT_URL," {
                    //     method: "post,
                    //     headers: { "Content-Type": "application/json" },
                    //     body: JSON.stringify({
                    //         user: document.location.toString().split("/")[4],
                    //         liteId: document.location.toString().split("/")[5],
                    //         reason: prompt("Why are you reporting this book?"),
                    //     }),
                    // })
                    //     .then((r) => {
                    //         if (r.status === 429) return alert("Slow down");
                    //         if (r.redirected)
                    //             document.location = r.url ? r.url : "/login";
                    //         else return r.json();
                    //     })
                    //     .then((r) => alert(r.msg))
                );
            }
        }
    });
}

const fetchBookData = async (title, author) => {
    console.log(`Fetching book details for: ${title} by ${author}`);
    return await fetch(
        `https://openlibrary.org/search.json?title=${title}&author=${author}`
    )
        .then((r) => r.json())
        .then(async (r) => {
            let author, pages, imageLink, link;

            try {
                if (r.numFound === 0) return undefined;

                title = r.docs[0]?.title;
                link = `https://openlibrary.org${r.docs[0]?.key}`;
                author = r.docs[0]?.author_name[0];
                pages = r.docs[0]?.number_of_pages_median;
                const isbn = r.docs[0]?.isbn[0];

                imageLink = await fetch(
                    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json`
                )
                    .then((r) => r.json())
                    .then((r) =>
                        r[`ISBN:${isbn}`]?.thumbnail_url?.replace("-S", "-M")
                    );
            } catch (e) {
            } finally {
                if (!title) title = "";
                if (!author) author = "";
                if (!pages) pages = 0;
                if (!imageLink) imageLink = "";
                if (!link) link = "";
                return { title, author, pages, imageLink, link };
            }
        });
};

async function addBookFromUser() {
    let title = formTitle.value.trim();
    let author = formAuthor.value.trim();
    let pages = formPages.value.trim(),
        imageLink,
        link;

    if (title.length === 0) {
        highlightError(formTitle, true);
    } else if (author.length === 0) {
        highlightError(formAuthor, true);
    } else if (bookAlreadyExists(title)) {
        alert("Book already exists in library");
    } else if (
        Number(pages) < 0 ||
        Number(pages) > MAX_PAGE_COUNT ||
        (pages.length !== 0 && // pages field is not mandatory, only then do non-number
            isNaN(pages)) // detection https://stackoverflow.com/a/175787
    )
        highlightError(formPages, true);
    else {
        formSubmit.classList.add("btn-loading");
        formSubmit.setAttribute("disabled", "");
        formSubmit.blur();

        let bookData;
        try {
            bookData = await fetchBookData(title, author);
        } catch (e) {}

        title = !bookData || bookData.title === "" ? title : bookData.title;
        author = !bookData || bookData.author === "" ? author : bookData.author;
        pages = !bookData || bookData.pages === 0 ? pages : bookData.pages;
        imageLink =
            !bookData || bookData.imageLink === ""
                ? "/assets/icons/bookshelf.svg"
                : bookData.imageLink;
        link = !bookData ? "" : bookData.link;

        const book = new newBook(
            title,
            author,
            Number(pages),
            imageLink,
            link,
            formReadSwitch
        );

        await fetch(BOOKS_CREATE_URL, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(book),
        })
            .then((r) => {
                if (r.status === 429) return alert("Slow down");
                if (r.redirected) document.location = r.url ? r.url : "/login";
                else return r.json();
            })
            .then((r) => {
                formSubmit.classList.remove("btn-loading");
                formSubmit.removeAttribute("disabled");

                if (!r) return;
                if (r.status === "ok") {
                    library.push(r.book);
                    saveLibraryToLs();
                    addBookToDomLibrary(r.book, true);
                    setTimeout(() => {
                        formSubmit.classList.remove("btn-success");
                        formSubmit.removeAttribute("disabled");
                    }, 1000);
                    document
                        .querySelectorAll(".invalid-input")
                        .forEach((ele) =>
                            ele.classList.remove("invalid-input")
                        );

                    formTitle.value = "";
                    formAuthor.value = "";
                    formPages.value = "";
                } else setTimeout(() => alert(r.msg), 500);
            });
    }
}

class newBook {
    constructor(title, author, pages, imageLink, link, read) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.imageLink = imageLink;
        this.link = link;
        this.read = read;
        this.fav = false;
    }
}

function bookAlreadyExists(givenTitle) {
    const titleLc = givenTitle.toLocaleLowerCase();
    if (library.find((book) => book.title.toLocaleLowerCase() === titleLc)) {
        const cards = libraryRoot.querySelectorAll(".card");
        let present = false;
        cards.forEach((card) => {
            const cardBookTitle = card.querySelector(".card-title").textContent;
            if (cardBookTitle.toLocaleLowerCase() === titleLc) {
                highlightError(card, true);
                addClass(card, "new-card");
                card.scrollIntoView();
                present = true;
            }
        });
        if (present) highlightError(formTitle);
        return true;
    }
    return false;
}

// book cards stuff below
async function toggleCardButtonState() {
    const cardButtons = this.parentElement.parentElement;
    const bookIndex = getBookTitle(cardButtons, true);

    const options = this.parentElement.dataset.options
        .split("|")
        .map((op) => `.${op}`);
    const offBtn = cardButtons.querySelector(options[0]);
    const onBtn = cardButtons.querySelector(options[1]);
    const key = options[1].slice(1);

    if (offBtn.classList.contains("hidden")) library[bookIndex][key] = false;
    else library[bookIndex][key] = true;

    const data = {
        title: library[bookIndex].title,
        fav: library[bookIndex].fav,
        read: library[bookIndex].read,
    };

    try {
        await fetch(BOOKS_UPDATE_URL, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((r) => {
                if (r.status === 429) return alert("Slow down");
                if (r.redirected) document.location = r.url ? r.url : "/login";
                else return r.json();
            })
            .then((r) => {
                if (!r) return;
                if (r.status === "ok") {
                    if (offBtn.classList.contains("hidden"))
                        addRemoveClass("hidden", offBtn, onBtn);
                    else addRemoveClass("hidden", onBtn, offBtn);
                } else alert(r.msg);
            });
    } catch (e) {}

    saveLibraryToLs();
}

async function deleteBook() {
    const bookTitle =
        this.parentElement.parentElement.querySelector(
            ".card-title"
        ).textContent;

    if (!showConfirmPopup(`Delete the book [${bookTitle}]?`)) return;

    try {
        await fetch(`${BOOKS_DELETE_URL}?title=${bookTitle}`, {
            method: "post",
        })
            .then((r) => {
                if (r.status === 429) return alert("Slow down");
                if (r.redirected) document.location = r.url ? r.url : "/login";
                else return r.json();
            })
            .then((r) => {
                if (!r) return;
                if (r.status === "ok") {
                    this.parentElement.parentElement.remove();
                    if (libraryRoot.childElementCount === 0)
                        libraryRoot.textContent = "No Books Saved";
                    library = library.filter(
                        (book) => book.title !== bookTitle
                    );
                    saveLibraryToLs();

                    // go to library after deleting book on liteShare page
                    if (document.location.toString().includes("liteShare"))
                        document.location = "/";
                } else alert(r.msg);
            });
    } catch (e) {}
}

const updateStats = () =>
    fetch(STATS_URL)
        .then((r) => {
            if (r.redirected) document.location = r.url ? r.url : "/login";
            return r.json();
        })
        .then(
            (r) =>
                (document.querySelector(
                    "#stats"
                ).textContent = `Powered by Lite! Home to ${r.count}+ books`)
        );

function getUsername(t = document.cookie.replace("token=", "")) {
    return JSON.parse(window.atob(t.split(".")[1])).data;
}

let formReadSwitch = false;
document.addEventListener("DOMContentLoaded", () => {
    try {
        logoutFooter.textContent = `Logged in as ${getUsername()}: Logout`;

        // remove all error highlights on keypress and form submit
        [formTitle, formAuthor, formPages].forEach((input) =>
            input.addEventListener("keypress", (e) => {
                e.target.classList.remove("invalid-input");
                const cards = libraryRoot.querySelectorAll(".card");
                cards.forEach((card) => card.classList.remove("invalid-input"));
            })
        );

        // toggleHeaderFormReadState
        [formUnread, formRead].forEach((btn) =>
            btn.addEventListener("click", () => {
                if (!btn.classList.contains("selected")) {
                    if (formUnread.classList.contains("selected")) {
                        formReadSwitch = true;
                        addRemoveClass("selected", formUnread, formRead);
                    } else {
                        formReadSwitch = false;
                        addRemoveClass("selected", formRead, formUnread);
                    }
                }
            })
        );

        formSubmit.addEventListener("click", (e) => {
            e.stopPropagation();

            if (newBookForm.classList.contains("hidden"))
                newBookForm.classList.remove("hidden");
            else addBookFromUser();
        });
    } catch (e) {}

    document.querySelector("#logoutBtn").addEventListener("click", () => {
        try {
            document.querySelector(eraseCookie("token"));
        } catch (e) {}
        document.location.replace("/login");
    });

    if (formSearch) formSearch.addEventListener("keyup", search);

    document.body.addEventListener("click", () => {
        const newCard = document.querySelector(".new-card");
        if (newCard !== null) removeClass(newCard, "new-card");
    });

    updateStats();
    setInterval(updateStats, 15000);
});

function getBookTitle(cardButtons, getIndexInstead = false) {
    let bookTitle =
        cardButtons.parentElement.querySelector(".card-title").textContent;
    if (getIndexInstead) {
        bookTitle = bookTitle.toLocaleLowerCase();
        return library.findIndex(
            (book) => book.title.toLocaleLowerCase() === bookTitle
        );
    }
    return bookTitle;
}

function eraseCookie(name) {
    document.cookie =
        name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function search() {
    const query = formSearch.value.toLocaleLowerCase().trim();

    if (!query) return initFillLibrary();

    const books = libraryRoot.querySelectorAll(".card");
    books.forEach((book) => book.classList.add("hidden"));

    library.forEach((book, i) =>
        book.title.toLocaleLowerCase().includes(query)
            ? books[i].classList.remove("hidden")
            : {}
    );
}

let library = JSON.parse(readLs("library"));

initFillLibrary();
