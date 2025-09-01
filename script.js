// ローディングアニメーションとドア演出
let loadingComplete = false;

// ページ読み込み開始時
document.addEventListener('DOMContentLoaded', function() {
    // bodyにローディングクラスを追加
    document.body.classList.add('loading');
    
    // カウントアップアニメーション開始
    startLoadingAnimation();
});

// カウントアップアニメーション
function startLoadingAnimation() {
    const counter = document.getElementById('counter');
    const loadingOverlay = document.getElementById('loading-overlay');
    const doorOverlay = document.getElementById('door-overlay');
    
    let currentCount = 0;
    const targetCount = 100;
    const duration = 3000; // 3秒
    const stepTime = duration / targetCount;
    
    const countAnimation = setInterval(() => {
        currentCount++;
        if (counter) {
            counter.textContent = currentCount;
        }
        
        if (currentCount >= targetCount) {
            clearInterval(countAnimation);
            setTimeout(() => {
                startDoorAnimation(loadingOverlay, doorOverlay);
            }, 500); // 0.5秒待ってからドア演出開始
        }
    }, stepTime);
}

// ドア演出
function startDoorAnimation(loadingOverlay, doorOverlay) {
    // ローディング画面をフェードアウト
    if (loadingOverlay) {
        loadingOverlay.classList.add('hide');
    }
    
    // ドア演出を表示
    if (doorOverlay) {
        doorOverlay.classList.add('active');
        
        setTimeout(() => {
            // ドアを開く
            doorOverlay.classList.add('opening');
            
            setTimeout(() => {
                // ドア演出を完全に隠す
                doorOverlay.style.display = 'none';
                
                // メインコンテンツを表示
                showMainContent();
            }, 1500); // ドア開くアニメーション時間
        }, 100);
    } else {
        showMainContent();
    }
}

// メインコンテンツを表示
function showMainContent() {
    document.body.classList.remove('loading');
    loadingComplete = true;
    
    // ヒーローセクションのアニメーションを開始
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.hero .fade-in');
        heroElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 200);
        });
        
        // 背景画像のアニメーションを開始
        startHeroImageAnimation();
    }, 300);
    
    // 他の初期化処理を実行
    initializeMainFeatures();
}

// ヒーロー背景画像のアニメーション制御
function startHeroImageAnimation() {
    const heroImages = document.querySelectorAll('.hero-image');
    let isAnimationRunning = true;
    
    function startFlowingAnimation() {
        if (!isAnimationRunning) return;
        
        // すべての画像を同時に流し始める（隙間なしのベルトコンベア）
        heroImages.forEach((img, index) => {
            if (isAnimationRunning) {
                img.classList.add('flowing');
            }
        });
        
        // アニメーション完了後に再スタート（40秒サイクル）
        setTimeout(() => {
            if (isAnimationRunning) {
                resetAndRestart();
            }
        }, 40000); // 40秒後に再スタート
    }
    
    function resetAndRestart() {
        if (!isAnimationRunning) return;
        
        // アニメーションをリセット
        heroImages.forEach(img => {
            img.classList.remove('flowing');
            // 強制的に再描画してリセットを確実に
            void img.offsetWidth;
        });
        
        // 少し待ってから再スタート（スムーズな繰り返し）
        setTimeout(() => {
            if (isAnimationRunning) {
                startFlowingAnimation();
            }
        }, 100);
    }
    
    // 画像読み込み完了を待ってからアニメーション開始
    let loadedImages = 0;
    const totalImages = heroImages.length;
    
    function checkAllImagesLoaded() {
        loadedImages++;
        if (loadedImages >= totalImages) {
            // 1.5秒後にアニメーション開始
            setTimeout(() => {
                if (isAnimationRunning) {
                    startFlowingAnimation();
                }
            }, 1500);
        }
    }
    
    // 各画像の読み込み状態をチェック
    heroImages.forEach((img, index) => {
        // 画像が存在しない場合のフォールバック
        if (!img.src || img.src.includes('image') && !img.complete) {
            // プレースホルダー画像を設定（オプション）
            img.style.backgroundColor = '#e5e7eb';
            img.alt = `業務イメージ${index + 1}`;
        }
        
        if (img.complete || img.naturalHeight !== 0) {
            checkAllImagesLoaded();
        } else {
            img.addEventListener('load', checkAllImagesLoaded);
            img.addEventListener('error', function() {
                console.warn(`Hero image ${index + 1} failed to load:`, this.src);
                // エラー時はグレーの背景色を設定
                this.style.backgroundColor = '#d1d5db';
                this.style.display = 'block';
                checkAllImagesLoaded();
            });
        }
    });
    
    // 画像が全て読み込めなかった場合の安全装置
    setTimeout(() => {
        if (loadedImages < totalImages) {
            console.log('一部の画像読み込みが完了していませんが、アニメーションを開始します');
            startFlowingAnimation();
        }
    }, 5000);
    
    // ページから離れる時やスクロール位置によってアニメーションを制御
    function checkVisibility() {
        const heroSection = document.querySelector('.hero');
        if (!heroSection) return;
        
        const rect = heroSection.getBoundingClientRect();
        const isVisible = rect.bottom > 100 && rect.top < window.innerHeight - 100;
        
        if (!isVisible && isAnimationRunning) {
            heroImages.forEach(img => {
                img.style.animationPlayState = 'paused';
            });
        } else if (isVisible && isAnimationRunning) {
            heroImages.forEach(img => {
                img.style.animationPlayState = 'running';
            });
        }
    }
    
    // スクロール時にアニメーションの可視性をチェック（デバウンス付き）
    window.addEventListener('scroll', debounce(checkVisibility, 300));
    
    // ページが非アクティブになったときアニメーションを制御
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            heroImages.forEach(img => {
                img.style.animationPlayState = 'paused';
            });
        } else if (loadingComplete && isAnimationRunning) {
            heroImages.forEach(img => {
                img.style.animationPlayState = 'running';
            });
        }
    });
    
    // パフォーマンス最適化: ページ離脱時にアニメーション停止
    window.addEventListener('beforeunload', function() {
        isAnimationRunning = false;
        heroImages.forEach(img => {
            img.classList.remove('flowing');
        });
    });
    
    return {
        stop: function() {
            isAnimationRunning = false;
            heroImages.forEach(img => {
                img.classList.remove('flowing');
                img.style.animationPlayState = 'paused';
            });
        },
        start: function() {
            if (!isAnimationRunning) {
                isAnimationRunning = true;
                startFlowingAnimation();
            }
        },
        pause: function() {
            heroImages.forEach(img => {
                img.style.animationPlayState = 'paused';
            });
        },
        resume: function() {
            heroImages.forEach(img => {
                img.style.animationPlayState = 'running';
            });
        },
        isRunning: function() {
            return isAnimationRunning;
        }
    };
}

// メイン機能の初期化
function initializeMainFeatures() {
    
    
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

    // スクロールアニメーションの設定（ローディング完了後に有効化）
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && loadingComplete) {
                // 少し遅延を加えてより自然なアニメーション
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, entry.target.dataset.delay || 0);
            }
        });
    }, observerOptions);

    // アニメーション対象要素を監視（ヒーロー以外）
    document.querySelectorAll('.fade-in').forEach((element, index) => {
        // ヒーローセクション以外の要素のみ監視
        if (!element.closest('.hero')) {
            const sectionElements = element.closest('section')?.querySelectorAll('.fade-in') || [element];
            const elementIndex = Array.from(sectionElements).indexOf(element);
            element.dataset.delay = elementIndex * 100;
            observer.observe(element);
        }
    });

    // ヘッダーのスクロール効果
    window.addEventListener('scroll', debounce(function() {
        if (!loadingComplete) return;
        
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

    // 統計数字のカウントアップアニメーション
    const statNumbers = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && loadingComplete) {
                animateNumber(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    });

    statNumbers.forEach(stat => {
        statObserver.observe(stat);
    });

    // プライシング表の強調効果
    const pricingPlans = document.querySelectorAll('.plan');
    pricingPlans.forEach(plan => {
        plan.addEventListener('mouseenter', function() {
            if (!loadingComplete) return;
            pricingPlans.forEach(p => {
                if (p !== this) {
                    p.style.opacity = '0.7';
                }
            });
        });

        plan.addEventListener('mouseleave', function() {
            if (!loadingComplete) return;
            pricingPlans.forEach(p => {
                p.style.opacity = '1';
            });
        });
    });

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
            const contactForm = document.querySelector('.contact-form');
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
