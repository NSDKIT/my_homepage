// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    
    // ハンバーガーメニューの動作
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // ナビゲーションリンクをクリックしたときにメニューを閉じる
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (navLinks) {
                navLinks.classList.remove('active');
            }
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        });
    });

    // スムーススクロール（すべてのアンカーリンクに適用）
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // スクロールアニメーションの設定
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 少し遅延を加えてより自然なアニメーション
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, entry.target.dataset.delay || 0);
            }
        });
    }, observerOptions);

    // アニメーション対象要素を監視（遅延時間を設定）
    document.querySelectorAll('.fade-in').forEach((element, index) => {
        // 同一セクション内の要素には連続した遅延を適用
        const sectionElements = element.closest('section').querySelectorAll('.fade-in');
        const elementIndex = Array.from(sectionElements).indexOf(element);
        element.dataset.delay = elementIndex * 100;
        observer.observe(element);
    });

    // ヘッダーのスクロール効果
    window.addEventListener('scroll', debounce(function() {
        const header = document.querySelector('header');
        const scrollY = window.scrollY;
        
        if (header) {
            if (scrollY > 100) {
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.backgroundColor = '#ffffff';
                header.style.backdropFilter = 'none';
            }
        }
    }, 10));

    // お問い合わせフォームの処理
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // フォームデータの取得
            const formData = new FormData(this);
            const name = formData.get('name')?.trim() || '';
            const email = formData.get('email')?.trim() || '';
            const company = formData.get('company')?.trim() || '';
            const message = formData.get('message')?.trim() || '';

            // バリデーション
            if (!validateForm(name, email, message)) {
                return;
            }

            // 送信処理
            handleFormSubmission(name, email, company, message);
        });
    }

    // フォームバリデーション関数
    function validateForm(name, email, message) {
        // 必須項目チェック
        if (!name) {
            showAlert('お名前を入力してください。', 'error');
            focusField('name');
            return false;
        }

        if (name.length > 50) {
            showAlert('お名前は50文字以内で入力してください。', 'error');
            focusField('name');
            return false;
        }

        if (!email) {
            showAlert('メールアドレスを入力してください。', 'error');
            focusField('email');
            return false;
        }

        // メールアドレスの形式チェック
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert('正しいメールアドレス形式で入力してください。', 'error');
            focusField('email');
            return false;
        }

        if (!message) {
            showAlert('メッセージを入力してください。', 'error');
            focusField('message');
            return false;
        }

        if (message.length > 1000) {
            showAlert('メッセージは1000文字以内で入力してください。', 'error');
            focusField('message');
            return false;
        }

        return true;
    }

    // フィールドにフォーカスを当てる
    function focusField(fieldName) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.focus();
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // フォーム送信処理
    function handleFormSubmission(name, email, company, message) {
        const submitBtn = document.querySelector('.submit-btn');
        const originalText = submitBtn?.textContent || '送信する';
        
        // ローディング状態を表示
        if (submitBtn) {
            submitBtn.textContent = '送信中...';
            submitBtn.disabled = true;
            submitBtn.style.cursor = 'not-allowed';
        }

        // 実際のAPI送信処理はここに実装
        // 現在はダミーの処理（実際の送信処理に置き換える）
        simulateFormSubmission()
            .then(() => {
                // 成功メッセージを表示
                showSuccessMessage(
                    'お問い合わせを送信しました。\n' +
                    'ご連絡いただき、ありがとうございます。\n' +
                    '担当者から3営業日以内にご連絡いたします。'
                );
                
                // フォームをリセット
                if (contactForm) {
                    contactForm.reset();
                }
            })
            .catch((error) => {
                // エラーメッセージを表示
                showAlert(
                    '送信に失敗しました。\n' +
                    'インターネット接続を確認の上、再度お試しください。\n' +
                    '問題が続く場合は、お電話でご連絡ください。',
                    'error'
                );
                console.error('Form submission error:', error);
            })
            .finally(() => {
                // ボタンを元に戻す
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.cursor = 'pointer';
                }
            });
    }

    // フォーム送信のシミュレーション（実際のAPIに置き換える）
    function simulateFormSubmission() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 90%の確率で成功
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }

    // アラートメッセージ表示（改良版）
    function showAlert(message, type = 'info') {
        // カスタムアラートを実装する場合はここを置き換え
        alert(message);
    }

    // 成功メッセージ表示
    function showSuccessMessage(message) {
        alert(message);
        
        // 成功後はトップに戻る
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 外部クリックでモバイルメニューを閉じる
    document.addEventListener('click', function(e) {
        if (hamburger && navLinks && 
            !hamburger.contains(e.target) && 
            !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', debounce(function() {
        if (window.innerWidth > 768) {
            if (navLinks) navLinks.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        }
    }, 100));

    // ページ読み込み時にヒーローセクションのアニメーションを即座に開始
    const heroElements = document.querySelectorAll('.hero .fade-in');
    heroElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('visible');
        }, index * 200 + 500); // 0.5秒後から開始
    });

    // 統計数字のカウントアップアニメーション
    const statNumbers = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    });

    statNumbers.forEach(stat => {
        statObserver.observe(stat);
    });

    // 数字アニメーション関数
    function animateNumber(element) {
        const text = element.textContent;
        const number = parseInt(text.replace(/[^\d]/g, ''));
        const suffix = text.replace(/[\d]/g, '');
        
        if (isNaN(number)) return;

        let current = 0;
        const increment = number / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                element.textContent = number + suffix;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
        }, 30);
    }

    // プライシング表の強調効果
    const pricingPlans = document.querySelectorAll('.plan');
    pricingPlans.forEach(plan => {
        plan.addEventListener('mouseenter', function() {
            pricingPlans.forEach(p => {
                if (p !== this) {
                    p.style.opacity = '0.7';
                }
            });
        });

        plan.addEventListener('mouseleave', function() {
            pricingPlans.forEach(p => {
                p.style.opacity = '1';
            });
        });
    });
});

// ユーティリティ関数

// デバウンス関数（パフォーマンス向上のため）
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// スムーズスクロール関数（ユーティリティ）
function smoothScrollTo(targetId, offset = 100) {
    const target = document.querySelector(targetId);
    if (target) {
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// 現在のセクションを検出（アクティブナビゲーション用）
function getCurrentSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    for (let section of sections) {
        if (scrollPosition >= section.offsetTop && 
            scrollPosition < section.offsetTop + section.offsetHeight) {
            return section.id;
        }
    }
    return null;
}

// ナビゲーションのアクティブ状態を更新
function updateActiveNavigation() {
    const currentSection = getCurrentSection();
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// スクロール時にナビゲーションを更新
window.addEventListener('scroll', debounce(updateActiveNavigation, 100));

// ページ表示パフォーマンスの最適化
if ('IntersectionObserver' in window) {
    // Intersection Observer API が利用可能な場合
    console.log('Intersection Observer API is supported');
} else {
    // フォールバック処理
    console.log('Intersection Observer API is not supported');
    document.querySelectorAll('.fade-in').forEach(element => {
        element.classList.add('visible');
    });
}
