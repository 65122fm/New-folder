document.getElementById("burger").addEventListener("click", function () {
  document.querySelector(".menu").classList.toggle("show");
});

const allTabs = document.querySelectorAll(".tabs");
const blocks = document.querySelectorAll(".block");
const fromBlock = blocks[0];
const toBlock = blocks[1];

const fromInput = fromBlock.querySelector(".amount-input");
const toInput = toBlock.querySelector(".amount-input");

const fromRateText = fromBlock.querySelector(".rate");
const toRateText = toBlock.querySelector(".rate");

const apiKey = "e8b7ce5ecce86c17154c1ba96dc08b95";

let activeInputIndex = 0;

function limitDecimalPlaces(inputElement, maxDecimals = 5) {
  inputElement.addEventListener("input", () => {
    const value = inputElement.value;
    if (value.includes(".")) {
      const [intPart, decPart] = value.split(".");
      if (decPart.length > maxDecimals) {
        inputElement.value = `${intPart}.${decPart.slice(0, maxDecimals)}`;
      }
    }
  });
}
fromInput.addEventListener("input", () => {
    fromInput.value = fromInput.value.replace(",", ".");
    
    fromInput.value = fromInput.value.replace(/[^0-9.]/g, ""); 
    if ((fromInput.value.match(/\./g) || []).length > 1) {
      fromInput.value = fromInput.value.replace(/\.(?=[^.]*$)/, ""); 
    }
  
    activeInputIndex = 0;
    calculate(0);
  });
  
  toInput.addEventListener("input", () => {
    toInput.value = toInput.value.replace(",", ".");
  
    toInput.value = toInput.value.replace(/[^0-9.]/g, ""); 
  
    if ((toInput.value.match(/\./g) || []).length > 1) {
      toInput.value = toInput.value.replace(/\.(?=[^.]*$)/, "");
    }
  
    activeInputIndex = 1;
    calculate(1);
  });
  


allTabs.forEach((tabsContainer) => {
  const buttons = tabsContainer.querySelectorAll(".tab");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      calculate(activeInputIndex);
    });
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const fromTabs = fromBlock.querySelectorAll(".tab");
  const toTabs = toBlock.querySelectorAll(".tab");

  fromTabs.forEach((tab) => {
    if (tab.textContent.trim() === "RUB") tab.classList.add("active");
    else tab.classList.remove("active");
  });

  toTabs.forEach((tab) => {
    if (tab.textContent.trim() === "USD") tab.classList.add("active");
    else tab.classList.remove("active");
  });

  fromInput.value = 1;
  activeInputIndex = 0;

  limitDecimalPlaces(fromInput, 5);
  limitDecimalPlaces(toInput, 5);

  calculate(0);
});

async function calculate(changedInputIndex = 0) {
  const fromCurrency = fromBlock
    .querySelector(".tab.active")
    .textContent.trim();
  const toCurrency = toBlock.querySelector(".tab.active").textContent.trim();

  const fromValue = parseFloat(fromInput.value) || 0;
  const toValue = parseFloat(toInput.value) || 0;

  

  if (fromCurrency === toCurrency) {
    if (changedInputIndex === 0) {
      toInput.value = fromValue;
    } else {
      fromInput.value = toValue;
    }
    updateRateText(fromCurrency, toCurrency, 1);
    return;
  }

  try {
    const response = await fetch(
      `https://api.exchangerate.host/live?access_key=${apiKey}`
    );
    const data = await response.json();

    if (!data.success) {
      console.error("API error:", data.error);
      return;
    }

    const rates = data.quotes;
    let rate;

    if (fromCurrency === "USD") {
      rate = rates[`USD${toCurrency}`];
    } else if (toCurrency === "USD") {
      rate = 1 / rates[`USD${fromCurrency}`];
    } else {
      const usdToFrom = rates[`USD${fromCurrency}`];
      const usdToTo = rates[`USD${toCurrency}`];
      rate = usdToTo / usdToFrom;
    }

    if (changedInputIndex === 0) {
      toInput.value = (fromValue * rate).toFixed(5);
    } else {
      fromInput.value = (toValue / rate).toFixed(5);
    }

    updateRateText(fromCurrency, toCurrency, rate);
  } catch (error) {
    console.error("Xəta baş verdi:", error);
  }
}

function updateRateText(from, to, rate) {
  fromRateText.textContent = `1 ${from} = ${rate.toFixed(5)} ${to}`;
  toRateText.textContent = `1 ${to} = ${(1 / rate).toFixed(5)} ${from}`;
}
const statusDiv = document.getElementById("network-status");

function checkConnection() {
  if (navigator.onLine) {
    statusDiv.style.display = "none";
    calculate(activeInputIndex);
  } else {
    const fromCurrency = fromBlock
      .querySelector(".tab.active")
      .textContent.trim();
    const toCurrency = toBlock.querySelector(".tab.active").textContent.trim();

    if (fromCurrency !== toCurrency) {
      statusDiv.style.display = "block";
    } else {
      statusDiv.style.display = "none";
    }
  }
}
window.addEventListener("online", checkConnection);
window.addEventListener("offline", checkConnection);

checkConnection();
