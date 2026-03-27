// hentaivnx.js - Plugin cho https://www.hentaivnx.com/ (Version 1.0.5 - Parse Markdown tốt hơn)

function getManifest() {
    return {
        id: "hentaivnx",
        name: "HentaiVnX",
        version: "1.0.5",
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
        { id: "latest", name: "Truyện mới cập nhật", type: "list" },
        { id: "featured", name: "Truyện đề cử", type: "list" }
    ];
}

function getUrlList(slug, filtersJson) {
    return "https://www.hentaivnx.com/";
}

// Parse Markdown mạnh, phù hợp với cấu trúc thực tế của hentaivnx.com
function parseListResponse(html) {
    const items = [];
    const lines = html.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Bắt title: [Tiêu đề](link)
        const titleMatch = line.match(/\[([^\]]{8,}?)\]\((https?:\/\/www\.hentaivnx\.com\/truyen-hentai\/[^)]+)\)/);
        if (!titleMatch) continue;

        let title = titleMatch[1].trim()
            .replace(/&#8230;/g, '…')
            .replace(/\[18\+\]/gi, '')
            .replace(/『18\+』/g, '')
            .trim();

        let url = titleMatch[2];

        if (title.length < 8 || title.includes("Chapter") || title.includes("OneShot")) continue;

        // Tìm latest chapter ở dòng gần đó
        let latestChapter = "Đang cập nhật";
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
            const chMatch = lines[j].match(/\[?(Chapter \d+|OneShot)[^\]]*\]?\s*\((https?:\/\/[^)]+)\)/i);
            if (chMatch) {
                latestChapter = chMatch[1].replace(/\[|\]/g, '').trim();
                break;
            }
        }

        items.push({
            title: title,
            url: url,
            thumbnail: "",
            latestChapter: latestChapter,
            updateTime: ""
        });
    }

    return [...new Map(items.map(item => [item.url, item])).values()];
}

function getUrlDetail(slug) {
    return slug;
}

function parseDetailResponse(html, url) {
    let title = "Unknown Title";
    const tMatch = html.match(/\[([^\]]{10,})\]/);
    if (tMatch) title = tMatch[1].trim();

    const chapters = [];
    const chRegex = /\[?(Chapter \d+|OneShot)[^\]]*\]?\s*\((https?:\/\/www\.hentaivnx\.com[^)]+)\)/gi;
    let m;
    while ((m = chRegex.exec(html)) !== null) {
        chapters.push({
            name: m[1].trim(),
            url: m[2]
        });
    }

    return {
        title: title,
        description: "Truyện hentai trên HentaiVnX",
        thumbnail: "",
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