/**
 * Bank Sphere — Client-side Application Controller
 * Directly communicates with the C++ BST & AuthTable backend via REST bridge
 */

(function () {
  'use strict';

  // --- APPLICATION STATE ---
  const state = {
    role: 'customer', // 'customer' | 'staff' | 'admin'
    currentUser: null, // { accountNumber, name, address, balance, accountType, isActive }
    transactions: [],
    allAccounts: [],
    analytics: null
  };

  // --- DOM CACHE ---
  const elements = {
    // Auth & Wrappers
    authView: document.getElementById('auth-view'),
    appWrapper: document.getElementById('app-wrapper'),
    roleSelector: document.getElementById('role-selector'),
    customerLoginForm: document.getElementById('customer-login-form'),
    staffAdminForm: document.getElementById('staff-admin-form'),
    authError: document.getElementById('auth-error'),
    authErrorText: document.getElementById('auth-error-text'),
    loginAccountInput: document.getElementById('login-account-number'),
    loginPasswordInput: document.getElementById('login-password'),
    togglePwdBtn: document.getElementById('toggle-pwd-btn'),
    portalTitle: document.getElementById('portal-title'),
    portalDesc: document.getElementById('portal-desc'),
    portalBtnText: document.getElementById('portal-btn-text'),
    portalDirectBtn: document.getElementById('portal-direct-btn'),
    demoChipsContainer: document.getElementById('demo-chips'),

    // Top Header & Sidebar
    pageTitle: document.getElementById('page-title'),
    pageSubtitle: document.getElementById('page-subtitle'),
    headerBalance: document.getElementById('header-balance'),
    headerBalanceChip: document.getElementById('header-balance-chip'),
    sessionRoleBadge: document.getElementById('session-role-badge'),
    navAvatar: document.getElementById('nav-avatar'),
    navUserName: document.getElementById('nav-user-name'),
    navUserId: document.getElementById('nav-user-id'),
    logoutBtn: document.getElementById('logout-btn'),
    customerNav: document.getElementById('customer-nav'),
    staffNav: document.getElementById('staff-nav'),
    adminNav: document.getElementById('admin-nav'),

    // Toast & Confirm Modal
    toastContainer: document.getElementById('toast-container'),
    confirmModal: document.getElementById('confirm-modal'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
    confirmAcceptBtn: document.getElementById('confirm-accept-btn'),

    // Dashboard
    dashBalance: document.getElementById('dash-balance'),
    dashAccountTypePill: document.getElementById('dash-account-type-pill'),
    dashAccountNum: document.getElementById('dash-account-num'),
    dashStatusTag: document.getElementById('dash-status-tag'),
    dashMinBal: document.getElementById('dash-min-bal'),
    dashTxTableBody: document.getElementById('dash-tx-table-body'),

    // Account Details Page
    detailsStatusBadge: document.getElementById('details-status-badge'),
    detName: document.getElementById('det-name'),
    detAccountNum: document.getElementById('det-account-num'),
    detType: document.getElementById('det-type'),
    detBalance: document.getElementById('det-balance'),
    detAddress: document.getElementById('det-address'),
    detMinBalance: document.getElementById('det-min-balance'),

    // Deposit Page
    depositCurrentBal: document.getElementById('deposit-current-bal'),
    depositAmount: document.getElementById('deposit-amount'),
    depositPreviewBal: document.getElementById('deposit-preview-bal'),
    depositForm: document.getElementById('deposit-form'),

    // Withdraw Page
    withdrawCurrentBal: document.getElementById('withdraw-current-bal'),
    withdrawAmount: document.getElementById('withdraw-amount'),
    withdrawPreviewBal: document.getElementById('withdraw-preview-bal'),
    withdrawMinReq: document.getElementById('withdraw-min-req'),
    withdrawForm: document.getElementById('withdraw-form'),

    // Transfer Page
    transferCurrentBal: document.getElementById('transfer-current-bal'),
    transferRecipient: document.getElementById('transfer-recipient'),
    transferAmount: document.getElementById('transfer-amount'),
    transferPreviewBal: document.getElementById('transfer-preview-bal'),
    transferForm: document.getElementById('transfer-form'),

    // History Page
    historyTableBody: document.getElementById('history-table-body'),
    txSearchInput: document.getElementById('tx-search-input'),
    txFilterType: document.getElementById('tx-filter-type'),

    // Staff Desk
    staffDepositForm: document.getElementById('staff-deposit-form'),
    staffWithdrawForm: document.getElementById('staff-withdraw-form'),
    staffTransferForm: document.getElementById('staff-transfer-form'),
    staffLookupAcc: document.getElementById('staff-lookup-acc'),
    staffLookupBtn: document.getElementById('staff-lookup-btn'),
    staffLookupResult: document.getElementById('staff-lookup-result'),
    allAccountsTableBody: document.getElementById('all-accounts-table-body'),
    allAccSearch: document.getElementById('all-acc-search'),

    // Admin Page
    adminTotalAccounts: document.getElementById('admin-total-accounts'),
    adminTotalBalance: document.getElementById('admin-total-balance'),
    adminAvgBalance: document.getElementById('admin-avg-balance'),
    adminAccountsTableBody: document.getElementById('admin-accounts-table-body'),
    adminManageSearch: document.getElementById('admin-manage-search'),
    adminCreateForm: document.getElementById('admin-create-form')
  };

  // --- UTILITY FUNCTIONS ---

  function formatCurrency(val) {
    const num = Number(val) || 0;
    return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getInitials(name) {
    if (!name) return 'BS';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-msg">${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  }

  // Modal Confirmation Dialog
  let confirmCallback = null;
  function showConfirm(title, message, onAccept) {
    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    confirmCallback = onAccept;
    elements.confirmModal.classList.remove('hidden');
  }

  elements.confirmCancelBtn.addEventListener('click', () => {
    elements.confirmModal.classList.add('hidden');
    confirmCallback = null;
  });

  elements.confirmAcceptBtn.addEventListener('click', () => {
    elements.confirmModal.classList.add('hidden');
    if (typeof confirmCallback === 'function') {
      confirmCallback();
    }
    confirmCallback = null;
  });

  // --- API CALL HELPERS ---

  async function apiPost(endpoint, data) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('API Post error:', err);
      return { success: false, error: 'Network communication failure' };
    }
  }

  async function apiGet(endpoint) {
    try {
      const res = await fetch(endpoint);
      return await res.json();
    } catch (err) {
      console.error('API Get error:', err);
      return { success: false, error: 'Network communication failure' };
    }
  }

  async function apiDelete(endpoint) {
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      console.error('API Delete error:', err);
      return { success: false, error: 'Network communication failure' };
    }
  }

  // --- AUTHENTICATION & ROLE SWITCHING ---

  elements.roleSelector.addEventListener('click', (e) => {
    const tab = e.target.closest('.role-tab');
    if (!tab) return;

    document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const role = tab.getAttribute('data-role');
    state.role = role;
    elements.authError.classList.add('hidden');

    if (role === 'customer') {
      elements.customerLoginForm.classList.remove('hidden');
      elements.staffAdminForm.classList.add('hidden');
    } else if (role === 'staff') {
      elements.customerLoginForm.classList.add('hidden');
      elements.staffAdminForm.classList.remove('hidden');
      elements.portalTitle.textContent = 'Authorized Staff Terminal';
      elements.portalDesc.textContent = 'Access teller operations, fund management, and transaction overrides powered by the native C++ BST module.';
      elements.portalBtnText.textContent = 'Enter Staff Terminal';
    } else if (role === 'admin') {
      elements.customerLoginForm.classList.add('hidden');
      elements.staffAdminForm.classList.remove('hidden');
      elements.portalTitle.textContent = 'Bank Sphere Executive Portal';
      elements.portalDesc.textContent = 'Access bank-wide analytics, customer lifecycle management, and BST account ledger oversight.';
      elements.portalBtnText.textContent = 'Launch Admin Console';
    }
  });

  // Password visibility toggle
  elements.togglePwdBtn.addEventListener('click', () => {
    const isPassword = elements.loginPasswordInput.type === 'password';
    elements.loginPasswordInput.type = isPassword ? 'text' : 'password';
  });

  // Demo Chips Auto-fill
  elements.demoChipsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.demo-chip');
    if (!chip) return;

    const acc = chip.getAttribute('data-acc');
    const pwd = chip.getAttribute('data-pwd');

    // Switch to customer tab
    document.getElementById('role-tab-customer').click();
    elements.loginAccountInput.value = acc;
    elements.loginPasswordInput.value = pwd;

    showToast(`Loaded demo credentials for Account #${acc}`, 'info');
  });

  // Customer Login Submission
  elements.customerLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    elements.authError.classList.add('hidden');

    const accNum = elements.loginAccountInput.value.trim();
    const pwd = elements.loginPasswordInput.value.trim();

    if (!accNum || !pwd) {
      elements.authErrorText.textContent = 'Please enter both Account Number and Password.';
      elements.authError.classList.remove('hidden');
      return;
    }

    const submitBtn = document.getElementById('login-submit-btn');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    const result = await apiPost('/api/login', { accountNumber: accNum, password: pwd });

    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';

    if (result.success && result.account) {
      state.role = 'customer';
      state.currentUser = result.account;
      enterApplication();
      showToast(`Welcome back, ${result.account.name}!`, 'success');
    } else {
      elements.authErrorText.textContent = result.error || 'Invalid account number or password.';
      elements.authError.classList.remove('hidden');
    }
  });

  // Staff / Admin Direct Entry
  elements.portalDirectBtn.addEventListener('click', () => {
    if (state.role === 'staff') {
      state.currentUser = {
        name: 'Staff Officer',
        accountNumber: 'STAFF-DESK',
        accountType: 'Authorized Teller',
        balance: 0,
        address: 'Bank Sphere Central Branch',
        isActive: true
      };
      enterApplication();
      showToast('Entered Staff Operations Desk', 'success');
    } else if (state.role === 'admin') {
      state.currentUser = {
        name: 'System Administrator',
        accountNumber: 'ADMIN-ROOT',
        accountType: 'Superuser',
        balance: 0,
        address: 'Bank Sphere Headquarters',
        isActive: true
      };
      enterApplication();
      showToast('Admin Console Initialized', 'success');
    }
  });

  // Logout
  elements.logoutBtn.addEventListener('click', () => {
    state.currentUser = null;
    state.role = 'customer';
    elements.appWrapper.classList.add('hidden');
    elements.authView.classList.remove('hidden');
    elements.customerLoginForm.reset();
    document.getElementById('role-tab-customer').click();
    showToast('Signed out successfully', 'info');
  });

  // Enter Application & Render Dashboard for Selected Role
  function enterApplication() {
    elements.authView.classList.add('hidden');
    elements.appWrapper.classList.remove('hidden');

    // Update user profile badges
    elements.sessionRoleBadge.textContent = state.role;
    elements.navUserName.textContent = state.currentUser.name || 'Account Holder';
    elements.navUserId.textContent = typeof state.currentUser.accountNumber === 'number' 
      ? `Account #${state.currentUser.accountNumber}`
      : state.currentUser.accountNumber;
    elements.navAvatar.textContent = getInitials(state.currentUser.name);

    // Hide all nav groups, then show appropriate one
    elements.customerNav.classList.add('hidden');
    elements.staffNav.classList.add('hidden');
    elements.adminNav.classList.add('hidden');

    if (state.role === 'customer') {
      elements.customerNav.classList.remove('hidden');
      elements.headerBalanceChip.style.display = 'flex';
      navigateToPage('page-dashboard');
      refreshCustomerData();
    } else if (state.role === 'staff') {
      elements.staffNav.classList.remove('hidden');
      elements.headerBalanceChip.style.display = 'none';
      navigateToPage('page-staff-operations');
      loadAllAccountsForStaff();
    } else if (state.role === 'admin') {
      elements.adminNav.classList.remove('hidden');
      elements.headerBalanceChip.style.display = 'none';
      navigateToPage('page-admin-analytics');
      refreshAdminData();
    }
  }

  // --- NAVIGATION CONTROLLER ---

  function navigateToPage(pageId) {
    // Update active nav button
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-page') === pageId);
    });

    // Update active content page
    document.querySelectorAll('.content-page').forEach(page => {
      page.classList.toggle('active', page.id === pageId);
    });

    // Update headers
    const pageMeta = {
      'page-dashboard': { title: 'Dashboard', sub: 'Real-time portfolio and financial ledger' },
      'page-account-details': { title: 'Account Specifications', sub: 'C++ BST Node attributes and credentials' },
      'page-deposit': { title: 'Deposit Funds', sub: 'Instant account credit operation' },
      'page-withdraw': { title: 'Withdraw Funds', sub: 'Ledger debit with minimum balance validation' },
      'page-transfer': { title: 'Fund Transfer', sub: 'Inter-account atomic transaction' },
      'page-history': { title: 'Transaction History', sub: 'Audit records from data/transactions/ logger' },
      'page-staff-operations': { title: 'Staff Operations Desk', sub: 'Teller execution terminal' },
      'page-all-accounts': { title: 'Account Directory', sub: 'In-order traversal of registered customer BST nodes' },
      'page-admin-analytics': { title: 'Bank Analytics', sub: 'System liquidity and aggregate account metrics' },
      'page-admin-accounts': { title: 'Manage Accounts', sub: 'Administrative controls and BST mutations' },
      'page-admin-create': { title: 'Register Customer', sub: 'Create new BST node with credentials' }
    };

    if (pageMeta[pageId]) {
      elements.pageTitle.textContent = pageMeta[pageId].title;
      elements.pageSubtitle.textContent = pageMeta[pageId].sub;
    }

    // Trigger page-specific loads
    if (pageId === 'page-deposit') updateDepositPage();
    if (pageId === 'page-withdraw') updateWithdrawPage();
    if (pageId === 'page-transfer') updateTransferPage();
    if (pageId === 'page-history') renderHistoryTable();
    if (pageId === 'page-admin-analytics') refreshAdminData();
    if (pageId === 'page-admin-accounts') loadAdminAccounts();
    if (pageId === 'page-all-accounts') loadAllAccountsForStaff();
  }

  // Sidebar item click listeners
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-page');
      if (page) navigateToPage(page);
    });
  });

  // Action tiles listeners on Dashboard
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => {
      const action = el.getAttribute('data-action');
      if (action === 'go-deposit') navigateToPage('page-deposit');
      if (action === 'go-withdraw') navigateToPage('page-withdraw');
      if (action === 'go-transfer') navigateToPage('page-transfer');
      if (action === 'go-history') navigateToPage('page-history');
      if (action === 'go-admin-create') navigateToPage('page-admin-create');
    });
  });

  // --- CUSTOMER MODULE OPERATIONS ---

  async function refreshCustomerData() {
    if (!state.currentUser || typeof state.currentUser.accountNumber !== 'number') return;

    // Fetch latest account data from C++ BST
    const accResult = await apiGet(`/api/account/${state.currentUser.accountNumber}`);
    if (accResult.success && accResult.account) {
      state.currentUser = accResult.account;
    }

    // Update Header balance & Dashboard
    const balFormatted = formatCurrency(state.currentUser.balance);
    elements.headerBalance.textContent = balFormatted;
    elements.dashBalance.textContent = balFormatted;
    elements.dashAccountNum.textContent = '#' + state.currentUser.accountNumber;
    elements.dashAccountTypePill.textContent = state.currentUser.accountType || 'Savings';

    const minReq = state.currentUser.accountType === 'Current' ? 5000 : 1000;
    elements.dashMinBal.textContent = formatCurrency(minReq);

    // Update Account Details Page
    elements.detName.textContent = state.currentUser.name;
    elements.detAccountNum.textContent = '#' + state.currentUser.accountNumber;
    elements.detType.textContent = state.currentUser.accountType + ' Account';
    elements.detBalance.textContent = balFormatted;
    elements.detAddress.textContent = state.currentUser.address;
    elements.detMinBalance.textContent = formatCurrency(minReq);

    // Fetch Transactions
    const txResult = await apiGet(`/api/transactions/${state.currentUser.accountNumber}`);
    if (txResult.success && Array.isArray(txResult.transactions)) {
      state.transactions = txResult.transactions;
      renderRecentTransactions();
    }
  }

  function renderRecentTransactions() {
    if (!elements.dashTxTableBody) return;
    if (state.transactions.length === 0) {
      elements.dashTxTableBody.innerHTML = `<tr><td colspan="4" class="text-center empty-state">No transaction records logged yet.</td></tr>`;
      return;
    }

    const recent = state.transactions.slice(0, 5);
    elements.dashTxTableBody.innerHTML = recent.map(tx => {
      const typeClass = tx.type.toLowerCase();
      const amountSign = tx.type === 'Credit' ? '+' : '-';
      const amountClass = tx.type === 'Credit' ? 'text-success' : 'text-danger';

      return `
        <tr>
          <td class="mono text-muted">${tx.date || '—'}</td>
          <td>${escapeHtml(tx.description)}</td>
          <td><span class="badge-tx ${typeClass}">${tx.type}</span></td>
          <td class="text-right mono font-bold ${amountClass}">
            ${amountSign}${formatCurrency(tx.amount)}
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderHistoryTable() {
    if (!elements.historyTableBody) return;
    const filter = elements.txFilterType.value;
    const search = elements.txSearchInput.value.toLowerCase().trim();

    const filtered = state.transactions.filter(tx => {
      const matchFilter = (filter === 'ALL') || (tx.type === filter);
      const matchSearch = !search || 
        tx.description.toLowerCase().includes(search) || 
        (tx.date && tx.date.toLowerCase().includes(search));
      return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
      elements.historyTableBody.innerHTML = `<tr><td colspan="4" class="text-center empty-state">No transactions match your query.</td></tr>`;
      return;
    }

    elements.historyTableBody.innerHTML = filtered.map(tx => {
      const typeClass = tx.type.toLowerCase();
      const amountSign = tx.type === 'Credit' ? '+' : '-';
      const amountClass = tx.type === 'Credit' ? 'text-success' : 'text-danger';

      return `
        <tr>
          <td class="mono text-muted">${tx.date || '—'}</td>
          <td>${escapeHtml(tx.description)}</td>
          <td><span class="badge-tx ${typeClass}">${tx.type}</span></td>
          <td class="text-right mono font-bold ${amountClass}">
            ${amountSign}${formatCurrency(tx.amount)}
          </td>
        </tr>
      `;
    }).join('');
  }

  elements.txSearchInput?.addEventListener('input', renderHistoryTable);
  elements.txFilterType?.addEventListener('change', renderHistoryTable);

  // --- DEPOSIT PAGE CONTROLLER ---
  function updateDepositPage() {
    if (!state.currentUser) return;
    elements.depositCurrentBal.textContent = formatCurrency(state.currentUser.balance);
    elements.depositPreviewBal.textContent = formatCurrency(state.currentUser.balance);
    elements.depositAmount.value = '';
  }

  elements.depositAmount?.addEventListener('input', () => {
    const amt = parseFloat(elements.depositAmount.value) || 0;
    const current = state.currentUser ? state.currentUser.balance : 0;
    elements.depositPreviewBal.textContent = formatCurrency(current + amt);
  });

  document.querySelectorAll('.amt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const amt = chip.getAttribute('data-amt');
      elements.depositAmount.value = amt;
      elements.depositAmount.dispatchEvent(new Event('input'));
    });
  });

  elements.depositForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(elements.depositAmount.value);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid deposit amount greater than zero.', 'error');
      return;
    }

    const btn = document.getElementById('deposit-submit-btn');
    btn.disabled = true;

    const res = await apiPost('/api/deposit', {
      accountNumber: state.currentUser.accountNumber,
      amount: amount
    });

    btn.disabled = false;

    if (res.success) {
      showToast(`Successfully deposited ${formatCurrency(amount)} into account #${state.currentUser.accountNumber}!`, 'success');
      elements.depositAmount.value = '';
      await refreshCustomerData();
      updateDepositPage();
    } else {
      showToast(res.error || 'Deposit failed.', 'error');
    }
  });

  // --- WITHDRAW PAGE CONTROLLER ---
  function updateWithdrawPage() {
    if (!state.currentUser) return;
    elements.withdrawCurrentBal.textContent = formatCurrency(state.currentUser.balance);
    elements.withdrawPreviewBal.textContent = formatCurrency(state.currentUser.balance);
    const minReq = state.currentUser.accountType === 'Current' ? 5000 : 1000;
    elements.withdrawMinReq.textContent = formatCurrency(minReq);
    elements.withdrawAmount.value = '';
  }

  elements.withdrawAmount?.addEventListener('input', () => {
    const amt = parseFloat(elements.withdrawAmount.value) || 0;
    const current = state.currentUser ? state.currentUser.balance : 0;
    const remaining = current - amt;
    elements.withdrawPreviewBal.textContent = formatCurrency(remaining);

    const minReq = state.currentUser && state.currentUser.accountType === 'Current' ? 5000 : 1000;
    if (remaining < minReq) {
      elements.withdrawPreviewBal.classList.add('text-danger');
    } else {
      elements.withdrawPreviewBal.classList.remove('text-danger');
    }
  });

  document.querySelectorAll('.amt-chip-withdraw').forEach(chip => {
    chip.addEventListener('click', () => {
      const amt = chip.getAttribute('data-amt');
      elements.withdrawAmount.value = amt;
      elements.withdrawAmount.dispatchEvent(new Event('input'));
    });
  });

  elements.withdrawForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(elements.withdrawAmount.value);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }

    const minReq = state.currentUser.accountType === 'Current' ? 5000 : 1000;
    if (state.currentUser.balance - amount < minReq) {
      showToast(`Cannot withdraw ${formatCurrency(amount)}. Minimum balance requirement of ${formatCurrency(minReq)} must be maintained.`, 'error');
      return;
    }

    const btn = document.getElementById('withdraw-submit-btn');
    btn.disabled = true;

    const res = await apiPost('/api/withdraw', {
      accountNumber: state.currentUser.accountNumber,
      amount: amount
    });

    btn.disabled = false;

    if (res.success) {
      showToast(`Successfully withdrew ${formatCurrency(amount)}.`, 'success');
      elements.withdrawAmount.value = '';
      await refreshCustomerData();
      updateWithdrawPage();
    } else {
      showToast(res.error || 'Withdrawal failed.', 'error');
    }
  });

  // --- TRANSFER PAGE CONTROLLER ---
  function updateTransferPage() {
    if (!state.currentUser) return;
    elements.transferCurrentBal.textContent = formatCurrency(state.currentUser.balance);
    elements.transferPreviewBal.textContent = formatCurrency(state.currentUser.balance);
    elements.transferRecipient.value = '';
    elements.transferAmount.value = '';
  }

  elements.transferAmount?.addEventListener('input', () => {
    const amt = parseFloat(elements.transferAmount.value) || 0;
    const current = state.currentUser ? state.currentUser.balance : 0;
    elements.transferPreviewBal.textContent = formatCurrency(current - amt);
  });

  elements.transferForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const recipient = parseInt(elements.transferRecipient.value, 10);
    const amount = parseFloat(elements.transferAmount.value);

    if (!recipient || recipient === state.currentUser.accountNumber) {
      showToast('Please enter a valid recipient account number different from your own.', 'error');
      return;
    }

    if (!amount || amount <= 0) {
      showToast('Transfer amount must be greater than zero.', 'error');
      return;
    }

    const minReq = state.currentUser.accountType === 'Current' ? 5000 : 1000;
    if (state.currentUser.balance - amount < minReq) {
      showToast(`Transfer rejected. Maintaining minimum balance of ${formatCurrency(minReq)} is required.`, 'error');
      return;
    }

    showConfirm(
      'Confirm Fund Transfer',
      `Transfer ${formatCurrency(amount)} from Account #${state.currentUser.accountNumber} to Account #${recipient}?`,
      async () => {
        const btn = document.getElementById('transfer-submit-btn');
        btn.disabled = true;

        const res = await apiPost('/api/transfer', {
          sender: state.currentUser.accountNumber,
          receiver: recipient,
          amount: amount
        });

        btn.disabled = false;

        if (res.success) {
          showToast(`Successfully transferred ${formatCurrency(amount)} to Account #${recipient}!`, 'success');
          elements.transferAmount.value = '';
          elements.transferRecipient.value = '';
          await refreshCustomerData();
          updateTransferPage();
        } else {
          showToast(res.error || 'Transfer failed.', 'error');
        }
      }
    );
  });

  // --- STAFF PORTAL CONTROLLER ---

  // Staff sub-tabs
  document.querySelectorAll('.staff-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.staff-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetTab = tab.getAttribute('data-tab');
      elements.staffDepositForm.classList.toggle('hidden', targetTab !== 'staff-deposit');
      elements.staffWithdrawForm.classList.toggle('hidden', targetTab !== 'staff-withdraw');
      elements.staffTransferForm.classList.toggle('hidden', targetTab !== 'staff-transfer');
    });
  });

  // Staff Deposit
  elements.staffDepositForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const acc = document.getElementById('staff-dep-acc').value;
    const amt = parseFloat(document.getElementById('staff-dep-amt').value);

    const res = await apiPost('/api/deposit', { accountNumber: acc, amount: amt });
    if (res.success) {
      showToast(`Processed deposit of ${formatCurrency(amt)} for Account #${acc}`, 'success');
      elements.staffDepositForm.reset();
      loadAllAccountsForStaff();
    } else {
      showToast(res.error || 'Deposit failed', 'error');
    }
  });

  // Staff Withdraw
  elements.staffWithdrawForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const acc = document.getElementById('staff-with-acc').value;
    const amt = parseFloat(document.getElementById('staff-with-amt').value);

    const res = await apiPost('/api/withdraw', { accountNumber: acc, amount: amt });
    if (res.success) {
      showToast(`Processed withdrawal of ${formatCurrency(amt)} for Account #${acc}`, 'success');
      elements.staffWithdrawForm.reset();
      loadAllAccountsForStaff();
    } else {
      showToast(res.error || 'Withdrawal failed', 'error');
    }
  });

  // Staff Transfer
  elements.staffTransferForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sender = document.getElementById('staff-trf-sender').value;
    const rec = document.getElementById('staff-trf-rec').value;
    const amt = parseFloat(document.getElementById('staff-trf-amt').value);

    const res = await apiPost('/api/transfer', { sender, receiver: rec, amount: amt });
    if (res.success) {
      showToast(`Transferred ${formatCurrency(amt)} from #${sender} to #${rec}`, 'success');
      elements.staffTransferForm.reset();
      loadAllAccountsForStaff();
    } else {
      showToast(res.error || 'Transfer failed', 'error');
    }
  });

  // Staff Account Lookup (BST search)
  elements.staffLookupBtn?.addEventListener('click', async () => {
    const acc = elements.staffLookupAcc.value.trim();
    if (!acc) return;

    const res = await apiGet(`/api/account/${acc}`);
    if (res.success && res.account) {
      elements.staffLookupResult.classList.remove('hidden');
      document.getElementById('staff-res-name').textContent = res.account.name || 'Unnamed Account';
      document.getElementById('staff-res-acc').textContent = '#' + res.account.accountNumber;
      document.getElementById('staff-res-type').textContent = res.account.accountType;
      document.getElementById('staff-res-bal').textContent = formatCurrency(res.account.balance);
      document.getElementById('staff-res-addr').textContent = res.account.address || '—';
      document.getElementById('staff-res-status').textContent = res.account.isActive ? 'Active' : 'Inactive';
    } else {
      elements.staffLookupResult.classList.add('hidden');
      showToast('Account not found in BST.', 'error');
    }
  });

  // Load All Accounts Directory
  async function loadAllAccountsForStaff() {
    const res = await apiGet('/api/admin/accounts');
    if (res.success && Array.isArray(res.accounts)) {
      state.allAccounts = res.accounts;
      renderAllAccountsTable();
    }
  }

  function renderAllAccountsTable() {
    if (!elements.allAccountsTableBody) return;
    const search = (elements.allAccSearch?.value || '').toLowerCase().trim();

    const filtered = state.allAccounts.filter(a => {
      return !search || 
        String(a.accountNumber).includes(search) || 
        a.name.toLowerCase().includes(search) || 
        a.address.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
      elements.allAccountsTableBody.innerHTML = `<tr><td colspan="6" class="text-center empty-state">No matching accounts found.</td></tr>`;
      return;
    }

    elements.allAccountsTableBody.innerHTML = filtered.map(a => `
      <tr>
        <td class="mono font-bold text-primary">#${a.accountNumber}</td>
        <td>${escapeHtml(a.name || '—')}</td>
        <td>${escapeHtml(a.accountType)}</td>
        <td class="mono font-bold">${formatCurrency(a.balance)}</td>
        <td class="text-muted">${escapeHtml(a.address || '—')}</td>
        <td><span class="status-tag ${a.isActive ? 'active' : ''}">${a.isActive ? 'Active' : 'Inactive'}</span></td>
      </tr>
    `).join('');
  }

  elements.allAccSearch?.addEventListener('input', renderAllAccountsTable);

  // --- ADMIN PORTAL CONTROLLER ---

  async function refreshAdminData() {
    const res = await apiGet('/api/admin/analytics');
    if (res.success) {
      elements.adminTotalAccounts.textContent = res.totalAccounts.toLocaleString();
      elements.adminTotalBalance.textContent = formatCurrency(res.totalBalance);
      const avg = res.totalAccounts > 0 ? (res.totalBalance / res.totalAccounts) : 0;
      elements.adminAvgBalance.textContent = formatCurrency(avg);
    }
  }

  async function loadAdminAccounts() {
    const res = await apiGet('/api/admin/accounts');
    if (res.success && Array.isArray(res.accounts)) {
      state.allAccounts = res.accounts;
      renderAdminAccountsTable();
    }
  }

  function renderAdminAccountsTable() {
    if (!elements.adminAccountsTableBody) return;
    const search = (elements.adminManageSearch?.value || '').toLowerCase().trim();

    const filtered = state.allAccounts.filter(a => {
      return !search || 
        String(a.accountNumber).includes(search) || 
        a.name.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
      elements.adminAccountsTableBody.innerHTML = `<tr><td colspan="6" class="text-center empty-state">No customer accounts registered.</td></tr>`;
      return;
    }

    elements.adminAccountsTableBody.innerHTML = filtered.map(a => `
      <tr>
        <td class="mono font-bold">#${a.accountNumber}</td>
        <td>${escapeHtml(a.name || '—')}</td>
        <td>${escapeHtml(a.accountType)}</td>
        <td class="mono font-bold">${formatCurrency(a.balance)}</td>
        <td class="text-muted">${escapeHtml(a.address || '—')}</td>
        <td class="text-right">
          <button class="btn btn-sm btn-danger delete-acc-btn" data-acc="${a.accountNumber}" data-name="${escapeHtml(a.name || 'Account')}">
            Delete
          </button>
        </td>
      </tr>
    `).join('');

    // Attach delete listeners
    document.querySelectorAll('.delete-acc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const acc = btn.getAttribute('data-acc');
        const name = btn.getAttribute('data-name');
        showConfirm(
          'Delete Customer Account',
          `Are you sure you want to permanently delete Account #${acc} (${name}) from the BST and remove its credentials?`,
          async () => {
            const delRes = await apiDelete(`/api/admin/delete-account/${acc}`);
            if (delRes.success) {
              showToast(`Account #${acc} deleted successfully.`, 'success');
              loadAdminAccounts();
              refreshAdminData();
            } else {
              showToast(delRes.error || 'Failed to delete account.', 'error');
            }
          }
        );
      });
    });
  }

  elements.adminManageSearch?.addEventListener('input', renderAdminAccountsTable);

  // Admin Create Account
  elements.adminCreateForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('create-name').value.trim();
    const address = document.getElementById('create-address').value.trim();
    const password = document.getElementById('create-password').value.trim();
    const accountType = document.getElementById('create-type').value;
    const balance = parseFloat(document.getElementById('create-balance').value);

    const minReq = accountType === 'Current' ? 5000 : 1000;
    if (balance < minReq) {
      showToast(`Opening balance for ${accountType} account must be at least ${formatCurrency(minReq)}.`, 'error');
      return;
    }

    const btn = document.getElementById('create-acc-submit-btn');
    btn.disabled = true;

    const res = await apiPost('/api/admin/create-account', {
      name,
      address,
      password,
      accountType,
      balance
    });

    btn.disabled = false;

    if (res.success) {
      showToast(`Created Account #${res.accountNumber} for ${name} successfully!`, 'success');
      elements.adminCreateForm.reset();
      navigateToPage('page-admin-accounts');
    } else {
      showToast(res.error || 'Failed to create account.', 'error');
    }
  });

  // HTML escaping utility
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

})();
