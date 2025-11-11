/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Track selected products */
let selectedProducts = [];

/* Save and load selected products using localStorage */

/* Load selected products from localStorage on page load */
window.addEventListener("load", () => {
  const savedProducts = localStorage.getItem("selectedProducts");
  if (savedProducts) {
    selectedProducts = JSON.parse(savedProducts);
    updateSelectedProducts();
    updateProductHighlight();
  }
});

/* Update localStorage whenever selected products change */
function saveSelectedProducts() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

/* Function to update the "Selected Products" section */
function updateSelectedProducts() {
  const selectedProductsContainer = document.getElementById("selectedProducts");

  if (selectedProducts.length === 0) {
    selectedProductsContainer.innerHTML = `<p>No products selected</p>`;
  } else {
    selectedProductsContainer.innerHTML = selectedProducts
      .map(
        (product) => `
        <div class="selected-product-card">
          <img src="${product.image}" alt="${product.name}" class="selected-product-image">
          <div class="selected-product-info">
            <h3>${product.name}</h3>
            <p>${product.brand}</p>
            <button class="remove-product" data-name="${product.name}">Remove</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  /* Add event listeners to remove buttons */
  document.querySelectorAll(".remove-product").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productName = e.target.getAttribute("data-name");
      selectedProducts = selectedProducts.filter(
        (product) => product.name !== productName
      );
      updateSelectedProducts();
      updateProductHighlight();
      saveSelectedProducts();
    });
  });

  saveSelectedProducts();
}

/* Function to toggle product selection */
function toggleProductSelection(product) {
  const isSelected = selectedProducts.some(
    (selected) => selected.name === product.name
  );

  if (isSelected) {
    selectedProducts = selectedProducts.filter(
      (selected) => selected.name !== product.name
    );
  } else {
    selectedProducts.push(product);
  }

  updateSelectedProducts();
  updateProductHighlight();
}

/* Function to update product card highlights */
function updateProductHighlight() {
  document.querySelectorAll(".product-card").forEach((card) => {
    const productName = card.querySelector("h3").textContent;
    const isSelected = selectedProducts.some(
      (product) => product.name === productName
    );

    if (isSelected) {
      card.classList.add("selected");
    } else {
      card.classList.remove("selected");
    }
  });
}

/* Fix modal view functionality */

/* Function to create and display a modal for a product */
function showProductModal(product) {
  const modalContainer = document.createElement("div");
  modalContainer.classList.add("modal-container");

  const isSelected = selectedProducts.some(
    (selected) => selected.name === product.name
  );

  modalContainer.innerHTML = `
    <div class="modal">
      <button class="close-modal">&times;</button>
      <img src="${product.image}" alt="${product.name}" class="modal-image">
      <div class="modal-info">
        <h3>${product.name}</h3>
        <p><strong>Brand:</strong> ${product.brand}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Description:</strong> ${
          product.description || "No description available."
        }</p>
        <button class="toggle-product">${
          isSelected ? "Remove" : "Add Product"
        }</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalContainer);

  /* Close modal functionality */
  modalContainer.querySelector(".close-modal").addEventListener("click", () => {
    document.body.removeChild(modalContainer);
  });

  /* Toggle product functionality */
  modalContainer
    .querySelector(".toggle-product")
    .addEventListener("click", () => {
      toggleProductSelection(product);
      document.body.removeChild(modalContainer);
    });

  /* Close modal when clicking outside of it */
  modalContainer.addEventListener("click", (e) => {
    if (e.target === modalContainer) {
      document.body.removeChild(modalContainer);
    }
  });
}

/* Add CSS styles for modal positioning */
const style = document.createElement("style");
style.textContent = `
  .modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .modal img {
    max-width: 100%;
    height: auto;
    margin-bottom: 20px;
  }

  .close-modal {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
`;
document.head.appendChild(style);

/* Modify displayProducts to include modal functionality */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
    </div>
  `
    )
    .join("");

  /* Add click event listeners to product cards */
  document.querySelectorAll(".product-card").forEach((card, index) => {
    card.addEventListener("click", () => {
      showProductModal(products[index]);
    });
  });
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = document.getElementById("userInput").value.trim();
  if (!userInput) return;

  // Display user message in the chat window
  chatWindow.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;

  // Add user message to conversation history
  conversationHistory.push({ role: "user", content: userInput });

  // Clear the input field
  document.getElementById("userInput").value = "";

  const apiUrl = "https://lorealbot-worker.4stra4.workers.dev/";

  const requestBody = {
    model: "gpt-4o", // Using the specified OpenAI model
    messages: conversationHistory,
    max_tokens: 300,
  };

  chatWindow.innerHTML += "<p>Generating response, please wait...</p>";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.choices && data.choices[0].message.content) {
      const aiResponse = data.choices[0].message.content;

      // Display AI response in the chat window
      chatWindow.innerHTML += `<p><strong>AI:</strong> ${aiResponse}</p>`;

      // Add AI response to conversation history
      conversationHistory.push({ role: "assistant", content: aiResponse });
    } else {
      chatWindow.innerHTML +=
        "<p>Sorry, I couldn't generate a response. Please try again later.</p>";
    }
  } catch (error) {
    console.error("Error generating response:", error);
    chatWindow.innerHTML +=
      "<p>There was an error generating the response. Please try again later.</p>";
  }
});

/* Add functionality to generate a routine using OpenAI API */

/* Function to generate a routine */
async function generateRoutine() {
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML =
      "<p>Please select some products to generate a routine.</p>";
    return;
  }

  const productData = selectedProducts.map((product) => ({
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description || "No description available.",
  }));

  const apiUrl = "https://lorealbot-worker.4stra4.workers.dev/";

  const requestBody = {
    model: "gpt-4o", // Using the specified OpenAI model
    messages: [
      {
        role: "system",
        content:
          "You are a skincare and beauty routine advisor. Generate a personalized routine based on the provided products.",
      },
      {
        role: "user",
        content: `Here are the selected products: ${JSON.stringify(
          productData
        )}`,
      },
    ],
    max_tokens: 300,
  };

  chatWindow.innerHTML = "<p>Generating your routine, please wait...</p>";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.choices && data.choices[0].message.content) {
      const routine = data.choices[0].message.content;

      // Display the routine in the chat window
      const formattedRoutine = routine
        .split("\n")
        .map((line) => `<p>${line.trim()}</p>`)
        .join("");

      chatWindow.innerHTML = formattedRoutine;

      // Append the routine to the conversation history
      conversationHistory.push({ role: "assistant", content: routine });
    } else {
      chatWindow.innerHTML =
        "<p>Sorry, I couldn't generate a routine. Please try again later.</p>";
    }
  } catch (error) {
    console.error("Error generating routine:", error);
    chatWindow.innerHTML =
      "<p>There was an error generating the routine. Please try again later.</p>";
  }
}

/* Add event listener to the Generate Routine button */
const generateButton = document.createElement("button");
generateButton.textContent = "Generate Routine";
generateButton.classList.add("generate-btn");
generateButton.addEventListener("click", generateRoutine);

document.getElementById("selectedProductsSection").appendChild(generateButton);

/* Enable follow-up questions in the chatbox with conversation history */

/* Track conversation history */
let conversationHistory = [
  {
    role: "system",
    content:
      "You are a skincare and beauty routine advisor for L'Oréal products. Assist the user with their skincare routine questions or product questions. Do not answer questions unrelated to skincare, haircare, makeup, fragrance, and related topics.",
  },
];

/* Function to handle chat form submission */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = document.getElementById("userInput").value.trim();
  if (!userInput) return;

  // Display user message in the chat window
  chatWindow.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;

  // Add user message to conversation history
  conversationHistory.push({ role: "user", content: userInput });

  // Clear the input field
  document.getElementById("userInput").value = "";

  const apiUrl = "https://lorealbot-worker.4stra4.workers.dev/";

  const requestBody = {
    model: "gpt-4o", // Using the specified OpenAI model
    messages: conversationHistory,
    max_tokens: 300,
  };

  chatWindow.innerHTML += "<p>Generating response, please wait...</p>";

  try {
    const response = await fetch("https://lorealbot-worker.4stra4.workers.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.choices && data.choices[0].message.content) {
      const aiResponse = data.choices[0].message.content;

      // Display AI response in the chat window
      chatWindow.innerHTML += `<p><strong>AI:</strong> ${aiResponse}</p>`;

      // Add AI response to conversation history
      conversationHistory.push({ role: "assistant", content: aiResponse });
    } else {
      chatWindow.innerHTML +=
        "<p>Sorry, I couldn't generate a response. Please try again later.</p>";
    }
  } catch (error) {
    console.error("Error generating response:", error);
    chatWindow.innerHTML +=
      "<p>There was an error generating the response. Please try again later.</p>";
  }
});

/* Add a button to clear all selections */
const clearButton = document.createElement("button");
clearButton.textContent = "Clear All Selections";
clearButton.classList.add("clear-btn");
clearButton.addEventListener("click", () => {
  selectedProducts = [];
  updateSelectedProducts();
  updateProductHighlight();
  saveSelectedProducts();
});

document.getElementById("selectedProductsSection").appendChild(clearButton);
