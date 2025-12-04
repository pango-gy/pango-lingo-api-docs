/**
 * 팡고링고 API 문서 JavaScript
 */

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 구문 하이라이팅 초기화
    initSyntaxHighlighting();
    
    // 네비게이션 하이라이팅 초기화
    initNavigationHighlighting();
    
    // 모바일 사이드바 링크 클릭 시 닫기
    initMobileSidebarClose();
});

/**
 * 구문 하이라이팅 초기화
 */
function initSyntaxHighlighting() {
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
}

/**
 * 모바일 사이드바 토글
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

/**
 * 코드 복사 기능
 * @param {HTMLElement} button - 클릭된 복사 버튼
 */
function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    if (!codeBlock) return;
    
    const code = codeBlock.querySelector('code');
    if (!code) return;
    
    const textToCopy = code.textContent;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // 성공 상태 표시
        const originalText = button.innerHTML;
        button.innerHTML = '<span>✓</span> 복사됨';
        button.classList.add('copied');
        
        // 2초 후 원래 상태로 복원
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('복사 실패:', err);
        
        // 폴백: execCommand 사용
        fallbackCopyTextToClipboard(textToCopy, button);
    });
}

/**
 * 클립보드 복사 폴백 (구형 브라우저용)
 * @param {string} text - 복사할 텍스트
 * @param {HTMLElement} button - 복사 버튼
 */
function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        const originalText = button.innerHTML;
        button.innerHTML = '<span>✓</span> 복사됨';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('폴백 복사 실패:', err);
    }

    document.body.removeChild(textArea);
}

/**
 * 스크롤 위치에 따른 네비게이션 하이라이팅
 */
function initNavigationHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    if (sections.length === 0 || navLinks.length === 0) return;

    function updateActiveLink() {
        let current = '';
        const scrollY = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // 스크롤 이벤트에 쓰로틀링 적용
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    });

    // 초기 실행
    updateActiveLink();
}

/**
 * 모바일에서 사이드바 링크 클릭 시 사이드바 닫기
 */
function initMobileSidebarClose() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sidebar = document.getElementById('sidebar');
    
    if (!sidebar) return;

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
            }
        });
    });
}

/**
 * 부드러운 스크롤 (구형 브라우저 폴백)
 * @param {string} targetId - 대상 요소 ID
 */
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    // CSS scroll-behavior가 지원되지 않는 경우
    if (!('scrollBehavior' in document.documentElement.style)) {
        const targetPosition = target.offsetTop - 88; // header-height + 24px
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

