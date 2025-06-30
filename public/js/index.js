const { createApp } = Vue;

createApp({
    methods: {
        irALogin() {
            window.location.href = '/login.html';
        }
    }
}).mount('#app');