const phoneStorage = {
  storageKey: "wheel-participants",
  getUsedPhones() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch (error) {
      console.error("Ошибка чтения данных из localStorage:", error);
      return new Set();
    }
  },
  isPhoneUsed(phone) {
    const usedPhones = this.getUsedPhones();
    const normalizedPhone = phone.replace(/\D/g, "");
    return usedPhones.has(normalizedPhone);
  },
  addUsedPhone(phone) {
    try {
      const usedPhones = this.getUsedPhones();
      const normalizedPhone = phone.replace(/\D/g, "");

      if (usedPhones.has(normalizedPhone)) {
        return false;
      }
      usedPhones.add(normalizedPhone);
      localStorage.setItem(this.storageKey, JSON.stringify([...usedPhones]));
      return true;
    } catch (error) {
      console.error("Ошибка сохранения данных в localStorage:", error);
      return false;
    }
  },
  getStats() {
    const usedPhones = this.getUsedPhones();
    return {
      totalParticipants: usedPhones.size,
      phones: [...usedPhones],
    };
  },
};
function formatPhone(value) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("8")) {
    const correctedDigits = "7" + digits.slice(1);
    return formatPhoneDigits(correctedDigits);
  } else if (digits.length > 0 && !digits.startsWith("7")) {
    const correctedDigits = "7" + digits;
    return formatPhoneDigits(correctedDigits);
  }
  return formatPhoneDigits(digits);
}
function formatPhoneDigits(digits) {
  if (digits.length === 0) return "";
  if (digits.length <= 1) return `+7 (${digits}`;
  if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
  if (digits.length <= 7)
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 9)
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
      7
    )}`;
  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
    7,
    9
  )}-${digits.slice(9, 11)}`;
}
function validatePhone(phoneNumber) {
  const digits = phoneNumber.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("7");
}
document.getElementById("phoneInput").addEventListener("input", function (e) {
  e.target.value = formatPhone(e.target.value);
  document.getElementById("phoneError").classList.add("hidden");
  e.target.classList.remove("error");
});
document
  .getElementById("phoneForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const phoneInput = document.getElementById("phoneInput");
    const phone = phoneInput.value;
    if (!validatePhone(phone)) {
      showToast("Введите корректный номер телефона", "", "error");
      phoneInput.classList.add("error");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (phoneStorage.isPhoneUsed(phone)) {
      showToast(
        "Этот номер уже участвовал в&nbsp;розыгрыше!",
        "Каждый номер может участвовать только один раз.",
        "error"
      );

      return;
    }
    const success = phoneStorage.addUsedPhone(phone);
    if (!success) {
      showToast("Произошла ошибка. Попробуйте ещё раз.", "", "error");

      return;
    }
    location.href = "./index2.html";
  });
function showToast(title, description, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
                <div class="toast-title">${title}</div>
                ${
                  description
                    ? `<div class="toast-description">${description}</div>`
                    : ""
                }
            `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 4000);

}
