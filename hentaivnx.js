// hentaivnx.js - Plugin cho https://www.hentaivnx.com/
// Type: COMIC (Truyện hentai)

function getManifest() {
    return {
        id: "hentaivnx",
        name: "HentaiVnX",
        version: "1.0.1",
        baseUrl: "https://www.hentaivnx.com",
        type: "COMIC",
        language: "vi",
        icon: "https://www.hentaivnx.com/favicon.ico",
        description: "Truyện hentai Việt Nam - HentaiVnX",
        author: "Cương + Grok",
        nsfw: true
    };
}

function getHomeSections() {
    return [
        { id: "featured", name: "Truyện đề cử", type: "list" },
        { id: "latest",   name: "Truyện mới cập nhật", type: "list" }
    ];
}

// Lấy URL cho trang chủ (cả 2 section đều dùng homepage)
function getUrlList(slug, filtersJson) {
    return "https://www.hentaivnx.com/";
}

// Parse danh sách truyện từ HTML homepage
function parseListResponse(html) {
    const items = [];
    
    // Regex lấy title và link detail
    const titleRegex = /\[([^\]]+)\]\((https?:\/\/www\.hentaivnx\.com\/truyen-hentai\/[^)]+)\)/g;
    let match;
    
    while ((match = titleRegex.exec(html)) !== null) {
        const title = match[1].trim();
        let url = match[2];
        
        if (title.length < 5) continue;
        
        // Lấy chapter mới nhất (tìm pattern [Chapter X] hoặc [OneShot])
        const chapterRegex = new RegExp(`\\[${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?\\]\\((https?://www\\.hentaivnx\\.com[^)]+)\\)`, 'i');
        const chapterMatch = html.match(chapterRegex);
        
        const latestChapter = chapterMatch ? chapterMatch[1].split('/').pop().replace('chapter-', 'Chap ') : "Đang cập nhật";
        
        items.push({
            title: title,
            url: url,
            thumbnail: "",                    // Không có img trên homepage → parse sau ở detail
            latestChapter: latestChapter,
            updateTime: ""                    // Có thể parse thêm "*X phút trước*"
        });
    }
    
    // Loại bỏ trùng lặp
    return [...new Map(items.map(item => [item.url, item])).values()];
}

// URL cho trang chi tiết truyện
function getUrlDetail(slug) {
    return slug;   // slug thường là full URL
}

// Parse trang detail (tiêu đề, mô tả, thumbnail, danh sách chapter)
function parseDetailResponse(html, url) {
    // Lấy tiêu đề
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/\[([^\]]+)\]/);
    const title = titleMatch ? titleMatch[1].trim() : "Unknown Title";

    // Lấy thumbnail (thường ở phần đầu trang detail)
    const thumbMatch = html.match(/<img[^>]+src=["']([^"']+\.(jpg|png|jpeg|webp))["']/i);
    const thumbnail = thumbMatch ? thumbMatch[1] : "";

    // Lấy danh sách chapter
    const chapters = [];
    const chapterRegex = /<a href=["']([^"']+chapter-\d+[^"']*)["'][^>]*>\s*\[?(Chapter \d+|OneShot)[^\]]*\]?\s*<\/a>/gi;
    let chMatch;
    
    while ((chMatch = chapterRegex.exec(html)) !== null) {
        let chUrl = chMatch[1];
        if (!chUrl.startsWith("http")) chUrl = "https://www.hentaivnx.com" + chUrl;
        
        chapters.push({
            name: chMatch[0].match(/\[?(Chapter \d+|OneShot)/i)[0] || "Chapter",
            url: chUrl
        });
    }

    return {
        title: title,
        description: "Truyện hentai full - Đọc tại HentaiVnX",
        thumbnail: thumbnail,
        chapters: chapters.reverse(),   // Đảo ngược để chapter mới nhất ở trên
        status: "Đang tiến hành"
    };
}

// URL đọc chapter
function getUrlChapter(chapterUrl) {
    return chapterUrl;
}

// Parse ảnh trong chapter
function parseChapterResponse(html) {
    const images = [];
    // Regex lấy tất cả src ảnh (thường là img trong phần đọc truyện)
    const imgRegex = /<img[^>]+src=["']([^"']+\.(jpg|png|jpeg|webp|gif))["'][^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(html)) !== null) {
        let src = match[1];
        if (src.startsWith("//")) src = "https:" + src;
        if (src.startsWith("/")) src = "https://www.hentaivnx.com" + src;
        
        if (src.includes("hentaivnx.com") || src.startsWith("http")) {
            images.push({
                url: src,
                headers: {
                    "Referer": "https://www.hentaivnx.com/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            });
        }
    }
    return images;
}

// Search (nếu trang hỗ trợ)
function getUrlSearch(keyword, filtersJson) {
    return `https://www.hentaivnx.com/?s=${encodeURIComponent(keyword)}`;
}

function parseSearchResponse(html) {
    return parseListResponse(html);   // Tạm dùng chung hàm parse list
}