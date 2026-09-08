const addNoteBtn = document.getElementById("addNoteBtn");
const notesList = document.getElementById("notesList");
const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");
const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");
const searchInput = document.getElementById("searchInput");
const noteCount = document.getElementById("noteCount");
const saveStatus = document.getElementById("saveStatus");
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let selectedNoteId = null;
function saveToStorage() {
    localStorage.setItem("notes", JSON.stringify(notes));
}
function createId() {
    return Date.now().toString();
}
function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}
function renderNotes() {
    const search = searchInput.value.toLowerCase().trim();
    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search)
    );
    notesList.innerHTML = "";
    if (filteredNotes.length === 0) {
        notesList.innerHTML = `
            <div class="empty">
                No notes found
            </div>
        `;
    } else {
        filteredNotes.forEach(note => {
            const item = document.createElement("div");
            item.className = `note-item ${
                note.id === selectedNoteId ? "active" : ""
            }`;
            item.innerHTML = `
                <h3>${escapeHtml(note.title || "Untitled")}</h3>
                <p>${escapeHtml(note.content || "No content")}</p>
                <div class="note-date">${formatDate(note.updatedAt)}</div>
            `;
            item.addEventListener("click", () => selectNote(note.id));
            notesList.appendChild(item);
        });
    }
    noteCount.textContent = `${notes.length} ${
        notes.length === 1 ? "note" : "notes"
    }`;
}
function selectNote(id) {
    const note = notes.find(note => note.id === id);
    if (!note) return;
    selectedNoteId = id;
    titleInput.value = note.title;
    contentInput.value = note.content;
    saveStatus.textContent = "Saved";
    renderNotes();
}
function createNote() {
    const note = {
        id: createId(),
        title: "",
        content: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    notes.unshift(note);
    selectedNoteId = note.id;
    saveToStorage();
    selectNote(note.id);
    titleInput.focus();
}
function saveNote() {
    if (!selectedNoteId) {
        createNote();
        return;
    }
    const note = notes.find(note => note.id === selectedNoteId);
    if (!note) return;
    note.title = titleInput.value.trim();
    note.content = contentInput.value;
    note.updatedAt = new Date().toISOString();
    saveToStorage();
    renderNotes();
    saveStatus.textContent = "Saved";
}
function deleteNote() {
    if (!selectedNoteId) return;
    notes = notes.filter(note => note.id !== selectedNoteId);
    saveToStorage();
    selectedNoteId = null;
    titleInput.value = "";
    contentInput.value = "";
    saveStatus.textContent = "Saved";
    renderNotes();
    if (notes.length > 0) {
        selectNote(notes[0].id);
    }
}
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
function markUnsaved() {
    if (selectedNoteId) {
        saveStatus.textContent = "Unsaved changes";
    }
}
addNoteBtn.addEventListener("click", createNote);
saveBtn.addEventListener("click", saveNote);
deleteBtn.addEventListener("click", deleteNote);
searchInput.addEventListener("input", renderNotes);
titleInput.addEventListener("input", markUnsaved);
contentInput.addEventListener("input", markUnsaved);
document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveNote();
    }
});
if (notes.length > 0) {
    selectNote(notes[0].id);
} else {
    renderNotes();
}