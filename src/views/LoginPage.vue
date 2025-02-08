<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <a href="#">Register here</a></p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
    };
  },
  methods: {
    handleLogin() {
      // ارسال درخواست لاگین
      console.log('Logging in with', this.email, this.password);
    },
  },
};
</script>

<style>
/* استایل ساده برای صفحه لاگین */
.login-container {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
</style>
