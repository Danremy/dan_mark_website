// 网站管理器 - 重构版本
class WebsiteManager {
    constructor() {
        this.websites = JSON.parse(localStorage.getItem('websites') || '[]');
        this.initElements();
        this.bindEvents();
        this.render();
        this.createGlowEffect();
    }

    initElements() {
        this.urlInput = document.getElementById('url-input');
        this.tagInput = document.getElementById('tag-input');
        this.searchInput = document.getElementById('search-input');
        this.saveBtn = document.getElementById('save-btn');
        this.saveTabBtn = document.getElementById('save-tab-btn');
        this.clearAllBtn = document.getElementById('clear-all-btn');
        this.container = document.getElementById('websites-container');
        this.noItems = document.getElementById('no-items');
    }

    bindEvents() {
        this.saveBtn.addEventListener('click', () => this.saveWebsite());
        this.saveTabBtn.addEventListener('click', () => this.saveCurrentTab());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.searchInput.addEventListener('input', (e) => this.search(e.target.value));
        
        // 快捷键 Ctrl+Shift+S
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.saveCurrentTab();
            }
        });
    }

    saveWebsite(url = null, tags = []) {
        const websiteUrl = url || this.urlInput.value.trim();
        const websiteTags = tags.length ? tags : this.tagInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        if (!websiteUrl) {
            this.showToast('请输入网址！', 'error');
            return;
        }

        // 检查是否已存在
        if (this.websites.some(site => site.url === websiteUrl)) {
            this.showToast('该网址已存在！', 'warning');
            return;
        }

        const website = {
            id: Date.now(),
            url: websiteUrl,
            tags: websiteTags,
            title: this.extractTitle(websiteUrl),
            timestamp: new Date().toISOString()
        };

        this.websites.push(website);
        this.saveToStorage();
        this.render();
        this.showToast('保存成功！', 'success');
        
        // 清空输入
        this.urlInput.value = '';
        this.tagInput.value = '';
    }

    async saveCurrentTab() {
        try {
            // 模拟获取当前标签页URL
            const currentUrl = prompt('请输入当前网址：') || 'https://example.com';
            if (currentUrl) {
                this.saveWebsite(currentUrl);
            }
        } catch (error) {
            this.showToast('无法获取当前标签页', 'error');
        }
    }

    deleteWebsite(id) {
        const index = this.websites.findIndex(site => site.id === id);
        if (index !== -1) {
            const element = document.querySelector(`[data-id="${id}"]`);
            this.shatterEffect(element, () => {
                this.websites.splice(index, 1);
                this.saveToStorage();
                this.render();
                this.showToast('删除成功！', 'success');
            });
        }
    }

    clearAll() {
        if (this.websites.length === 0) return;
        
        const elements = document.querySelectorAll('.website-item');
        let completed = 0;
        
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.shatterEffect(element, () => {
                    completed++;
                    if (completed === elements.length) {
                        this.websites = [];
                        this.saveToStorage();
                        this.render();
                        this.showToast('全部清空！', 'success');
                    }
                });
            }, index * 100);
        });
    }

    search(query) {
        const filtered = this.websites.filter(site => 
            site.url.toLowerCase().includes(query.toLowerCase()) ||
            site.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        this.renderWebsites(filtered);
    }

    render() {
        this.renderWebsites(this.websites);
    }

    renderWebsites(websites) {
        if (websites.length === 0) {
            this.container.innerHTML = '<div id="no-items" class="no-items"><p>还没有收藏任何网站</p><p>速速添加你喜欢的网站吧！</p></div>';
            return;
        }

        const html = websites.map(site => `
            <div class="website-item" data-id="${site.id}">
                <div class="website-header">
                    <a href="${site.url}" target="_blank" class="website-url">${site.title || site.url}</a>
                    <button class="delete-btn" onclick="websiteManager.deleteWebsite(${site.id})">🗑️</button>
                </div>
                <div class="website-tags">
                    ${site.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');

        this.container.innerHTML = html;
    }

    extractTitle(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    }

    saveToStorage() {
        localStorage.setItem('websites', JSON.stringify(this.websites));
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // 添加样式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            background: type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' :
                       type === 'error' ? 'linear-gradient(135deg, #f44336, #da190b)' :
                       'linear-gradient(135deg, #ff9800, #f57c00)'
        });

        document.body.appendChild(toast);
        
        // 动画显示
        setTimeout(() => toast.style.transform = 'translateX(0)', 10);
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 2000);
    }

    shatterEffect(element, callback) {
        const rect = element.getBoundingClientRect();
        const particles = 12;
        
        // 创建碎片
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: linear-gradient(135deg, #ff699b, #ffc2ff);
                left: ${rect.left + rect.width/2}px;
                top: ${rect.top + rect.height/2}px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
            `;
            
            document.body.appendChild(particle);
            
            // 动画
            const angle = (i / particles) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
        
        element.style.opacity = '0';
        setTimeout(callback, 300);
    }

    createGlowEffect() {
        const glow = document.createElement('div');
        glow.className = 'glow-effect';
        glow.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
                rgba(255, 105, 155, 0.1) 0%, 
                transparent 50%);
            transition: background 0.3s ease;
        `;
        
        document.body.appendChild(glow);
        
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            glow.style.setProperty('--mouse-x', x + '%');
            glow.style.setProperty('--mouse-y', y + '%');
        });
    }
}

// 初始化
const websiteManager = new WebsiteManager();