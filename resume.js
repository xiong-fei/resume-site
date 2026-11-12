/* ============================================================
   简历站渲染器
   数据来源：resume.json
   ============================================================ */

(function () {
    'use strict';

    /* ---------- 工具 ---------- */
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function toast(msg) {
        var box = document.getElementById('toastBox');
        var txt = document.getElementById('toastMessage');
        if (!box || !txt) return;
        txt.textContent = msg;
        box.classList.add('show');
        clearTimeout(box._t);
        box._t = setTimeout(function () { box.classList.remove('show'); }, 2000);
    }

    async function copyText(text, label) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            toast((label || '') + ' 已复制');
        } catch (e) {
            toast('复制失败，请手动选择');
        }
    }

    /* ---------- 各区块渲染 ---------- */
    function renderHeader(basic) {
        var contacts = (basic.contacts || []).map(function (c) {
            var inner = '<i class="ti ' + esc(c.icon || 'ti-link') + '"></i><span>' + esc(c.label) + '</span>';
            var cls = 'contact-item' + (c.copyable ? ' copyable' : '');

            if (c.href) {
                return '<a class="' + cls + '" href="' + esc(c.href) + '"' +
                    (c.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener noreferrer"' : '') +
                    ' title="' + esc(c.label) + '">' + inner + '</a>';
            }
            if (c.copyable) {
                return '<button class="' + cls + '" data-copy="' + esc(c.label) + '" title="点击复制">' + inner + '</button>';
            }
            return '<span class="' + cls + '">' + inner + '</span>';
        }).join('');

        var avatar = basic.avatar
            ? '<img class="avatar" src="' + esc(basic.avatar) + '" alt="' + esc(basic.realName || basic.name) + '" loading="lazy">'
            : '';

        var status = basic.status
            ? '<div class="status">' + esc(basic.status) + '</div>'
            : '';

        var tagLine = [basic.tag].filter(Boolean).join(' · ');

        return '' +
            '<header class="header">' +
                avatar +
                '<div class="header-main">' +
                    '<div class="name-line">' +
                        '<span class="name">' + esc(basic.name) + '</span>' +
                        (basic.realName ? '<span class="real-name">' + esc(basic.realName) + '</span>' : '') +
                    '</div>' +
                    (tagLine ? '<div class="tagline">' + esc(tagLine) + '</div>' : '') +
                    (basic.headline ? '<div class="headline">' + esc(basic.headline) + '</div>' : '') +
                    status +
                    (contacts ? '<div class="contacts">' + contacts + '</div>' : '') +
                '</div>' +
            '</header>';
    }

    function renderSummary(summary) {
        if (!summary || !summary.content) return '';
        return '' +
            '<section class="section">' +
                '<h2 class="section-title">' + esc(summary.title || '个人简介') + '</h2>' +
                '<p class="summary-text">' + esc(summary.content) + '</p>' +
            '</section>';
    }

    function renderSkills(skills) {
        if (!Array.isArray(skills) || !skills.length) return '';
        var body = skills.map(function (g) {
            var tags = (g.items || []).map(function (it) {
                return '<span class="skill-tag">' + esc(it) + '</span>';
            }).join('');
            return '' +
                '<div class="skill-group">' +
                    '<div class="skill-category">' + esc(g.category) + '</div>' +
                    '<div class="skill-items">' + tags + '</div>' +
                '</div>';
        }).join('');

        return '' +
            '<section class="section">' +
                '<h2 class="section-title">技能清单</h2>' +
                body +
            '</section>';
    }

    function renderExperiences(list) {
        if (!Array.isArray(list) || !list.length) return '';
        var body = list.map(function (e) {
            var head = '' +
                '<div class="entry-head">' +
                    '<div>' +
                        '<span class="entry-title">' + esc(e.company) + '</span>' +
                        (e.role ? '<span class="entry-role">' + esc(e.role) + '</span>' : '') +
                    '</div>' +
                    (e.period ? '<span class="entry-period">' + esc(e.period) + '</span>' : '') +
                '</div>';

            var sub = e.location ? '<div class="entry-sub">' + esc(e.location) + '</div>' : '';

            var highlights = (e.highlights && e.highlights.length)
                ? '<ul class="entry-list">' + e.highlights.map(function (h) {
                    return '<li>' + esc(h) + '</li>';
                }).join('') + '</ul>'
                : '';

            return '<div class="entry">' + head + sub + highlights + '</div>';
        }).join('');

        return '' +
            '<section class="section">' +
                '<h2 class="section-title">工作经历</h2>' +
                body +
            '</section>';
    }

    function renderProjects(list) {
        if (!Array.isArray(list) || !list.length) return '';
        var body = list.map(function (p) {
            var head = '' +
                '<div class="entry-head">' +
                    '<div>' +
                        '<span class="entry-title">' + esc(p.name) + '</span>' +
                        (p.role ? '<span class="entry-role">' + esc(p.role) + '</span>' : '') +
                    '</div>' +
                    (p.period ? '<span class="entry-period">' + esc(p.period) + '</span>' : '') +
                '</div>';

            var desc = p.description ? '<div class="entry-desc">' + esc(p.description) + '</div>' : '';

            var highlights = (p.highlights && p.highlights.length)
                ? '<ul class="entry-list">' + p.highlights.map(function (h) {
                    return '<li>' + esc(h) + '</li>';
                }).join('') + '</ul>'
                : '';

            var tech = (p.tech && p.tech.length)
                ? '<div class="tech-list">' + p.tech.map(function (t) {
                    return '<span class="tech-tag">' + esc(t) + '</span>';
                }).join('') + '</div>'
                : '';

            var link = p.link
                ? '<a class="project-link" href="' + esc(p.link) + '" target="_blank" rel="noopener noreferrer">' +
                    '<i class="ti ti-external-link"></i>' + esc(p.link.replace(/^https?:\/\//, '')) + '</a>'
                : '';

            return '<div class="entry">' + head + desc + highlights + tech + link + '</div>';
        }).join('');

        return '' +
            '<section class="section">' +
                '<h2 class="section-title">项目经历</h2>' +
                body +
            '</section>';
    }

    function renderEducation(list) {
        if (!Array.isArray(list) || !list.length) return '';
        var body = list.map(function (e) {
            var head = '' +
                '<div class="entry-head">' +
                    '<div>' +
                        '<span class="entry-title">' + esc(e.school) + '</span>' +
                        (e.major ? '<span class="entry-role">' + esc(e.major) + '</span>' : '') +
                    '</div>' +
                    (e.period ? '<span class="entry-period">' + esc(e.period) + '</span>' : '') +
                '</div>';

            var sub = e.degree ? '<div class="entry-sub">' + esc(e.degree) + '</div>' : '';

            var highlights = (e.highlights && e.highlights.length)
                ? '<ul class="entry-list">' + e.highlights.map(function (h) {
                    return '<li>' + esc(h) + '</li>';
                }).join('') + '</ul>'
                : '';

            return '<div class="entry">' + head + sub + highlights + '</div>';
        }).join('');

        return '' +
            '<section class="section">' +
                '<h2 class="section-title">教育背景</h2>' +
                body +
            '</section>';
    }

    /* ---------- 挂载 ---------- */
    function mount(data) {
        var app = document.getElementById('resumeApp');
        if (!app) return;

        // 页面标题 / meta
        var m = data.meta || {};
        if (m.title) document.title = m.title;
        if (m.description) {
            var d = document.querySelector('meta[name="description"]');
            if (d) d.setAttribute('content', m.description);
        }

        var html = '';
        if (data.basic) html += renderHeader(data.basic);
        if (data.summary) html += renderSummary(data.summary);
        html += renderSkills(data.skills);
        html += renderExperiences(data.experiences);
        html += renderProjects(data.projects);
        html += renderEducation(data.education);

        if (!html) {
            app.innerHTML = '<div class="loading">resume.json 里还没有内容，先填数据吧。</div>';
            return;
        }
        app.innerHTML = html;

        // 可复制项
        app.querySelectorAll('[data-copy]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                copyText(btn.getAttribute('data-copy'), '');
            });
        });
    }

    /* ---------- 主题 ---------- */
    function initTheme() {
        var btn = document.getElementById('themeBtn');
        if (!btn) return;

        function current() {
            return document.documentElement.getAttribute('data-theme')
                || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        }

        function syncIcon() {
            var t = current();
            btn.innerHTML = t === 'dark'
                ? '<i class="ti ti-sun"></i>'
                : '<i class="ti ti-moon"></i>';
        }

        btn.addEventListener('click', function () {
            var next = current() === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('resume-theme', next);
            syncIcon();
        });

        syncIcon();
    }

    /* ---------- 打印 ---------- */
    function initPrint() {
        var btn = document.getElementById('printBtn');
        if (btn) btn.addEventListener('click', function () { window.print(); });
    }

    /* ---------- 启动 ---------- */
    async function boot() {
        initTheme();
        initPrint();

        try {
            var resp = await fetch('resume.json?v=' + Date.now());
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            var data = await resp.json();
            mount(data);
        } catch (e) {
            var app = document.getElementById('resumeApp');
            if (app) {
                app.innerHTML = '<div class="loading">简历数据加载失败：' + esc(e.message) +
                    '<br><br>请确认 resume.json 存在且为合法 JSON。</div>';
            }
            console.error('[resume] load failed:', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
