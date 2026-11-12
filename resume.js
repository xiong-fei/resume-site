/* ============================================================
   简历站渲染器 v2
   数据来源：resume.json
   ============================================================ */

(function () {
    'use strict';

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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

    async function copyText(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.style.cssText = 'position:fixed;opacity:0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            toast('已复制');
        } catch (e) { toast('复制失败，请手动选择'); }
    }

    function sectionTitle(icon, text, en) {
        return '<h2 class="section-title"><i class="ti ' + icon + '"></i><span>' + esc(text) + '</span>' +
            (en ? '<span class="en">' + esc(en) + '</span>' : '') + '</h2>';
    }

    /* ---------- 头部 ---------- */
    function renderHeader(b) {
        var contacts = (b.contacts || []).map(function (c) {
            var inner = '<i class="ti ' + esc(c.icon || 'ti-link') + '"></i><span>' + esc(c.label) + '</span>';
            var cls = 'contact-item' + (c.copyable ? ' copyable' : '');
            if (c.href) {
                return '<a class="' + cls + '" href="' + esc(c.href) + '"' +
                    (c.href.indexOf('http') === 0 ? ' target="_blank" rel="noopener noreferrer"' : '') +
                    '>' + inner + '</a>';
            }
            if (c.copyable) {
                return '<button class="' + cls + '" data-copy="' + esc(c.label) + '">' + inner + '</button>';
            }
            return '<span class="' + cls + '">' + inner + '</span>';
        }).join('');

        return '<header class="header">' +
            '<div class="header-main">' +
                '<div class="name-line">' +
                    '<span class="name">' + esc(b.name) + '</span>' +
                    (b.realName ? '<span class="alias">' + esc(b.realName) + '</span>' : '') +
                '</div>' +
                (b.headline ? '<div class="headline">' + esc(b.headline) + '</div>' : '') +
                (b.tag ? '<div class="tagline">' + esc(b.tag) + '</div>' : '') +
                (b.status ? '<div class="status">' + esc(b.status) + '</div>' : '') +
                (contacts ? '<div class="contacts">' + contacts + '</div>' : '') +
            '</div>' +
            (b.avatar ? '<div class="avatar-wrap"><img class="avatar" src="' + esc(b.avatar) +
                '" alt="' + esc(b.name) + '" loading="eager"></div>' : '') +
        '</header>';
    }

    /* ---------- 核心优势 ---------- */
    function renderHighlights(list) {
        if (!Array.isArray(list) || !list.length) return '';
        var cards = list.map(function (h) {
            return '<div class="highlight-card">' +
                '<div class="hc-title"><i class="ti ' + esc(h.icon || 'ti-star') + '"></i>' + esc(h.title) + '</div>' +
                '<div class="hc-desc">' + esc(h.desc) + '</div>' +
            '</div>';
        }).join('');
        return '<section class="section">' +
            sectionTitle('ti-bulb', '核心优势', 'Highlights') +
            '<div class="highlight-grid">' + cards + '</div>' +
        '</section>';
    }

    /* ---------- 简介 ---------- */
    function renderSummary(s) {
        if (!s || !s.content) return '';
        return '<section class="section">' +
            sectionTitle('ti-user', s.title || '个人简介', 'Profile') +
            '<p class="summary-text">' + esc(s.content) + '</p>' +
        '</section>';
    }

    /* ---------- 技术栈 ---------- */
    function renderSkills(list) {
        if (!Array.isArray(list) || !list.length) return '';
        var cards = list.map(function (g) {
            var tags = (g.items || []).map(function (it) {
                return '<span class="skill-tag">' + esc(it) + '</span>';
            }).join('');
            return '<div class="skill-card">' +
                '<div class="skill-head"><i class="ti ' + esc(g.icon || 'ti-code') + '"></i>' + esc(g.category) + '</div>' +
                '<div class="skill-tags">' + tags + '</div>' +
                (g.note ? '<div class="skill-note">' + esc(g.note) + '</div>' : '') +
            '</div>';
        }).join('');
        return '<section class="section">' +
            sectionTitle('ti-stack-2', '专业技术栈', 'Tech Stack') +
            '<div class="skill-grid">' + cards + '</div>' +
        '</section>';
    }

    /* ---------- 工作经历 ---------- */
    function renderExperiences(list) {
        if (!Array.isArray(list) || !list.length) return '';

        var body = list.map(function (e) {
            var head = '<div class="entry-head">' +
                '<div><span class="entry-title">' + esc(e.company) + '</span>' +
                (e.role ? '<span class="entry-role">' + esc(e.role) + '</span>' : '') + '</div>' +
                (e.period ? '<span class="entry-period">' + esc(e.period) + '</span>' : '') +
            '</div>';

            var loc = e.location ? '<div class="entry-loc">' + esc(e.location) + '</div>' : '';
            var sum = e.summary ? '<div class="entry-summary">' + esc(e.summary) + '</div>' : '';

            var subs = (e.highlights || []).map(function (h) {
                var tech = (h.tech && h.tech.length)
                    ? '<div class="tech-list">' + h.tech.map(function (t) {
                        return '<span class="tech-tag">' + esc(t) + '</span>';
                    }).join('') + '</div>'
                    : '';
                return '<div class="sub-entry">' +
                    '<div class="sub-title">' + esc(h.title) + '</div>' +
                    '<div class="sub-desc">' + esc(h.desc) + '</div>' +
                    tech +
                '</div>';
            }).join('');

            return '<div class="entry">' + head + loc + sum + subs + '</div>';
        }).join('');

        return '<section class="section">' +
            sectionTitle('ti-briefcase', '工作经历', 'Experience') +
            '<div class="timeline">' + body + '</div>' +
        '</section>';
    }

    /* ---------- 项目 ---------- */
    function renderProjects(list) {
        if (!Array.isArray(list) || !list.length) return '';

        var cards = list.map(function (p) {
            var head = '<div class="pc-head">' +
                '<div><span class="pc-name">' + esc(p.name) + '</span>' +
                (p.alias ? '<span class="pc-alias">' + esc(p.alias) + '</span>' : '') + '</div>' +
                (p.period ? '<span class="pc-period">' + esc(p.period) + '</span>' : '') +
            '</div>';

            var desc = p.description ? '<div class="pc-desc">' + esc(p.description) + '</div>' : '';

            var list2 = (p.highlights && p.highlights.length)
                ? '<ul class="entry-list">' + p.highlights.map(function (h) {
                    return '<li>' + esc(h) + '</li>';
                }).join('') + '</ul>'
                : '';

            var tech = (p.tech && p.tech.length)
                ? '<div class="tech-list">' + p.tech.map(function (t) {
                    return '<span class="tech-tag">' + esc(t) + '</span>';
                }).join('') + '</div>'
                : '';

            var links = p.link
                ? '<div class="pc-links"><a class="pc-link" href="' + esc(p.link) +
                    '" target="_blank" rel="noopener noreferrer"><i class="ti ti-external-link"></i>' +
                    esc(p.link.replace(/^https?:\/\//, '')) + '</a></div>'
                : '';

            return '<div class="project-card">' + head + desc + list2 + tech + links + '</div>';
        }).join('');

        return '<section class="section">' +
            sectionTitle('ti-rocket', '个人项目', 'Projects') +
            cards +
        '</section>';
    }

    /* ---------- 教育 ---------- */
    function renderEducation(list) {
        if (!Array.isArray(list) || !list.length) return '';

        var cards = list.map(function (e) {
            return '<div class="edu-card">' +
                '<i class="ti ti-school edu-icon"></i>' +
                '<div class="edu-main">' +
                    '<div class="edu-school">' + esc(e.school) + '</div>' +
                    '<div class="edu-major">' + esc([e.major, e.degree].filter(Boolean).join(' · ')) + '</div>' +
                '</div>' +
                (e.period ? '<span class="edu-period">' + esc(e.period) + '</span>' : '') +
            '</div>';
        }).join('');

        return '<section class="section">' +
            sectionTitle('ti-school', '教育背景', 'Education') +
            cards +
        '</section>';
    }

    /* ---------- 挂载 ---------- */
    function mount(data) {
        var app = document.getElementById('resumeApp');
        if (!app) return;

        var m = data.meta || {};
        if (m.title) document.title = m.title;
        if (m.description) {
            var d = document.querySelector('meta[name="description"]');
            if (d) d.setAttribute('content', m.description);
        }

        var html = '';
        if (data.basic) html += renderHeader(data.basic);
        html += renderHighlights(data.highlights);
        // 教育背景上移：放在核心优势之后，首屏附近即可看到
        html += renderEducation(data.education);
        if (data.summary) html += renderSummary(data.summary);
        html += renderSkills(data.skills);
        html += renderExperiences(data.experiences);
        html += renderProjects(data.projects);

        if (!html) {
            app.innerHTML = '<div class="loading">resume.json 里还没有内容。</div>';
            return;
        }
        app.innerHTML = html;

        app.querySelectorAll('[data-copy]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                copyText(btn.getAttribute('data-copy'));
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
        function sync() {
            btn.innerHTML = current() === 'dark' ? '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
        }
        btn.addEventListener('click', function () {
            var next = current() === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('resume-theme', next);
            sync();
        });
        sync();
    }

    function initPrint() {
        var b = document.getElementById('printBtn');
        if (b) b.addEventListener('click', function () { window.print(); });
    }

    async function boot() {
        initTheme();
        initPrint();
        try {
            var resp = await fetch('resume.json?v=' + Date.now());
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            mount(await resp.json());
        } catch (e) {
            var app = document.getElementById('resumeApp');
            if (app) app.innerHTML = '<div class="loading">简历数据加载失败：' + esc(e.message) + '</div>';
            console.error('[resume]', e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else { boot(); }
})();
