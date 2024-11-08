document.addEventListener("DOMContentLoaded", async function() {
    const configFilePath = './Config/articles.txt'; // Path to the articles list file
    const articlesFolder = './Articles'; // Folder containing all the articles
    const leftColumn = document.querySelector('.left-column');
    const rightColumn = document.querySelector('.right-column');
    const topContainer = document.querySelector('.top-container'); // Select the top container
    const backToTopButton = document.getElementById('back-to-top');

    // Function to load and display the article list
    const loadArticles = async () => {
        try {
            const response = await fetch(configFilePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            const folders = text.split('\n').map(folder => folder.trim()).filter(folder => folder);

            for (const folder of folders) {
                try {
                    const response = await fetch(`${articlesFolder}/${folder}/article.txt`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const articleData = await response.text();
                    const [title, role, content] = parseArticleData(articleData);
                    const readingTime = calculateReadingTime(content);
                    const articlePanel = createArticlePanel(folder, title, role, content);
                    leftColumn.appendChild(articlePanel);

                    const urlParams = new URLSearchParams(window.location.search);
                    const articleParam = urlParams.get('article');

                    // Automatically select and display the article based on URL or the first article
                    if (articleParam === folder || (!articleParam && !document.querySelector('.article-panel.selected'))) {
                        displayArticle(title, content);
                        articlePanel.classList.add('selected');
                        if (!articleParam) {
                            history.replaceState(null, '', `?article=${folder}`);
                        }
                    }

                    articlePanel.addEventListener('click', function() {
                        // Remove 'selected' class from all panels
                        document.querySelectorAll('.article-panel').forEach(panel => panel.classList.remove('selected'));
                        // Add 'selected' class to the clicked panel
                        articlePanel.classList.add('selected');
                        displayArticle(title, content);
                        history.pushState(null, '', `?article=${folder}`);
                    });

                } catch (error) {
                    console.error(`Error loading article from ${folder}:`, error);
                }
            }
        } catch (error) {
            console.error('Error loading articles list:', error);
        }
    };

    // Function to parse article data
    const parseArticleData = (data) => {
        const parts = data.split('---');
        const title = parts[0].trim();
        const role = parts[1].trim();
        const content = parts.slice(2).join('---').trim(); // Join remaining parts as content
        return [title, role, content];
    };

    // Function to create an article panel
    const createArticlePanel = (folder, title, role, content) => {
        const panel = document.createElement('div');
        panel.className = 'article-panel';
        panel.innerHTML = `
            <h2 class="article-title">${title}</h2>
            <p class="article-info">${role}</p>
        `;
        panel.dataset.folder = folder;
        return panel;
    };

    const formatContent = (content) => {
        const paragraphs = content.split(/\n\s*\n/).map(paragraph => paragraph.trim());
        const formattedContent = paragraphs.map(paragraph => {
            const lines = paragraph.split('\n').map(line => line.trim());
    
            let formattedParagraph = lines.map((line, index) => {
                // Linked image using markdown-style syntax
                if (line.match(/\[!\[.*\]\((.*)\)\]\((.*)\)/)) {
                    const [, imgUrl, linkUrl] = line.match(/\[!\[.*\]\((.*)\)\]\((.*)\)/);
                    return `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer"><img src="${imgUrl}" alt="Linked Image" /></a>`;
                }
                // Plain image URL
                else if (line.match(/\.(gif|jpg|jpeg|png)$/)) {
                    return `<img src="${line}" alt="Embedded Image" />`;
                }
                // Video URL (e.g., MP4 format)
                else if (line.match(/\.(mp4)$/)) {
                    return `<video controls><source src="${line}" type="video/mp4"></video>`;
                }
                // YouTube or external link (for general hyperlinks)
                else if (line.match(/(https?:\/\/[^\s]+)/g)) {
                    return `<a href="${line}" target="_blank" rel="noopener noreferrer">${line}</a>`;
                }
                // Headers and other text processing
                else if (line.startsWith('### ')) {
                    return `<h3>${line.slice(4)}</h3>`;
                } else if (line.startsWith('## ')) {
                    return `<h2>${line.slice(3)}</h2>`;
                } else if (line.startsWith('# ')) {
                    return `<h1>${line.slice(2)}</h1>`;
                } else {
                    return line;
                }
            }).join(' ');
    
            return `<p>${formattedParagraph}</p>`;
        }).join('');
    
        return formattedContent;
    };
    
    
    

    // Function to calculate reading time
    const calculateReadingTime = (content) => {
        const wordsPerMinute = 200; // Average reading speed
        const textLength = content.split(' ').length; // Split by words
        const readingTime = Math.ceil(textLength / wordsPerMinute);
        return readingTime;
    };

    // Function to display a single article 
    const displayArticle = (title, content, grid) => {
        const formattedContent = formatContent(content, grid);
        rightColumn.innerHTML = `
            <div class="article-content">
                <h1>${title}</h1>
                <div>${formattedContent}</div>
            </div>
        `;
        // Scroll to the top of the right column
        rightColumn.scrollTop = 0;
        backToTopButton.style.display = 'none'; // Hide the back-to-top button when a new article is displayed
    };

    // Function to handle the shrinking header effect
    const handleScroll = () => {
        if (window.scrollY > 50) {
            topContainer.classList.add('shrink');
        } else {
            topContainer.classList.remove('shrink');
        }
    };

    // Function to handle back-to-top button visibility and functionality
    const handleRightColumnScroll = () => {
        if (rightColumn.scrollTop > 300) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    };

    backToTopButton.addEventListener('click', () => {
        rightColumn.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', handleScroll);
    rightColumn.addEventListener('scroll', handleRightColumnScroll);

    // Load the article list on page load
    await loadArticles();
});