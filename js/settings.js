// Clarity — goclarity.co.za — Settings Page JS
// Handles settings UI interactions, localStorage persistence,
// publish button logic, and backup test button.

document.addEventListener('DOMContentLoaded', () => {

    // ---- Load settings from localStorage (or defaults) ----
    let settings = loadSettings();

    // ---- Wire up inputs to settings ----
    bindSetting('publishTarget', val => {
        const isLocal = val === 'local';
        const githubRepo = document.getElementById('githubRepo');
        const ftpHost = document.getElementById('ftpHost');
        const ftpUser = document.getElementById('ftpUser');
        const ftpPass = document.getElementById('ftpPass');
        const ftpPath = document.getElementById('ftpPath');
        const btnPublish = document.getElementById('btnPublish');

        githubRepo.disabled = isLocal;
        ftpHost.disabled = isLocal;
        ftpUser.disabled = isLocal;
        ftpPass.disabled = isLocal;
        ftpPath.disabled = isLocal;
        btnPublish.disabled = isLocal;

        if (!isLocal) {
            btnPublish.disabled = false;
        }
    });

    bindSetting('githubRepo');
    bindSetting('ftpHost');
    bindSetting('ftpUser');
    bindSetting('ftpPass');
    bindSetting('ftpPath');
    bindSetting('mainDomain');
    bindSetting('logoText');
    bindSetting('logoSub');
    bindSetting('contactEmail');
    bindSetting('twitterHandle');
    bindSetting('location');
    bindSetting('discoveryDuration');
    bindSetting('caldiyUrl');
    bindSetting('payfastMerchantId');
    bindSetting('payfastSecret');
    bindSetting('ninjaUrl');
    bindSetting('zoomAccount');
    bindSetting('gdriveEmail');
    bindSetting('gdriveToken');
    bindSetting('aiBackend');
    bindSetting('backupPath');
    bindSetting('backupRetentionLocal');
    bindSetting('backupRetentionGdrive');
    bindSetting('backupPassphrase');
    bindSetting('brandColor1', val => val, 'color');
    bindSetting('brandColor2', val => val, 'color');

    // ---- Publish button ----
    document.getElementById('btnPublish').addEventListener('click', async () => {
        const target = settings.publishTarget;
        const status = document.getElementById('publishStatus');

        if (target === 'local') {
            status.textContent = 'Already local. No action needed.';
            return;
        }

        status.textContent = 'Publishing...';
        const btn = document.getElementById('btnPublish');
        btn.disabled = true;

        try {
            let result;

            if (target === 'github') {
                const repo = settings.githubRepo || 'your-username/goclarity.co.za';
                result = `GitHub Pages: Would publish the website to https://${repo}.github.io (or a custom domain). This requires a GitHub repo with the website files pushed to the gh-pages branch or /docs folder. Ready when you are.`;
            } else if (target === 'godaddy') {
                const host = settings.ftpHost || 'your-ftp-host';
                const path = settings.ftpPath || '/public_html';
                result = `GoDaddy: Would FTP the website to ${host}${path}. Requires valid FTP credentials. The website files are ready to upload now.`;
            }

            status.textContent = '✓ ' + result;
            console.log('[Clarity Settings] Publish target:', target, 'Config:', settings);
        } catch (err) {
            status.textContent = '✗ Publish failed. Check console.';
            console.error('[Clarity Settings] Publish error:', err);
        } finally {
            btn.disabled = false;
        }
    });

    // ---- Backup test button ----
    document.getElementById('btnTestBackup').addEventListener('click', () => {
        const status = document.getElementById('backupTestStatus');
        const path = settings.backupPath || '/data/backups';
        const retentionLocal = settings.backupRetentionLocal || 30;
        const retentionGdrive = settings.backupRetentionGdrive || 365;
        const passphrase = settings.backupPassphrase || '(not set)';

        status.textContent = 'Testing backup configuration...';

        setTimeout(() => {
            const issues = [];

            if (!path || path === '/data/backups') {
                // Default is fine
            } else if (!path.startsWith('/')) {
                issues.push('Local backup path should be an absolute path (start with /)');
            }

            if (retentionLocal < 1) issues.push('Local retention must be at least 1 day');
            if (retentionGdrive < 1) issues.push('Google Drive retention must be at least 1 day');

            if (passphrase === '' || passphrase === '(not set)') {
                issues.push('Backup encryption passphrase is not set. Backups will not be encrypted until you set one.');
            }

            if (issues.length === 0) {
                status.textContent = `✓ Backup configuration looks good. Local: ${path} (retention: ${retentionLocal} days). Google Drive: retention ${retentionGdrive} days. Passphrase: set.`;
            } else {
                status.textContent = '✗ Issues found: ' + issues.join('; ');
            }

            console.log('[Clarity Settings] Backup test:', { path, retentionLocal, retentionGdrive, passphraseSet: !!passphrase });
        }, 300);
    });

    // ---- Save settings on input change (debounced) ----
    const saveTimeout = { id: null };
    function debounceSave() {
        if (saveTimeout.id) clearTimeout(saveTimeout.id);
        saveTimeout.id = setTimeout(() => {
            saveSettings(settings);
            console.log('[Clarity Settings] Settings saved to localStorage.');
        }, 500);
    }

    document.querySelectorAll('.setting-input, .setting-select, .setting-color').forEach(el => {
        el.addEventListener('input', () => {
            const key = el.id;
            if (key && key in settings) {
                settings[key] = el.type === 'checkbox' ? el.checked : el.value;
                debounceSave();
            }
        });
        el.addEventListener('change', () => {
            const key = el.id;
            if (key && key in settings) {
                settings[key] = el.type === 'checkbox' ? el.checked : el.value;
                debounceSave();
            }
        });
    });

    // ---- Helpers ----
    function bindSetting(key, transform = val => val, type = 'text') {
        const el = document.getElementById(key);
        if (!el) return;
        if (settings[key] !== undefined && el.type !== 'color') {
            el.value = settings[key];
        }
        if (settings[key] !== undefined && el.type === 'color') {
            el.value = settings[key];
        }
    }

    function loadSettings() {
        const defaults = {
            publishTarget: 'local',
            githubRepo: '',
            ftpHost: '',
            ftpUser: '',
            ftpPass: '',
            ftpPath: '',
            mainDomain: 'goclarity.co.za',
            logoText: 'CLARITY',
            logoSub: 'TRAINING · AI · IT',
            contactEmail: 'hello@goclarity.co.za',
            twitterHandle: '@SATechExplored',
            location: 'South Africa',
            discoveryDuration: 15,
            caldiyUrl: '',
            payfastMerchantId: '',
            payfastSecret: '',
            ninjaUrl: '',
            zoomAccount: '',
            gdriveEmail: '',
            gdriveToken: '',
            aiBackend: 't1',
            backupPath: '/data/backups',
            backupRetentionLocal: 30,
            backupRetentionGdrive: 365,
            backupPassphrase: '',
            brandColor1: '#6dd5ed',
            brandColor2: '#a78bfa'
        };

        try {
            const stored = localStorage.getItem('clarity-settings');
            if (stored) {
                const data = JSON.parse(stored);
                return Object.assign(defaults, data);
            }
        } catch (e) {
            console.warn('[Clarity Settings] Could not read localStorage:', e);
        }

        return defaults;
    }

    function saveSettings(data) {
        try {
            localStorage.setItem('clarity-settings', JSON.stringify(data));
            console.log('[Clarity Settings] Saved to localStorage.');
        } catch (e) {
            console.error('[Clarity Settings] localStorage save failed:', e);
        }
    }
});
