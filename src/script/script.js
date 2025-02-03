// Elementos DOM
const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const adressInput = document.getElementById("adress");
const adressWarn = document.getElementById("adress-warn");
const paymentMethodSelect = document.getElementById("payment-method");
const trocoInputDiv = document.querySelector(".troco-input");
const trocoInput = document.getElementById("troco");
const orderNotesInput = document.getElementById("order-notes");

let cart = [];

// Funções auxiliares

// Atualiza a interface do carrinho
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const cartItemElement = createCartItemElement(item);
    total += item.price * item.quantity;
    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  cartCounter.innerText = cart.length;
}

// Cria o HTML para um item do carrinho
function createCartItemElement(item) {
  const cartItemElement = document.createElement("div");
  cartItemElement.classList.add("flex", "justify-content", "mb-4", "flex-col");
  cartItemElement.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <p class="font-medium">${item.name}</p>
        <p>Qtd: ${item.quantity}</p>
        <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
      </div>
      <div>
        <button class="remove-from-cart-btn" data-name="${
          item.name
        }">Remover</button>
      </div>
    </div>
  `;
  return cartItemElement;
}

// Adiciona um item ao carrinho
function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCartModal();
}

// Remove um item do carrinho
function removeItemCart(name) {
  const index = cart.findIndex((item) => item.name === name);
  if (index !== -1) {
    const item = cart[index];
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      cart.splice(index, 1);
    }
    updateCartModal();
  }
}

// Função para gerar a mensagem para o WhatsApp
function generateWhatsAppMessage() {
  if (cart.length === 0) return "";

  let message = "🍔 *Pedido no DevBurguer* 🍔\n\n";
  cart.forEach((item) => {
    message += `🍔 *${item.name}* - Qtd: ${
      item.quantity
    } | Preço Unitário: R$ ${item.price.toFixed(2)} | Subtotal: R$ ${(
      item.price * item.quantity
    ).toFixed(2)}\n`;
  });

  let totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  message += `\n💰 *Total:* R$ ${totalAmount.toFixed(2)}\n`;

  const address = adressInput.value
    ? `📍 *Endereço:* ${adressInput.value}`
    : "📍 *Endereço não fornecido*";
  message += `\n${address}\n`;

  const paymentMethod = paymentMethodSelect.value;
  message += `\n💳 *Forma de Pagamento:* ${
    paymentMethod === "cartao" ? "Cartão de Crédito" : "Dinheiro"
  }`;

  if (paymentMethod === "dinheiro") {
    const paidAmount = parseFloat(trocoInput.value);
    if (isNaN(paidAmount) || paidAmount < totalAmount) {
      message += `\n🚨 *Erro:* O valor pago é inferior ao total do pedido.`;
    } else {
      const troco = paidAmount - totalAmount;
      message += `\n💵 *Troco:* R$ ${troco.toFixed(2)}`;
    }
  }

  const orderNotes = orderNotesInput.value;
  if (orderNotes) {
    message += `\n📝 *Observações:* ${orderNotes}`;
  }

  return encodeURIComponent(message);
}

// Função para verificar se o restaurante está aberto
function checkRestaurantOpen() {
  const hora = new Date().getHours();
  return hora >= 18 && hora < 22;
}

// Exibir/ocultar campo de troco
function toggleTrocoInput() {
  if (paymentMethodSelect.value === "dinheiro") {
    trocoInputDiv.classList.remove("hidden");
  } else {
    trocoInputDiv.classList.add("hidden");
  }
}

// Eventos de interação com o DOM

// Abrir carrinho
cartBtn.addEventListener("click", () => {
  updateCartModal();
  cartModal.style.display = "flex";
});

// Fechar carrinho
cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) {
    cartModal.style.display = "none";
  }
});

closeBtn.addEventListener("click", () => {
  cartModal.style.display = "none";
});

// Adicionar item ao carrinho
menu.addEventListener("click", (e) => {
  const parentButton = e.target.closest(".add-to-cart-btn");
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));
    addToCart(name, price);
  }
});

// Remover item do carrinho
cartItemsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-from-cart-btn")) {
    const name = e.target.getAttribute("data-name");
    removeItemCart(name);
  }
});

// Atualizar endereço
adressInput.addEventListener("input", () => {
  if (adressInput.value) {
    adressInput.classList.remove("border-red-500");
    adressWarn.classList.add("hidden");
  }
});

// Exibir ou ocultar campo de troco
paymentMethodSelect.addEventListener("change", (e) => {
  toggleTrocoInput();
});

// Finalizar pedido
checkoutBtn.addEventListener("click", () => {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "Ops, o restaurante está fechado",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "left",
      stopOnFocus: true,
      style: {
        background: "#ef4444",
      },
    }).showToast();
    return;
  }

  if (cart.length === 0) {
    Toastify({
      text: "Seu carrinho está vazio",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "left",
      stopOnFocus: true,
      style: {
        background: "#ef4444",
      },
    }).showToast();
    return;
  }

  if (adressInput.value === "") {
    adressWarn.classList.remove("hidden");
    adressInput.classList.add("border-red-500");
    return;
  }

  // Pegando o valor das observações
  const orderNotes = document.getElementById("order-notes").value;

  // Variável para armazenar a mensagem final
  let message = "*Pedido feito com sucesso! 🍔🍟*\n\n";

  let total = 0;

  // Adiciona as informações de cada item no carrinho
  cart.forEach((item) => {
    message += `*Produto:* ${item.name} 🍔\n`;
    message += `*Preço:* R$ ${item.price.toFixed(2)}\n`;

    // Verifica se há observações e as adiciona
    if (item.observations && item.observations.trim() !== "") {
      message += `*Observações:* ${item.observations}\n`;
    }

    message += "\n";
    total += item.price; // Calcula o total
  });

  // Adiciona o total
  message += `*Total:* R$ ${total.toFixed(2)}\n`;

  // Adiciona a mensagem sobre o método de pagamento
  const paymentMethod = paymentMethodSelect.value;
  if (paymentMethod === "cartao") {
    message += "*Forma de Pagamento:* realizado com cartão de crédito 💳.\n";
  } else if (paymentMethod === "dinheiro") {
    message += "*Forma de Pagamento:* realizado em dinheiro 💵.\n";

    // Se houver valor de troco, adiciona o valor digitado
    const trocoInput = document.getElementById("troco");
    const trocoValue = parseFloat(trocoInput.value);

    if (trocoValue > 0 && !isNaN(trocoValue)) {
      message += `*Troco para:* R$ ${trocoValue.toFixed(2)}\n`;
    }
  } else if (paymentMethod === "pix") {
    message += "*Forma de Pagamento:* realizado via Pix 📱.\n";
  } else if (paymentMethod === "debito") {
    message += "*Forma de Pagamento:* realizado com cartão de débito 💳.\n"; // Adicionando a opção de débito
  }

  // Verifica se há observação geral (do campo de observações)
  if (orderNotes && orderNotes.trim() !== "") {
    message += `\n*Observações:* ${orderNotes}\n`;
  }

  // Adiciona o endereço de entrega
  message += `\n*Endereço de entrega:* ${adressInput.value}\n`;

  // Gerar a URL do WhatsApp com a mensagem
  const phone = "5521975956657"; // Número do WhatsApp
  window.open(
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
    "_blank"
  );

  // Limpar o carrinho após o pedido
  cart = [];
  updateCartModal();
});

// Função para exibir mensagens de erro ou sucesso
function showToast(text, backgroundColor) {
  Toastify({
    text,
    duration: 3000,
    close: true,
    gravity: "top",
    position: "left",
    stopOnFocus: true,
    style: {
      background: backgroundColor,
    },
  }).showToast();
}

// Verificar se o restaurante está aberto ao carregar a página
const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();
spanItem.classList.toggle("bg-red-500", !isOpen);
spanItem.classList.toggle("bg-green-600", isOpen);
