// ============================================================
// 东北证券药品团队官网 - 交互脚本
// 仅保留：调研登录 + 底稿登录 + 导航 + 回到顶部
// 估值专区已移除（2026-06-14）
// ============================================================

// --- 统一登录凭证 ---
var CREDENTIALS = { user: 'sujingcheng', pass: '111' };

// ===========================================================
// 实时股价更新（腾讯财经免费API，无CORS限制）
// ===========================================================
(function() {
    function toApiCode(code) {
        if (!code) return '';
        if (code.endsWith('.SZ')) return 'sz' + code.replace('.SZ', '');
        if (code.endsWith('.SH')) return 'sh' + code.replace('.SH', '');
        return code;
    }

    function parseStockLine(varName) {
        var raw = window[varName];
        if (!raw || typeof raw !== 'string') return null;
        var fields = raw.split('~');
        var price = parseFloat(fields[3]);
        var change = parseFloat(fields[31]);   // 涨跌额
        var changePct = parseFloat(fields[32]); // 涨跌幅%
        if (isNaN(price) || price <= 0) return null;
        return { price: price, change: change, changePct: changePct };
    }

    function updateRow(apiCode, origCode) {
        var data = parseStockLine('v_' + apiCode);
        if (!data) return;
        var row = document.querySelector('#portfolio tbody tr[data-code="' + origCode + '"]');
        if (!row) return;
        var priceEl = row.querySelector('.rt-price');
        var changeEl = row.querySelector('.rt-change');
        var color = data.changePct >= 0 ? '#e74c3c' : '#27ae60';
        var sign = data.changePct >= 0 ? '+' : '';
        if (priceEl) {
            priceEl.textContent = '¥' + data.price.toFixed(2);
            priceEl.style.color = color;
        }
        if (changeEl) {
            changeEl.textContent = sign + data.changePct.toFixed(2) + '%';
            changeEl.style.color = color;
        }
    }

    function updateStockpick() {
        var data = parseStockLine('v_sh688621');
        if (!data) return;
        var priceEl = document.getElementById('stockpick-price');
        var changeEl = document.getElementById('stockpick-change');
        var color = data.changePct >= 0 ? '#e74c3c' : '#27ae60';
        var sign = data.changePct >= 0 ? '+' : '';
        if (priceEl) {
            priceEl.textContent = '¥' + data.price.toFixed(2);
            priceEl.style.color = color;
        }
        if (changeEl) {
            changeEl.textContent = sign + data.changePct.toFixed(2) + '%';
            changeEl.style.color = color;
        }
    }

    window.fetchStockPrices = function() {
        var codeList = [];
        var codeMap = {};
        document.querySelectorAll('#portfolio tbody tr[data-code]').forEach(function(row) {
            var origCode = row.getAttribute('data-code');
            var apiCode = toApiCode(origCode);
            codeList.push(apiCode);
            codeMap[apiCode] = origCode;
        });
        if (document.getElementById('stockpick-price')) {
            codeList.push('sh688621');
        }
        if (codeList.length === 0) return;

        var oldScript = document.getElementById('stock-fetch-script');
        if (oldScript) oldScript.remove();

        var script = document.createElement('script');
        script.id = 'stock-fetch-script';
        script.src = 'https://qt.gtimg.cn/q=' + codeList.join(',');

        script.onload = function() {
            Object.keys(codeMap).forEach(function(apiCode) {
                updateRow(apiCode, codeMap[apiCode]);
            });
            updateStockpick();
            var s = document.getElementById('stock-fetch-script');
            if (s) s.remove();
        };
        script.onerror = function() {
            console.warn('股价接口请求失败');
            var s = document.getElementById('stock-fetch-script');
            if (s) s.remove();
        };
        document.head.appendChild(script);
    };
})();

// --- 调研专区登录 ---
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
    if (user !== CREDENTIALS.user || pass !== CREDENTIALS.pass) {
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

// --- 底稿专区登录 ---
function checkArchiveLogin() {
    var loggedIn = sessionStorage.getItem('archive_logged_in') === 'true';
    var overlay = document.getElementById('archiveLoginOverlay');
    var content = document.getElementById('archiveContent');
    var logoutDiv = document.getElementById('archiveLogout');

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

function handleArchiveLogin() {
    var user = document.getElementById('archiveUser').value.trim();
    var pass = document.getElementById('archivePass').value.trim();
    var errEl = document.getElementById('archiveLoginError');

    if (!user || !pass) {
        errEl.textContent = '请输入账号和密码';
        return;
    }
    if (user !== CREDENTIALS.user || pass !== CREDENTIALS.pass) {
        errEl.textContent = '账号或密码错误，请重试';
        return;
    }
    sessionStorage.setItem('archive_logged_in', 'true');
    errEl.textContent = '';
    checkArchiveLogin();
}

function handleArchiveLogout() {
    sessionStorage.removeItem('archive_logged_in');
    checkArchiveLogin();
    document.getElementById('archiveUser').value = '';
    document.getElementById('archivePass').value = '';
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

    // 底稿专区登录
    checkArchiveLogin();
    document.getElementById('archiveLoginBtn').addEventListener('click', handleArchiveLogin);
    document.getElementById('archivePass').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleArchiveLogin();
    });
    document.getElementById('archiveLogoutBtn').addEventListener('click', handleArchiveLogout);

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

    // 实时股价更新：立即拉取 + 每5分钟刷新
    if (window.fetchStockPrices) {
        window.fetchStockPrices();
        setInterval(window.fetchStockPrices, 5 * 60 * 1000);
    }
});
