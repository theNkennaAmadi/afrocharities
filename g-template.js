
class Archive {
    constructor() {
        this.nextLinksContainer = document.querySelectorAll('.next-link');
        this.links = Array.from(this.nextLinksContainer).map(link => link.getAttribute('href'));
        this.nextLink = document.querySelector('.nav-prog-btn.next')
        this.prevLink = document.querySelector('.nav-prog-btn.prev')
        this.init();
    }

    init(){
        this.setUpNextPrev();
    }

    findAdjacentLinks(url, links) {
        const index = links.indexOf(url);

        if (index === -1) {
            return { previous: null, next: null };
        }

        const previous = index === 0 ? links[links.length - 1] : links[index - 1];
        const next = index === links.length - 1 ? links[0] : links[index + 1];

        return { previous, next };
    }

    setUpNextPrev(){
        const result = this.findAdjacentLinks(window.location.pathname, this.links);
        this.nextLink.href = result.next
        this.prevLink.href = result.previous
    }
}



// Example usage
new Archive();
