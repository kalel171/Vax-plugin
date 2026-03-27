// ============================================================
// Plugin: TruyenQQ (truyenqqno.com)
// Type: COMIC (Truyện Tranh)
// Version: 1.0.0
// Tác giả: build theo chuẩn VAX Plugin System
// ============================================================

// ===== A. CONFIG & METADATA =====

function getManifest() {
    return JSON.stringify({
        id: "truyenqqno",
        name: "TruyenQQ",
        version: "1.0.0",
        baseUrl: "https://truyenqqno.com",
        type: "COMIC",
        layout: "VERTICAL"
    });
}

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Mới Cập Nhật', slug: 'truyen-moi-cap-nhat' },
        { name: 'Truyện HOT', slug: 'hot' },
        { name: 'Hoàn Thành', slug: 'truyen-hoan-thanh' },
        { name: 'Hành Động', slug: 'the-loai/hanh-dong' },
        { name: 'Tình Cảm', slug: 'the-loai/tinh-cam' }
    ]);
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'truyen-moi-cap-nhat', title: 'Mới Cập Nhật', type: 'Horizontal', path: '' },
        { slug: 'hot',                  title: 'Truyện HOT',   type: 'Horizontal', path: '' },
        { slug: 'truyen-hoan-thanh',    title: 'Hoàn Thành',   type: 'Horizontal', path: '' },
        { slug: 'the-loai/hanh-dong',   title: 'Hành Động',    type: 'Horizontal', path: '' },
        { slug: 'the-loai/tinh-cam',    title: 'Tình Cảm',     type: 'Grid',       path: '' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: "Mới Cập Nhật", value: "truyen-moi-cap-nhat" },
            { name: "Truyện Hot",   value: "hot" },
            { name: "Hoàn Thành",  value: "truyen-hoan-thanh" }
        ],
        category: [
            { name: "Hành Động",    value: "the-loai/hanh-dong" },
            { name: "Tình Cảm",     value: "the-loai/tinh-cam" },
            { name: "Hài Hước",     value: "the-loai/hai-huoc" },
            { name: "Kinh Dị",      value: "the-loai/kinh-di" },
            { name: "Phiêu Lưu",    value: "the-loai/phieu-luu" },
            { name: "Viễn Tưởng",   value: "the-loai/vien-tuong" },
            { name: "Thể Thao",     value: "the-loai/the-thao" },
            { name: "Đời Thường",   value: "the-loai/doi-thuong" },
            { name: "Lãng Mạn",     value: "the-loai/lang-man" },
            { name: "Học Đường",    value: "the-loai/hoc-duong" },
            { name: "Manga",        value: "the-loai/manga" },
            { name: "Manhwa",       value: "the-loai/manhwa" },
            { name: "Manhua",       value: "the-loai/manhua" },
            { name: "Truyện Màu",   value: "the-loai/truyen-mau" },
            { name: "Isekai",       value: "the-loai/isekai" }
        ]
    });
}

// ===== B. URL GENERATORS =====

function getUrlList(slug, filtersJson) {
    var filters = {};
    try { filters = JSON.parse(filtersJson || "{}"); } catch(e) {}

    var page = filters.page || 1;
    var baseSlug = filters.category || filters.sort || slug || "truyen-moi-cap-nhat";

    var url = "https://truyenqqno.com/" + baseSlug + "/trang-" + page + ".html";
    return url;
}

function getUrlSearch(keyword, filtersJson) {
    var filters = {};
    try { filters = JSON.parse(filtersJson || "{}"); } catch(e) {}
    var page = filters.page || 1;
    var q = encodeURIComponent(keyword);
    return "https://truyenqqno.com/tim-kiem/trang-" + page + ".html?q=" + q;
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return "https://truyenqqno.com/truyen-tranh/" + slug;
}

function getUrlCategories() {
    return "https://truyenqqno.com/";
}

// ===== C. PARSERS =====

// ---- Helper PluginUtils ----
var PluginUtils = {
    cleanText: function(str) {
        if (!str) return "";
        return str.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#39;/g, "'")
                  .replace(/&quot;/g, '"').trim();
    }
};

// ---- Parse danh sách truyện ----
function parseListResponse(html) {
    var items = [];
    try {
        // TruyenQQ bọc mỗi truyện trong <li class="col-xs-3...">
        // Tách theo thẻ <li> hoặc theo item box
        var parts = html.split('<div class="book_avatar">');
        // parts[0] là phần header, bỏ qua
        for (var i = 1; i < parts.length; i++) {
            var block = parts[i];

            // Lấy link + slug
            var linkMatch = block.match(/href="([^"]*\/truyen-tranh\/([^"\/]+))"/);
            if (!linkMatch) continue;
            var fullUrl = linkMatch[1];
            var slug = linkMatch[2].replace(/\.html$/, "");

            // Lấy ảnh thumbnail
            var thumbMatch = block.match(/src="([^"]+)"/) || block.match(/data-src="([^"]+)"/);
            var thumb = thumbMatch ? thumbMatch[1] : "";
            if (thumb && thumb.indexOf("http") !== 0) thumb = "https://truyenqqno.com" + thumb;

            // Lấy tiêu đề
            var title = "";
            var titleMatch = block.match(/alt="([^"]+)"/);
            if (titleMatch) title = PluginUtils.cleanText(titleMatch[1]);

            // Lấy chapter mới nhất (label)
            var labels = [];
            var chapMatch = block.match(/Chapter\s*([\d\.]+)/i) || block.match(/Chap\s*([\d\.]+)/i);
            if (chapMatch) labels.push("Chap " + chapMatch[1]);

            if (slug && title) {
                items.push({
                    id: slug,
                    title: title,
                    posterUrl: thumb,
                    backdropUrl: thumb,
                    labels: labels
                });
            }
        }
    } catch(e) {}
    return JSON.stringify({ items: items });
}

// ---- Parse kết quả tìm kiếm (cùng cấu trúc với list) ----
function parseSearchResponse(html) {
    return parseListResponse(html);
}

// ---- Parse chi tiết truyện ----
function parseMovieDetail(html) {
    try {
        // Tên truyện
        var titleMatch = html.match(/<h1[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
                      || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        var title = titleMatch ? PluginUtils.cleanText(titleMatch[1]) : "";

        // Ảnh bìa
        var thumbMatch = html.match(/class="book_avatar"[\s\S]*?<img[^>]*src="([^"]+)"/i)
                       || html.match(/<img[^>]*class="[^"]*lazy[^"]*"[^>]*src="([^"]+)"/i);
        var poster = thumbMatch ? thumbMatch[1] : "";
        if (poster && poster.indexOf("http") !== 0) poster = "https://truyenqqno.com" + poster;

        // Mô tả / tóm tắt
        var descMatch = html.match(/class="[^"]*story[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
                      || html.match(/class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        var description = descMatch ? PluginUtils.cleanText(descMatch[1]) : "";

        // Thể loại
        var genres = [];
        var genreSection = html.match(/Thể loại[\s\S]*?<\/p>/i) || html.match(/Thể Loại[\s\S]*?<\/ul>/i);
        if (genreSection) {
            var genreMatches = genreSection[0].match(/href="[^"]+the-loai\/[^"]*">([^<]+)</g);
            if (genreMatches) {
                for (var g = 0; g < genreMatches.length; g++) {
                    var gName = genreMatches[g].match(/>([^<]+)</);
                    if (gName) genres.push(PluginUtils.cleanText(gName[1]));
                }
            }
        }

        // Tác giả
        var authorMatch = html.match(/Tác giả[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
        var author = authorMatch ? PluginUtils.cleanText(authorMatch[1]) : "";

        // Trạng thái
        var statusMatch = html.match(/Tình trạng[\s\S]*?<a[^>]*>([^<]+)<\/a>/i)
                        || html.match(/Trạng thái[\s\S]*?<a[^>]*>([^<]+)<\/a>/i);
        var status = statusMatch ? PluginUtils.cleanText(statusMatch[1]) : "";

        // ---- Danh sách chương ----
        var episodes = [];
        // TruyenQQ liệt kê chương dạng <div class="name_chapter"><a href="...">Chapter X</a></div>
        // hoặc <li><a href="/truyen-tranh/slug/chap-X/...">Chapter X</a></li>
        var chapListMatch = html.match(/id="list_chapter"([\s\S]*?)<\/ul>/i)
                          || html.match(/class="list_chapter"([\s\S]*?)<\/ul>/i)
                          || html.match(/<ul[^>]*chapter[^>]*>([\s\S]*?)<\/ul>/i);

        if (chapListMatch) {
            var chapRegex = /<a[^>]+href="([^"]+\/chap(?:ter)?-[\d\.]+[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
            var chapMatch;
            var seenChaps = {};
            while ((chapMatch = chapRegex.exec(chapListMatch[0])) !== null) {
                var chapUrl = chapMatch[1];
                var chapName = PluginUtils.cleanText(chapMatch[2]);
                if (!chapName || seenChaps[chapUrl]) continue;
                seenChaps[chapUrl] = true;
                if (chapUrl.indexOf("http") !== 0) chapUrl = "https://truyenqqno.com" + chapUrl;
                var chapId = chapUrl.replace("https://truyenqqno.com", "");
                episodes.push({
                    id: chapId,
                    name: chapName,
                    slug: chapName
                });
            }
        }

        // Nếu không tìm được chương, thử fallback toàn bộ HTML
        if (episodes.length === 0) {
            var globalChapRegex = /<a[^>]+href="([^"]*\/chap(?:ter)?-[\d]+[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
            var gcMatch;
            var seenGlobal = {};
            while ((gcMatch = globalChapRegex.exec(html)) !== null) {
                var gcUrl = gcMatch[1];
                var gcName = PluginUtils.cleanText(gcMatch[2]);
                if (!gcName || seenGlobal[gcUrl] || gcUrl.indexOf("the-loai") !== -1) continue;
                seenGlobal[gcUrl] = true;
                if (gcUrl.indexOf("http") !== 0) gcUrl = "https://truyenqqno.com" + gcUrl;
                var gcId = gcUrl.replace("https://truyenqqno.com", "");
                episodes.push({ id: gcId, name: gcName, slug: gcName });
            }
        }

        // TruyenQQ thường liệt kê từ chương MỚI → CŨ, đảo lại để CŨ → MỚI
        episodes.reverse();

        var servers = [];
        if (episodes.length > 0) {
            servers.push({ name: "TruyenQQ", episodes: episodes });
        } else {
            servers.push({ name: "TruyenQQ", episodes: [{ id: "", name: "Đang cập nhật", slug: "updating" }] });
        }

        return JSON.stringify({
            title: title,
            posterUrl: poster,
            backdropUrl: poster,
            description: description,
            genres: genres,
            author: author,
            status: status,
            servers: servers
        });

    } catch(e) {
        return JSON.stringify({ title: "", servers: [] });
    }
}

// ---- Parse trang đọc chương (ảnh từng trang) ----
function parseDetailResponse(html, fallbackUrl) {
    try {
        // TruyenQQ nhúng ảnh chương vào mảng JS hoặc thẻ <img> trong div#box_doc
        // Thử lấy từ mảng JS: var images = ["url1","url2",...]
        var imgArrayMatch = html.match(/(?:listImages|images)\s*=\s*\[([\s\S]*?)\]/i);
        if (imgArrayMatch) {
            var rawArr = imgArrayMatch[1];
            var imgUrls = [];
            var urlReg = /"(https?:\/\/[^"]+)"/g;
            var um;
            while ((um = urlReg.exec(rawArr)) !== null) {
                imgUrls.push(um[1]);
            }
            if (imgUrls.length > 0) {
                return JSON.stringify({
                    type: "IMAGES",
                    images: imgUrls,
                    headers: {
                        "Referer": "https://truyenqqno.com/",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                });
            }
        }

        // Fallback: lấy ảnh từ div#box_doc hoặc class reading-detail
        var boxMatch = html.match(/id="box_doc"([\s\S]*?)<\/div>/i)
                     || html.match(/class="[^"]*reading[^"]*"([\s\S]*?)<\/div>/i);
        var imgBlock = boxMatch ? boxMatch[0] : html;
        var imgTagReg = /<img[^>]+(?:src|data-src)="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/gi;
        var it;
        var pageImages = [];
        var seenImg = {};
        while ((it = imgTagReg.exec(imgBlock)) !== null) {
            var imgUrl = it[1];
            if (!seenImg[imgUrl]) {
                pageImages.push(imgUrl);
                seenImg[imgUrl] = true;
            }
        }

        if (pageImages.length > 0) {
            return JSON.stringify({
                type: "IMAGES",
                images: pageImages,
                headers: {
                    "Referer": "https://truyenqqno.com/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            });
        }

        // Fallback cuối: trả về URL gốc
        var chapUrl = (fallbackUrl && fallbackUrl.indexOf("http") === 0)
            ? fallbackUrl
            : "https://truyenqqno.com" + (fallbackUrl || "");

        return JSON.stringify({
            type: "IMAGES",
            images: [],
            url: chapUrl,
            headers: {
                "Referer": "https://truyenqqno.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

    } catch(e) {
        return JSON.stringify({ type: "IMAGES", images: [] });
    }
}
