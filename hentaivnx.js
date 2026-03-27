// hentaivnx.js - Plugin cho https://www.hentaivnx.com/ (Cập nhật 1.0.2)

function getManifest() {
    return {
        id: "hentaivnx",
        name: "HentaiVnX",
        version: "1.0.2",                    // Tăng version để app nhận cập nhật
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
        { id: "latest",   name: "Truyện mới cập nhật", type: "list" },
        { id: "featured", name: "Truyện đề cử", type: "list" }
    ];
}

function getUrlList(slug, filtersJson) {
    return "https://www.hentaivnx.com/";
}

// Parse danh sách truyện cải tiến (dùng nhiều pattern)
function parseListResponse(html) {
    const items = [];
    
    // Pattern 1: Markdown title [Title](url)
    const titleRegex = /\[([^\]]{5,})\]\((https?:\/\/www\.hentaivnx\.com\/truyen-hentai\/[^)]+)\)/g;
    let match;
    
    while ((match = titleRegex.exec(html)) !== null) {
        const title = match[1].trim().replace(/&#8230;/g, '…');
        let url = match[2];
        
        if (title.length < 5) continue;
        
        // Tìm latest chapter gần title đó
        const chapterRegex = new RegExp(`\\[${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?\\]\\((https?://www\\.hentaivnx\\.com[^)]+)\\)`, 'i');
        const chapterMatch = html.substring(match.index, match.index + 800).match(chapterRegex);
        
        let latestChapter = "Đang cập nhật";
        if (chapterMatch) {
            latestChapter = chapterMatch[1].split('/').pop().replace(/chapter-/i, 'Chap ');
        }
        
        items.push({
            title: title,
            url: url,
            thumbnail: "",
            latestChapter: latestChapter,
            updateTime: ""
        });
    }
    
    // Loại bỏ trùng
    const uniqueItems = [...new Map(items.map(item => [item.url, item])).values()];
    
    // Nếu không lấy được nhiều, fallback pattern rộng hơn
    if (uniqueItems.length < 5) {
        const broadRegex = /truyen-hentai\/[^"'\s)]+/g;
        // Có thể bổ sung sau nếu cần
    }
    
    return uniqueItems;
}

function getUrlDetail(slug) {
    return slug;
}

function parseDetailResponse(html, url) {
    // Tiêu đề
    let title = "Unknown Title";
    const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/\[([^\]]{10,})\]/);
    if (titleMatch) title = titleMatch[1].trim();

    // Thumbnail
    const thumbMatch = html.match(/<img[^>]+src=["']([^"']+\.(jpg|png|jpeg|webp|gif))["']/i);
    const thumbnail = thumbMatch ? thumbMatch[1] : "";

    // Danh sách chapter
    const chapters = [];
    const chapterRegex = /<a href=["']([^"']*chapter-\d+[^"']*)["'][^>]*>([^<]+)<\/a>/gi;
    let chMatch;
    while ((chMatch = chapterRegex.exec(html)) !== null) {
        let chUrl = chMatch[1];
        if (!chUrl.startsWith("http")) chUrl = "https://www.hentaivnx.com" + chUrl;
        
        chapters.push({
            name: chMatch[2].trim(),
            url: chUrl
        });
    }

    return {
        title: title,
        description: "Truyện hentai Việt Nam",
        thumbnail: thumbnail,
        chapters: chapters.reverse(),
        status: "Đang tiến hành"
    };
}

function getUrlChapter(chapterUrl) {
    return chapterUrl;
}

function parseChapterResponse(html) {
    const images = [];
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

function getUrlSearch(keyword, filtersJson) {
    return `https://www.hentaivnx.com/?s=${encodeURIComponent(keyword)}`;
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}
