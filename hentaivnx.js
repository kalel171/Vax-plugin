// hentaivnx.js - Plugin cho https://www.hentaivnx.com/ (Cập nhật 1.0.3 - Fix parse)

function getManifest() {
    return {
        id: "hentaivnx",
        name: "HentaiVnX",
        version: "1.0.3",                    // TĂNG VERSION này
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

// Parse cải tiến mạnh hơn cho Markdown của hentaivnx
function parseListResponse(html) {
    const items = [];
    
    // Pattern chính: [Tiêu đề](link)
    const regex = /\[([^\]]{8,})\]\((https?:\/\/www\.hentaivnx\.com\/truyen-hentai\/[^)]+)\)/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
        let title = match[1].trim();
        let url = match[2];
        
        // Lọc tiêu đề vô nghĩa
        if (title.length < 8 || title.includes("Chapter") || title.includes("OneShot")) continue;
        
        // Tìm chapter mới nhất gần đó
        let latestChapter = "Đang cập nhật";
        const nearbyText = html.substring(Math.max(0, match.index - 100), match.index + 600);
        const chMatch = nearbyText.match(/\[?(Chapter \d+|OneShot)[^\]]*\]?\s*\((https?:\/\/[^)]+)\)/i);
        if (chMatch) {
            latestChapter = chMatch[1].replace(/\[|\]/g, '');
        }
        
        items.push({
            title: title,
            url: url,
            thumbnail: "",
            latestChapter: latestChapter,
            updateTime: ""
        });
    }
    
    // Loại trùng lặp
    return [...new Map(items.map(i => [i.url, i])).values()];
}

function getUrlDetail(slug) {
    return slug;
}

function parseDetailResponse(html, url) {
    let title = html.match(/\[([^\]]{10,})\]/)?.[1] || "Unknown Title";
    
    const thumbMatch = html.match(/src=["']([^"']+\.(jpg|png|jpeg|webp))["']/i);
    const thumbnail = thumbMatch ? thumbMatch[1] : "";

    const chapters = [];
    const chRegex = /<a href=["']([^"']*chapter-\d+[^"']*)["'][^>]*>([^<]+)<\/a>/gi;
    let m;
    while ((m = chRegex.exec(html)) !== null) {
        let chUrl = m[1];
        if (!chUrl.startsWith("http")) chUrl = "https://www.hentaivnx.com" + chUrl;
        chapters.push({ name: m[2].trim(), url: chUrl });
    }

    return {
        title: title,
        description: "Truyện hentai trên HentaiVnX",
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
    const imgRegex = /<img[^>]+src=["']([^"']+\.(jpg|png|jpeg|webp|gif))["']/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
        let src = match[1];
        if (src.startsWith("//")) src = "https:" + src;
        if (src.startsWith("/")) src = "https://www.hentaivnx.com" + src;
        if (src) {
            images.push({
                url: src,
                headers: { "Referer": "https://www.hentaivnx.com/" }
            });
        }
    }
    return images;
}

function getUrlSearch(keyword) {
    return `https://www.hentaivnx.com/?s=${encodeURIComponent(keyword)}`;
}

function parseSearchResponse(html) {
    return parseListResponse(html);
}
