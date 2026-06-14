// ============================================================
// 东北证券药品团队官网 - 交互脚本
// 仅保留：调研登录 + 导航 + 回到顶部
// 估值专区已移除（2026-06-14）
// ============================================================

// --- 调研专区登录 ---
var RESEARCH_CREDENTIALS = { user: 'sujingcheng', pass: '111' };

function checkResearchLogin() {
    var loggedIn = sessionStorage.getItem('research_logged_in') === 'true';
    var overlay = document.getElementById('researchLoginOverlay');
    var content = document.getElementById('researchContent');
    var logoutDiv = document.getElementById('researchLogout');

    if (loggedIn) {
        overlay.style.display = 'none';
        content.style.display = 'block';
        logoutDiv.style.display = 'block';
    } else {
        overlay.style.display = 'block';
        content.style.display = 'none';
        logoutDiv.style.display = 'none';
    }
}

function handleResearchLogin() {
    var user = document.getElementById('researchUser').value.trim();
    var pass = document.getElementById('researchPass').value.trim();
    var errEl = document.getElementById('loginError');

    if (!user || !pass) {
        errEl.textContent = '请输入账号和密码';
        return;
    }
    if (user !== RESEARCH_CREDENTIALS.user || pass !== RESEARCH_CREDENTIALS.pass) {
        errEl.textContent = '账号或密码错误，请重试';
        return;
    }
    sessionStorage.setItem('research_logged_in', 'true');
    errEl.textContent = '';
    checkResearchLogin();
}

function handleResearchLogout() {
    sessionStorage.removeItem('research_logged_in');
    checkResearchLogin();
    document.getElementById('researchUser').value = '';
    document.getElementById('researchPass').value = '';
}

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', function() {

    // 调研专区登录
    checkResearchLogin();
    document.getElementById('researchLoginBtn').addEventListener('click', handleResearchLogin);
    document.getElementById('researchPass').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleResearchLogin();
    });
    document.getElementById('researchLogoutBtn').addEventListener('click', handleResearchLogout);

    // 导航平滑滚动
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // 导航滚动高亮 + 回到顶部
    var sections = document.querySelectorAll('.section[id]');
    var navLinks = document.querySelectorAll('.nav-link');

    function updateNavHighlight() {
        var current = '';
        sections.forEach(function(sec) {
            if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
        });
        navLinks.forEach(function(link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    }

    window.addEventListener('scroll', function() {
        updateNavHighlight();
        document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
    });

    document.getElementById('backToTop').addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
