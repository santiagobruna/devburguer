const menu = document.getElementById('menu');
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const adressInput = document.getElementById("adress");
const adressWarn = document.getElementById("adress-warn");

let cart = [];

// Abrir o modal do Carrinho
cartBtn.addEventListener("click", () => {
    updatecartModal();
    cartModal.style.display = "flex";
})

// Fechar o modal quando clicar fora
cartModal.addEventListener("click", (e) => {
    if(e.target === cartModal){
        cartModal.style.display = "none";
    }
})

// Fechar modal pelo closeBtn
closeBtn.addEventListener("click", () => {
    cartModal.style.display = "none";
})

menu.addEventListener("click", (e) => {
    // console.log(e.target)
    let parentButton = e.target.closest(".add-to-cart-btn");
    
    if(parentButton){
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));

        // Adicionar no carrinho
        addToCart(name, price)
    }
})

// Função para adicionar no carrinho
function addToCart(name, price){
    const existingItem = cart.find(item => item.name === name);
    if(existingItem){
        // se o item já existe, aumenta apenas a quantidade +1
       existingItem.quantity += 1;
    }else {
        cart.push({
            name: name,
            price: price,
            quantity: 1,
        })
    }
    updatecartModal(); 
}

// Atualiza o carrinho
function updatecartModal(){
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
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
                    <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>
                </div>
            </div>
        `
        total += item.price * item.quantity;
        cartItemsContainer.appendChild(cartItemElement);
    })
    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
    cartCounter.innerText = cart.length;
}

// Função para remover item do carrinho
cartItemsContainer.addEventListener("click", (e) => {
    if(e.target.classList.contains("remove-from-cart-btn")){
        const name = e.target.getAttribute('data-name');
        removeItemCart(name);
    };
})

function removeItemCart(name){
    const index = cart.findIndex(item => item.name === name);
    if(index != -1){
        const item = cart[index];

        if(item.quantity > 1){
            item.quantity -= 1;
            updatecartModal();
            return;
        }
        cart.splice(index, 1);
        updatecartModal();
    }
}

adressInput.addEventListener("input", (e) => {
    let inputValue = e.target.value;

    if(inputValue != ""){
        adressInput.classList.remove("border-red-500");
        adressWarn.classList.add("hidden");
    }

    //
})

// Finalizar pedido
checkoutBtn.addEventListener("click", () => {
    const isOpen = checkRestaurantOpen();
    if(!isOpen){
        Toastify({
            text: "Ops o restaurante está fechado",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "#ef4444",
            },
          }).showToast();
        return;
    }
    if(cart.length === 0) return;
    if(adressInput.value === ""){
        adressWarn.classList.remove("hidden");
        adressInput.classList.add("border-red-500");
        return;
    }
    // Enviar o pedido para o pedido api whats
    const cartItems = cart.map((item) => {
        return(
            `${item.name} Quantidade:(${item.quantity}) Preço:R$ ${item.price}) | `
        )
    }).join("");
    const message = encodeURIComponent(cartItems);
    const phone = "5521975956657";

    window.open(`https://wa.me/${phone}?/text=${message} Endereço: ${adressInput.value}`, "_blank");

    cart = [];
    updatecartModal();
})

function checkRestaurantOpen(){
    const data = new Date();
    const hora = data.getHours();
    return hora >= 18 && hora < 22; // true restaurante está aberto
}

const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if(isOpen){
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600");
}else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
}