const STORAGE_KEY = "amateurOS_filesystem";
const defaultFileSystem = {
    type: "folder",
    name: "Home",
    children: [
        {
            type: "folder",
            name: "Documents",
            children: [
                {
                    type: "file",
                    name: "Welcome.txt",
                    content: "Welcome to AmateurOS!"
                }
            ]
        },
        { type: "folder", name: "Pictures", children: [] },
        { type: "folder", name: "Downloads", children: [] },
        { type: "folder", name: "Projects", children: [] }
    ]
};
let fileSystem = loadFileSystem();
let currentFolder = fileSystem;
let folderPath = [fileSystem];
let selectedItem = null;
let selectedParent = null;
let modalMode = null;
const $ = id => document.getElementById(id);
const fileGrid = $("fileGrid");
const emptyMessage = $("emptyMessage");
const fileSearch = $("fileSearch");
const breadcrumb = $("breadcrumb");
const itemCount = $("itemCount");
const currentPath = $("currentPath");
const contextMenu = $("contextMenu");
const modalOverlay = $("modalOverlay");
const modalTitle = $("modalTitle");
const modalInput = $("modalInput");
const modalError = $("modalError");
const modalConfirm = $("modalConfirm");
function loadFileSystem() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : structuredClone(defaultFileSystem);
    } catch {
        return structuredClone(defaultFileSystem);
    }
}
function saveFileSystem() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fileSystem));
}
function getIcon(item) {
    if (item.type === "folder") return "📁";
    const ext = item.name.split(".").pop().toLowerCase();
    const icons = {
        html: "🌐",
        css: "🎨",
        js: "📜",
        png: "🖼️",
        jpg: "🖼️",
        jpeg: "🖼️",
        gif: "🖼️",
        txt: "📄",
        mp3: "🎵",
        wav: "🎵",
        mp4: "🎬",
        webm: "🎬",
        zip: "📦",
        rar: "📦"
    };
    return icons[ext] || "📄";
}
function getFileExtension(item) {
    if (item.type === "folder") return "Folder";
    const parts = item.name.split(".");
    return parts.length > 1
        ? "." + parts.pop().toUpperCase()
        : "File";
}
function renderFiles() {
    fileGrid.innerHTML = "";
    let items = [...(currentFolder.children || [])];
    const search = fileSearch.value.trim().toLowerCase();
    if (search) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(search)
        );
    }
    items.sort((a, b) =>
        a.type !== b.type
            ? a.type === "folder" ? -1 : 1
            : a.name.localeCompare(b.name)
    );
    emptyMessage.style.display = items.length ? "none" : "block";
    items.forEach(item => {
        const el = document.createElement("div");
        el.className = "file-item" +
            (item === selectedItem ? " selected" : "");
        el.innerHTML = `
            <div class="file-icon">${getIcon(item)}</div>
            <div class="file-name"></div>
            <div class="file-type">${getFileExtension(item)}</div>
        `;
        el.querySelector(".file-name").textContent = item.name;
        el.onclick = e => {
            e.stopPropagation();
            selectItem(item, currentFolder);
        };
        el.ondblclick = e => {
            e.stopPropagation();
            openItem(item);
        };
        el.oncontextmenu = e => {
            e.preventDefault();
            e.stopPropagation();
            selectItem(item, currentFolder);
            showContextMenu(e.clientX, e.clientY);
        };
        fileGrid.appendChild(el);
    });
    updateStatus();
    updateBreadcrumb();
}
function selectItem(item, parent) {
    selectedItem = item;
    selectedParent = parent;
    document.querySelectorAll(".file-item").forEach(el =>
        el.classList.remove("selected")
    );
    const items = [...fileGrid.children];
    const index = parent.children.indexOf(item);
    if (items[index]) {
        items[index].classList.add("selected");
    }
}
function openItem(item) {
    if (item.type === "folder") {
        currentFolder = item;
        folderPath.push(item);
        selectedItem = null;
        selectedParent = null;
        fileSearch.value = "";
        renderFiles();
    } else {
        openFile(item);
    }
}
function openFile(file) {
    if (getFileExtension(file) === ".TXT" || getFileExtension(file) === "File") {
        alert(`${file.name}\n\n${file.content || ""}`);
    } else {
        alert(
            `${file.name}\n\n` +
            "AmateurOS currently treats this as a file."
        );
    }
}
function goBack() {
    if (folderPath.length === 1) return;
    folderPath.pop();
    currentFolder = folderPath.at(-1);
    selectedItem = null;
    selectedParent = null;
    fileSearch.value = "";
    renderFiles();
}
function goHome() {
    currentFolder = fileSystem;
    folderPath = [fileSystem];
    selectedItem = null;
    selectedParent = null;
    fileSearch.value = "";
    renderFiles();
}
function updateBreadcrumb() {
    breadcrumb.innerHTML = "";
    folderPath.forEach((folder, i) => {
        const el = document.createElement("span");
        el.className = "breadcrumb-item";
        el.textContent = folder.name;
        el.onclick = () => {
            folderPath = folderPath.slice(0, i + 1);
            currentFolder = folder;
            selectedItem = null;
            selectedParent = null;
            fileSearch.value = "";
            renderFiles();
        };
        breadcrumb.appendChild(el);
        if (i < folderPath.length - 1) {
            const sep = document.createElement("span");
            sep.className = "breadcrumb-separator";
            sep.textContent = "›";
            breadcrumb.appendChild(sep);
        }
    });
    currentPath.textContent =
        "/" + folderPath.slice(1).map(x => x.name).join("/");
}
function updateStatus() {
    const count = currentFolder.children?.length || 0;
    itemCount.textContent =
        `${count} ${count === 1 ? "item" : "items"}`;
}
function openModal(mode, name = "") {
    modalMode = mode;
    modalOverlay.style.display = "flex";
    modalInput.value = name;
    modalError.textContent = "";
    const titles = {
        folder: "New Folder",
        file: "New File",
        rename: "Rename"
    };
    modalTitle.textContent = titles[mode];
    modalConfirm.textContent =
        mode === "rename" ? "Rename" : "Create";
    modalInput.placeholder =
        mode === "folder"
            ? "Folder name..."
            : mode === "file"
                ? "example.txt"
                : "New name...";
    setTimeout(() => {
        modalInput.focus();
        modalInput.select();
    }, 50);
}
function closeModal() {
    modalOverlay.style.display = "none";
    modalMode = null;
    modalInput.value = "";
    modalError.textContent = "";
}
function nameExists(folder, name, ignore = null) {
    return (folder.children || []).some(item =>
        item !== ignore &&
        item.name.toLowerCase() === name.toLowerCase()
    );
}
function confirmModal() {
    const name = modalInput.value.trim();
    if (!name) {
        modalError.textContent = "Please enter a name.";
        return;
    }
    if (modalMode === "rename") {
        if (!selectedItem || !selectedParent) return;
        if (nameExists(selectedParent, name, selectedItem)) {
            modalError.textContent =
                "A file or folder with that name already exists.";
            return;
        }
        selectedItem.name = name;
    } else {
        if (nameExists(currentFolder, name)) {
            modalError.textContent =
                "That name already exists.";
            return;
        }
        currentFolder.children.push(
            modalMode === "folder"
                ? {
                    type: "folder",
                    name,
                    children: []
                }
                : {
                    type: "file",
                    name,
                    content: ""
                }
        );
    }
    saveFileSystem();
    closeModal();
    renderFiles();
}
function deleteSelectedItem() {
    if (!selectedItem || !selectedParent) return;
    if (!confirm(`Delete "${selectedItem.name}"?`)) return;
    const index =
        selectedParent.children.indexOf(selectedItem);
    if (index !== -1) {
        selectedParent.children.splice(index, 1);
    }
    selectedItem = null;
    selectedParent = null;
    saveFileSystem();
    renderFiles();
}
function showContextMenu(x, y) {
    contextMenu.style.display = "block";
    contextMenu.style.left =
        Math.min(
            x,
            innerWidth - contextMenu.offsetWidth - 5
        ) + "px";
    contextMenu.style.top =
        Math.min(
            y,
            innerHeight - contextMenu.offsetHeight - 5
        ) + "px";
}
function hideContextMenu() {
    contextMenu.style.display = "none";
}
$("backButton").onclick = goBack;
$("homeButton").onclick = goHome;
$("newFolderButton").onclick =
    () => openModal("folder");
$("newFileButton").onclick =
    () => openModal("file");
fileSearch.oninput = renderFiles;
$("contextOpen").onclick = () => {
    if (selectedItem) openItem(selectedItem);
    hideContextMenu();
};
$("contextRename").onclick = () => {
    if (selectedItem) {
        openModal("rename", selectedItem.name);
    }
    hideContextMenu();
};
$("contextDelete").onclick = () => {
    deleteSelectedItem();
    hideContextMenu();
};
modalConfirm.onclick = confirmModal;
$("modalCancel").onclick = closeModal;
$("modalClose").onclick = closeModal;
modalInput.onkeydown = e => {
    if (e.key === "Enter") confirmModal();
    if (e.key === "Escape") closeModal();
};
document.onclick = hideContextMenu;
contextMenu.onclick = e => {
    e.stopPropagation();
};
fileGrid.onclick = () => {
    selectedItem = null;
    selectedParent = null;

    document.querySelectorAll(".file-item").forEach(el =>
        el.classList.remove("selected")
    );
};
document.onkeydown = e => {
    if (
        e.key === "Delete" &&
        selectedItem
    ) {
        deleteSelectedItem();
    }
    if (
        e.key === "Backspace" &&
        document.activeElement !== fileSearch &&
        document.activeElement !== modalInput
    ) {
        goBack();
    }
    if (e.key === "Escape") {
        hideContextMenu();
        if (modalOverlay.style.display === "flex") {
            closeModal();
        }
    }
};
renderFiles();