/**
 * Twenty-Five-Feb-One - Core Script
 * Фиксы: Видимость заголовка, 3D фон, Мобильный адаптив
 */

(function() {
    "use strict";

    // Инициализация при полной загрузке
    window.addEventListener('load', () => {
        initUI();
        initThreeJs();
        initHeroAnimations();
        initContactForm();
        initCookies();
    });

    // --- 1. ТЕКСТОВАЯ АНИМАЦИЯ И ФИКС ВИДИМОСТИ ---
    function initHeroAnimations() {
        const title = document.querySelector('.hero__title');
        const subtitle = document.querySelector('.hero__subtitle');
        const actions = document.querySelector('.reveal-btn');

        if (!title) return;

        // ПРИНУДИТЕЛЬНЫЙ ПОКАЗ (на случай сбоя CSS)
        const forceShow = () => {
            title.style.opacity = "1";
            title.style.visibility = "visible";
            title.style.display = "block";
            if (subtitle) subtitle.style.opacity = "1";
            if (actions) actions.style.opacity = "1";
        };

        if (typeof SplitType !== 'undefined' && typeof gsap !== 'undefined') {
            try {
                // Очищаем заголовок от возможных артефактов и разбиваем
                const split = new SplitType(title, { types: 'chars, words' });
                
                const tl = gsap.timeline({ 
                    onStart: forceShow // Показываем перед началом
                });

                tl.from(split.chars, {
                    opacity: 0,
                    y: 40,
                    rotateX: -45,
                    stagger: 0.02,
                    duration: 1,
                    ease: "back.out(1.7)"
                })
                .from(subtitle, {
                    opacity: 0,
                    y: 20,
                    duration: 0.7
                }, "-=0.6")
                .from(actions, {
                    opacity: 0,
                    y: 20,
                    duration: 0.6
                }, "-=0.4");

            } catch (err) {
                console.error("Animation Error:", err);
                forceShow();
            }
        } else {
            forceShow();
        }
    }

    // --- 2. THREE.JS (ИНТЕРАКТИВНЫЙ ФОН) ---
    function initThreeJs() {
        const container = document.getElementById('hero-canvas');
        if (!container || typeof THREE === 'undefined' || window.innerWidth < 768) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Создаем нейронную сеть (точки)
        const geometry = new THREE.BufferGeometry();
        const count = 250;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 15;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({ 
            color: 0x38BDF8, 
            size: 0.07, 
            transparent: true,
            opacity: 0.8
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        camera.position.z = 7;

        // Анимация вращения
        function animate() {
            requestAnimationFrame(animate);
            points.rotation.y += 0.001;
            points.rotation.x += 0.0005;
            renderer.render(scene, camera);
        }
        animate();

        // Ресайз
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // --- 3. ИНТЕРФЕЙС (МЕНЮ, FAQ, ЛОГИКА) ---
    function initUI() {
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Хедер при скролле
        const header = document.querySelector('#header');
        window.addEventListener('scroll', () => {
            header.classList.toggle('header--scrolled', window.scrollY > 50);
        });

        // Мобильное меню
        const burger = document.querySelector('#burger-menu');
        const nav = document.querySelector('#header-nav');
        if (burger) {
            burger.addEventListener('click', () => {
                nav.classList.toggle('header__nav--active');
                burger.querySelectorAll('span').forEach(s => s.classList.toggle('active'));
                document.body.style.overflow = nav.classList.contains('header__nav--active') ? 'hidden' : '';
            });
        }

        // Закрытие меню при клике на ссылки
        document.querySelectorAll('.header__link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('header__nav--active');
                if (burger) burger.querySelectorAll('span').forEach(s => s.classList.remove('active'));
                document.body.style.overflow = '';
            });
        });

        // Аккордеон FAQ
        document.querySelectorAll('.faq__trigger').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const item = trigger.parentElement;
                const wasActive = item.classList.contains('faq__item--active');
                document.querySelectorAll('.faq__item').forEach(i => i.classList.remove('faq__item--active'));
                if (!wasActive) item.classList.add('faq__item--active');
            });
        });
    }

    // --- 4. КОНТАКТНАЯ ФОРМА ---
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const captchaLabel = document.getElementById('captcha-label');
        let correctAnswer;

        const refreshCaptcha = () => {
            const n1 = Math.floor(Math.random() * 10) + 1;
            const n2 = Math.floor(Math.random() * 10) + 1;
            correctAnswer = n1 + n2;
            if (captchaLabel) captchaLabel.textContent = `${n1} + ${n2} =`;
        };

        refreshCaptcha();

        // Валидация телефона
        const phoneInput = document.getElementById('phone-input');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const userAns = document.getElementById('captcha-input').value;
                const msg = document.getElementById('form-message');

                if (parseInt(userAns) !== correctAnswer) {
                    msg.textContent = 'Неверный ответ капчи!';
                    msg.className = 'form__message error';
                    refreshCaptcha();
                    return;
                }

                const btn = form.querySelector('.form__btn');
                btn.disabled = true;
                btn.textContent = 'Отправка...';

                setTimeout(() => {
                    msg.textContent = 'Заявка успешно отправлена!';
                    msg.className = 'form__message success';
                    form.reset();
                    btn.disabled = false;
                    btn.textContent = 'Начать сейчас';
                    refreshCaptcha();
                }, 1500);
            });
        }
    }

    // --- 5. COOKIES ---
    function initCookies() {
        const popup = document.getElementById('cookie-popup');
        const btn = document.getElementById('cookie-accept');
        
        if (!localStorage.getItem('cookies_accepted') && popup) {
            setTimeout(() => {
                popup.classList.add('cookie-popup--active');
            }, 2000);
        }

        if (btn) {
            btn.addEventListener('click', () => {
                localStorage.setItem('cookies_accepted', 'true');
                popup.classList.remove('cookie-popup--active');
            });
        }
    }

})();