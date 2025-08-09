// ✅ Alpine Initialization
document.addEventListener("alpine:init", () => {

  // =========================
  // AUTH STORE
  // =========================
  Alpine.store("auth", {
    username: null,
    role: null,
    loading: true, // Start in loading state

    // Fetch current session
    async fetchSession() {
      this.loading = true;
      try {
        const res = await fetch("http://localhost:8080/api/auth/session", {
          method: "GET",
          credentials: "include", // ✅ Include cookies
        });

        if (!res.ok) throw new Error("No active session");

        const data = await res.json();
        this.username = data.username;
        this.role = data.role;
        console.log("Session loaded:", this.username, this.role);
      } catch (err) {
        console.warn("No active session");
        this.username = null;
        this.role = null;
      } finally {
        this.loading = false;
      }
    },

    // Logout
    async logout() {
  fetch("http://localhost:8080/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).finally(() => {
    this.username = null;
    this.role = null;
    window.location.href = "login.html";
  });
}
  });

  // ✅ Auto-fetch session on page load
  Alpine.store("auth").fetchSession();

  // =========================
  // SHOP APP COMPONENT
  // =========================
  Alpine.data("shopApp", () => ({
    products: [],
    editingProduct: {
      id: null,
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      category: "",
      imageUrl: "",
    },
    loading: false,
    error: "",

    // Fetch all products
    async fetchProducts() {
      this.loading = true;
      this.error = "";
      try {
        const response = await fetch("http://localhost:8080/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        this.products = await response.json();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },

    // Save or Update product
    async saveProduct() {
      const method = this.editingProduct.id ? "PUT" : "POST";
      const url = this.editingProduct.id
        ? `http://localhost:8080/api/products/${this.editingProduct.id}`
        : `http://localhost:8080/api/products`;

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.editingProduct),
          credentials: 'include' 
        });

        if (!res.ok) throw new Error("Failed to save product");

        await this.fetchProducts();
        this.resetForm();
      } catch (err) {
        alert(err.message);
      }
    },

    // Delete a product
    async deleteProduct(id) {
      if (!confirm("Are you sure you want to delete this product?")) return;

      try {
        const res = await fetch(`http://localhost:8080/api/products/${id}`, {
          method: "DELETE",
          credentials: 'include' 
        });

        if (!res.ok) throw new Error("Failed to delete product");

        await this.fetchProducts();
      } catch (err) {
        alert(err.message);
      }
    },

    // Edit product
    editProduct(product) {
      this.editingProduct = { ...product };
    },

    // Reset form
    resetForm() {
      this.editingProduct = {
        id: null,
        name: "",
        description: "",
        price: 0,
        quantity: 0,
        category: "",
        imageUrl: "",
      };
    },

    // Init component
    init() {
      this.fetchProducts();
    },
  }));

  // =========================
  // CAROUSEL COMPONENT
  // =========================
  Alpine.data("carousel", (filterCategory = null) => ({
    products: [],
    currentIndex: 0,
    itemsPerPage: 3,

    async fetchProducts() {
      try {
        const response = await fetch("http://localhost:8080/api/products");
        let allProducts = await response.json();
        // Filter by category if provided
        if (filterCategory) {
          this.products = allProducts.filter(p =>
            p.category.toLowerCase() === filterCategory.toLowerCase()
          );
        } else {
          this.products = allProducts;
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    },

    visibleProducts() {
      return this.products.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
    },

    next() {
      if (this.currentIndex + this.itemsPerPage < this.products.length) {
        this.currentIndex += this.itemsPerPage;
      }
    },

    prev() {
      if (this.currentIndex - this.itemsPerPage >= 0) {
        this.currentIndex -= this.itemsPerPage;
      }
    },

    addToCart(product) {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.push(product);
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${product.name} added to cart!`);
    },

    init() {
      this.fetchProducts();
    }
  }));

});
