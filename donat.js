// Function to manipulate elements inside the iframe
function manipulateIframeContent() {
    // Get the iframe element
    const iframe = document.getElementById('fc-embed-frame');

    // Check if the iframe is loaded
    iframe.onload = function() {
        // Access the iframe's document
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Now you can manipulate elements inside the iframe
        const elementInsideIframe = iframeDoc.getElementById('main-page');
        if (elementInsideIframe) {
            elementInsideIframe.style.backgroundColor = 'red';

        }
    };
}

// Call the function to manipulate the iframe content
manipulateIframeContent();