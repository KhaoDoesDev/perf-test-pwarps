document.addEventListener('DOMContentLoaded', function() {
    // Get all gallery items
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalNote = document.getElementById('modalNote');
    const modalText = document.getElementById('modalText');
    const closeModal = document.querySelector('.close');
    const toast = document.getElementById('toast');
    const prevArrow = document.getElementById('prevArrow');
    const nextArrow = document.getElementById('nextArrow');
    const currentImageSpan = document.getElementById('currentImage');
    const totalImagesSpan = document.getElementById('totalImages');
    
    let currentImageIndex = 0;
    let galleryData = [];

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

    // Set total images count
    totalImagesSpan.textContent = galleryData.length;

    // Add event listeners to gallery items
    galleryItems.forEach((item, index) => {
        const locationName = item.querySelector('.location-name');
        const image = item.querySelector('img');

        // Handle location name click (copy to clipboard)
        locationName.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent image modal from opening
            copyWarpCommand(item.dataset.location);
        });

        // Handle gallery item click (open modal)
        image.addEventListener('click', function(e) {
            // Don't open modal if clicking on location name
            if (e.target.closest('.location-name')) {
                return;
            }
            
            openModal(index);
        });
    });

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
                case 'c':
                case 'C':
                    // Copy current warp command with 'C' key
                    e.preventDefault();
                    const currentData = galleryData[currentImageIndex];
                    copyWarpCommand(currentData.location);
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

    function openModal(index) {
        currentImageIndex = index;
        updateModalContent();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function navigateImage(direction) {
        const newIndex = currentImageIndex + direction;
        
        if (newIndex >= 0 && newIndex < galleryData.length) {
            currentImageIndex = newIndex;
            updateModalContent();
        }
    }

    function updateModalContent() {
        const currentData = galleryData[currentImageIndex];
        
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

    function closeModalFunction() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
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

    // Show toast notification
    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
