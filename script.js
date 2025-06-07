// Global variables
let currentUser  = null;
let isLoginMode = true;
let selectedProduct = null;
let selectedPayment = null;
let orderData = {};
let slideIndex = 1;

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  initSlider();
  setupAuthForm();
});

// Auth functions
function checkAuthStatus() {
  const user = localStorage.getItem("currentUser ");
  if (user) {
    currentUser  = JSON.parse(user);
    showApp();
  } else {
    showAuth();
  }
}

function setupAuthForm() {
  const form = document.getElementById("authForm");
  const switchLink = document.getElementById("authSwitchLink");

  form.addEventListener("submit", handleAuth);
  switchLink.addEventListener("click", toggleAuthMode);
}

function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("confirmPassword").value = "";
}

function logout() {
  localStorage.removeItem("currentUser ");
  currentUser  = null;
  clearForm();
  showAuth();
  showPage("home");
}

function toggleAuthMode(e) {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  clearForm();

  const title = document.getElementById("authTitle");
  const submit = document.getElementById("authSubmit");
  const switchText = document.getElementById("authSwitchText");
  const switchLink = document.getElementById("authSwitchLink");
  const nameField = document.getElementById("nameField");
  const confirmPasswordField = document.getElementById("confirmPasswordField");

  const nameInput = document.getElementById("name");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  if (isLoginMode) {
    title.textContent = "Sign in";
    submit.textContent = "Sign in";
    switchText.textContent = "Belum punya akun?";
    switchLink.textContent = "Sign up";
    nameField.style.display = "none";
    confirmPasswordField.style.display = "none";

    nameInput.removeAttribute("required");
    confirmPasswordInput.removeAttribute("required");
  } else {
    title.textContent = "Sign up";
    submit.textContent = "Sign up";
    switchText.textContent = "Sudah punya akun?";
    switchLink.textContent = "Sign in";
    nameField.style.display = "block";
    confirmPasswordField.style.display = "block";

    nameInput.setAttribute("required", "true");
    confirmPasswordInput.setAttribute("required", "true");
  }

  clearErrors();
}

function handleAuth(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validasi input kosong
  if (!email) {
    showError("emailError", "Email harus diisi");
    return;
  }

  if (!password) {
    showError("passwordError", "Password harus diisi");
    return;
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError("emailError", "Format email tidak valid");
    return;
  }

  if (isLoginMode) {
    // LOGIN LOGIC
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        currentUser  = user;
        localStorage.setItem("currentUser ", JSON.stringify(user));
        clearForm(); // Bersihkan form setelah login berhasil
        showApp();
      } else {
        showError("passwordError", "Email atau password salah");
      }
    } catch (error) {
      showError("passwordError", "Terjadi kesalahan sistem");
      console.error("Sign in error:", error);
    }
  } else {
    const name = document.getElementById("name").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name) {
      showError("nameError", "Nama harus diisi");
      return;
    }

    if (password !== confirmPassword) {
      showError("confirmPasswordError", "Password tidak cocok");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.find((u) => u.email === email)) {
      showError("emailError", "Email sudah terdaftar");
      return;
    }

    const newUser  = { name, email, password };
    users.push(newUser );
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registrasi berhasil! Silakan Sign in terlebih dahulu.");
    isLoginMode = true;
    toggleAuthMode(new Event("click"));
  }
}

function showError(elementId, message) {
  document.getElementById(elementId).textContent = message;
}

function clearErrors() {
  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");
  const confirmPasswordError = document.getElementById("confirmPasswordError");

  if (nameError) nameError.textContent = "";
  if (emailError) emailError.textContent = "";
  if (passwordError) passwordError.textContent = "";
  if (confirmPasswordError) confirmPasswordError.textContent = "";
}

function showAuth() {
  document.getElementById("authContainer").style.display = "flex";
  document.getElementById("appContainer").style.display = "none";
}

function showApp() {
  document.getElementById("authContainer").style.display = "none";
  document.getElementById("appContainer").style.display = "block";
}

// Navigation functions
function showPage(pageId) {
  try {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach((page) => page.classList.remove('active'));

    // Show selected page
    const selectedPage = document.getElementById(pageId + 'Page');
    if (!selectedPage) {
      throw new Error(`Halaman ${pageId} tidak ditemukan`);
    }
    selectedPage.classList.add('active');

    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) => link.classList.remove('active'));
    event.target.classList.add('active');

    // Khusus untuk halaman pembayaran
    if (pageId === 'payment') {
      initializePaymentPage();
    }
  } catch (error) {
    console.error('Error showing page:', error);
    alert('Terjadi kesalahan saat membuka halaman');
  }
}

// Slider functions
function initSlider() {
  showSlide(slideIndex);
  setInterval(nextSlide, 3000); // Auto slide every 4 seconds
}

function showSlide(n) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slider-dot");

  if (n > slides.length) slideIndex = 1;
  if (n < 1) slideIndex = slides.length;

  slides.forEach((slide) => slide.classList.remove("active"));
  dots.forEach((dot) => dot.classList.remove("active"));

  slides[slideIndex - 1].classList.add("active");
  dots[slideIndex - 1].classList.add("active");
}

function currentSlide(n) {
  slideIndex = n;
  showSlide(slideIndex);
}

function nextSlide() {
  slideIndex++;
  showSlide(slideIndex);
}

// Top up functions
function selectProduct(id, name, price) {
  // Remove previous selection
  document.querySelectorAll(".product-card").forEach((card) => {
    card.classList.remove("selected");
  });


  // Add selection to clicked card
  event.target.classList.add("selected");

  selectedProduct = { id, name, price };
}
function increase() {
  const jumlahInput = document.getElementById("jumlah");
  let currentValue = parseInt(jumlahInput.value) || 0;
  jumlahInput.value = currentValue + 1;
  animateJumlah();
}

function decrease() {
  const jumlahInput = document.getElementById("jumlah");
  let currentValue = parseInt(jumlahInput.value) || 0;
  if (currentValue > 1) {
    jumlahInput.value = currentValue - 1;
    animateJumlah();
  }
}

function animateJumlah() {
  const jumlahInput = document.getElementById("jumlah");
  jumlahInput.classList.remove("jumlah-anim"); // Reset class
  void jumlahInput.offsetWidth; // Trigger reflow (necessary for animation restart)
  jumlahInput.classList.add("jumlah-anim");
}

function proceedToPayment() {
  if (!selectedProduct) {
    alert("Silakan pilih produk terlebih dahulu");
    return;
  }

  const userId = document.getElementById("userId").value;
  const zoneId = document.getElementById("zoneId").value;
  const jumlah = document.getElementById("jumlah").value;
  const whatsapp = document.getElementById("whatsapp").value;

  if (!userId || !zoneId || !jumlah|| !whatsapp) {
    alert("Silakan lengkapi semua data");
    return;
  }

  orderData = {
    product: selectedProduct,
    userId,
    zoneId,
    jumlah,
    whatsapp,
    username: currentUser.name || currentUser.email.split("@")[0],
  };

  showPage("payment");
}

function selectPayment(method) {
  // Remove previous selection
  document.querySelectorAll(".payment-option").forEach((option) => {
    option.classList.remove("selected");
  });

  // Add selection to clicked option
  event.target.classList.add("selected");

  selectedPayment = method;
}

function showOrderConfirmation() {
  if (!selectedPayment) {
    alert("Silakan pilih metode pembayaran");
    return;
  }

  const orderDetails = document.getElementById("orderDetails");
  orderDetails.innerHTML = `
                <div class="detail-row">
                    <span>Username:</span>
                    <span>${orderData.username}</span>
                </div>
                <div class="detail-row">
                    <span>User ID:</span>
                    <span>${orderData.userId}</span>
                </div>
                <div class="detail-row">
                    <span>Zone ID:</span>
                    <span>${orderData.zoneId}</span>
                </div
                <div class="detail-row">
                    <span>jumlah:</span>
                    <span>${orderData.jumlah}</span>
                </div>
                <div class="detail-row">
                    <span>Produk:</span>
                    <span>${orderData.product.name}</span>
                </div>
                <div class="detail-row">
                    <span>Metode Pembayaran:</span>
                    <span>${selectedPayment}</span>
                </div>
                <div class="detail-row">
                    <span>Total Pembayaran:</span>
                    <span>Rp ${orderData.product.price.toLocaleString(
                      "id-ID"
                    )}</span>
                </div>
            `;

  document.getElementById("orderModal").classList.add("active");
}

function processPayment() {
  // Save transaction to history
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const transaction = {
    ...orderData,
    paymentMethod: selectedPayment,
    date: new Date().toLocaleDateString("id-ID"),
    status: "Berhasil",
  };
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Close order modal and show success modal
  closeModal();
  document.getElementById("successModal").classList.add("active");

  // Update history page
  updateHistoryPage();
}

function updateHistoryPage() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const historyPage = document.getElementById("historyPage");
  historyPage.classList.add("active");
  const historyContent = document.getElementById("historyContent");

  if (transactions.length === 0) {
    historyContent.innerHTML = `
                    <div style="text-align: center; padding: 50px; color: #718096;">
                        <div style="font-size: 48px; margin-bottom: 20px;">📝</div>
                        <p>Belum ada transaksi, top up dulu yuk!</p>
                    </div>
                `;
  } else {
    historyContent.innerHTML = transactions
      .map(
        (transaction) => `
                    <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="color: #4a5568;">${
                              transaction.product.name
                            }</h4>
                            <span style="color: #38a169; font-weight: bold;">${
                              transaction.status
                            }</span>
                        </div>
                        <div style="color: #718096; font-size: 14px;">
                            <p>Tanggal: ${transaction.date}</p>
                            <p>User ID: ${transaction.userId}</p>
                            <p>Zone ID: ${transaction.zoneId}</p>
                            <p>Jumlah: ${transaction.jumlah}</p>
                            <p>Total: Rp ${transaction.product.price.toLocaleString(
                              "id-ID"
                            )}</p>
                        </div>
                    </div>
                `
      )
      .join("");
  }
}

function closeModal() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.remove("active");
  });
}

function goToHome() {
  closeModal();
  showPage("home");

  // Reset form
  document.getElementById("userId").value = "";
  document.getElementById("zoneId").value = "";
  document.getElementById("jumlah").value = "1";
  document.getElementById("whatsapp").value = "";
  selectedProduct = null;
  selectedPayment = null;

  // Remove selections
  document.querySelectorAll(".product-card").forEach((card) => {
    card.classList.remove("selected");
  });
  document.querySelectorAll(".payment-option").forEach((option) => {
    option.classList.remove("selected");
  });
}

function goToMLBB() {
  window.open(
    "https://play.google.com/store/apps/details?id=com.mobile.legends",
    "_blank"
  );
  goToHome();
}
