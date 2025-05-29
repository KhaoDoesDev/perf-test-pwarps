let galleryItems = null;
let galleryData = null;
let currentImageIndex = null;

function openModal(index) {
    const modal = document.getElementById('imageModal');
    currentImageIndex = index;
    updateModalContent();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function updateModalContent() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const currentImageSpan = document.getElementById('currentImage');
    const modalNote = document.getElementById('modalNote');
    const modalText = document.getElementById('modalText');

    const currentData = galleryData[currentImageIndex];
    document.location.hash = "#" + currentData.location;

    modalImage.src = currentData.imageSrc;
    modalTitle.textContent = currentData.location;
    modalText.textContent = currentData.description;
    currentImageSpan.textContent = currentImageIndex + 1;

    // Update note
    if (currentData.note && currentData.note.trim() !== '') {
        modalNote.textContent = currentData.note;
        modalNote.style.display = 'block';
    } else {
        modalNote.style.display = 'none';
    }

    // Update arrow states
    prevArrow.classList.toggle('disabled', currentImageIndex === 0);
    nextArrow.classList.toggle('disabled', currentImageIndex === galleryData.length - 1);

    // Add loading effect
    modalImage.style.opacity = '0.5';
    modalImage.onload = function() {
        modalImage.style.opacity = '1';
    };
}


function copyWarpCommand(location) {
    const textToCopy = `/pwarp ${location}`;

    // Copy to clipboard
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast();
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopyTextToClipboard(textToCopy);
        });
    } else {
        fallbackCopyTextToClipboard(textToCopy);
    }
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showToast();
        }
    } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
    }

    document.body.removeChild(textArea);
}

function adjustThumbnailsForReordering() {
    galleryItems = document.querySelectorAll('.gallery-item');
    // Add event listeners to gallery items
    galleryItems.forEach((item, index) => {
        const locationTitle = item.querySelector('.location-title');
        const image = item.querySelector('img');


        // Handle location title click (copy to clipboard)
        let titleHandler = function(e) {
            e.stopPropagation(); // Prevent image modal from opening
            copyWarpCommand(item.dataset.location);
        };
        if(locationTitle.titleHandler != null)
            locationTitle.removeEventListener("click", locationTitle.titleHandler);
        locationTitle.addEventListener('click', titleHandler);
        locationTitle.titleHandler = titleHandler;

        // Handle gallery item click (open modal)
        let imageHandler = function(e) {
            // Don't open modal if clicking on location title
            if (e.target.closest('.location-title')) {
                return;
            }

            openModal(index);
        };
        if(image.imageHandler != null)
            image.removeEventListener("click", image.imageHandler);
        image.addEventListener('click', imageHandler);
        image.imageHandler = imageHandler;
    });

    galleryData = [];
    // Build gallery data array
    galleryItems.forEach((item, index) => {
        const image = item.querySelector('img');
        galleryData.push({
            element: item,
            location: item.dataset.location,
            description: item.dataset.description,
            note: item.dataset.note,
            imageSrc: image.src,
            index: index
        });
    });
}

// Show toast notification
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Get all gallery items
    galleryItems = document.querySelectorAll('.gallery-item')
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalNote = document.getElementById('modalNote');
    const modalText = document.getElementById('modalText');
    const closeModal = document.querySelector('.close');
    const prevArrow = document.getElementById('prevArrow');
    const nextArrow = document.getElementById('nextArrow');
    const totalImagesSpan = document.getElementById('totalImages');

    currentImageIndex = 0;

    adjustThumbnailsForReordering();

    // Set total images count
    totalImagesSpan.textContent = galleryData.length;

    // Modal title click (copy to clipboard)
    modalTitle.addEventListener('click', function(e) {
        e.stopPropagation();
        const currentData = galleryData[currentImageIndex];
        copyWarpCommand(currentData.location);
    });

    // Navigation arrow event listeners
    prevArrow.addEventListener('click', function(e) {
        e.stopPropagation();
        navigateImage(-1);
    });

    nextArrow.addEventListener('click', function(e) {
        e.stopPropagation();
        navigateImage(1);
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'block') {
            switch(e.key) {
                case 'Escape':
                    closeModalFunction();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    navigateImage(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    navigateImage(1);
                    break;
            }
        }
    });

    // Close modal functionality
    closeModal.addEventListener('click', closeModalFunction);

    // Close modal when clicking outside of it
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModalFunction();
        }
    });


    function navigateImage(direction) {
        const newIndex = currentImageIndex + direction;

        if (newIndex >= 0 && newIndex < galleryData.length) {
            currentImageIndex = newIndex;
            updateModalContent();
        }
    }

    function closeModalFunction() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.location.hash = "";
    }

    // Radio functionality
    for(radioEl of document.querySelectorAll(".radio")) {
        let subEls = radioEl.querySelectorAll("span");
        for(subEl of subEls) {
            const thisSubEl = subEl;
            thisSubEl.addEventListener("click", () => {
                for(anySubEl of subEls) {
                    anySubEl.classList.remove("radio-selected");
                }
                thisSubEl.classList.add("radio-selected");
            });
        }
    }

    // Load saved sorting
    if(localStorage.getItem("pwarps-sort-critera") != null) {
        for(el of document.querySelectorAll("#sort-critera span")) {
            el.classList.remove("radio-selected");
            if(el.innerText.toLowerCase() == localStorage.getItem("pwarps-sort-critera")) {
                el.classList.add("radio-selected");
            }
        }
    }
    if(localStorage.getItem("pwarps-sort-order") != null) {
        for(el of document.querySelectorAll("#sort-order span")) {
            el.classList.remove("radio-selected");
            if(el.innerText.toLowerCase() == localStorage.getItem("pwarps-sort-order")) {
                el.classList.add("radio-selected");
            }
        }
    }

    // Apply current sort
    onSortChanged();

    // Open modal, if hash found in url
    if(document.location.hash != null && document.location.hash.length > 0) {
        let hash = document.location.hash;
        if(hash.startsWith("#")) hash = hash.substring(1);
        galleryData.forEach((data, index) => {
            if(data.location === hash) {
                openModal(index);
            }
        })
    }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function reorderGallery(critera, order) {
    let gallery = document.querySelector(".gallery");
    let galleryItems = gallery.querySelectorAll(".gallery-item");
    galleryItems = Array.prototype.slice.call(galleryItems, 0); // Turn into array
    for(galleryItem of galleryItems) {
        gallery.removeChild(galleryItem);
    }
    let sortMult = order == "desc" ? -1 : 1;
    if(critera == "name") {
        console.log("Sorting by name (" + order + ")");
        const onlyAlphaNum = (str) => str.match(/[a-zA-Z0-9]/g).join("");
        galleryItems.sort((a, b) => onlyAlphaNum(a.dataset.location).toLowerCase().localeCompare(onlyAlphaNum(b.dataset.location).toLowerCase()) * sortMult);
    } else if(critera == "owner") {
        console.log("Sorting by owner (" + order + ")");
        galleryItems.sort((a, b) => a.dataset.owner.toLowerCase().localeCompare(b.dataset.owner.toLowerCase()) * sortMult);
    } else if(critera == "created") {
        console.log("Sorting by created (" + order + ")");
        galleryItems.sort((a, b) => a.dataset.created.localeCompare(b.dataset.created) * sortMult);
    } else if(critera == "visits") {
        console.log("Sorting by visits (" + order + ")");
        galleryItems.sort((a, b) => (parseInt(a.dataset.visits) - parseInt(b.dataset.visits)) * sortMult);
    } else if(critera == "shuffle") {
        console.log("Sorting by shuffle");
        shuffleArray(galleryItems);
    } else {
        console.error("Unknown critera: " + critera);
    }
    for(galleryItem of galleryItems) {
        gallery.appendChild(galleryItem);
    }

    adjustThumbnailsForReordering();
}

function onSortChanged() {
    let critera = document.querySelector("#sort-critera .radio-selected").innerText.toLowerCase();
    let order = document.querySelector("#sort-order .radio-selected").innerText.toLowerCase();

    localStorage.setItem("pwarps-sort-critera", critera);
    localStorage.setItem("pwarps-sort-order", order);
    reorderGallery(critera, order);
}
