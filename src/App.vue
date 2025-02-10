<template>
  <div id="app">
    <nav class="navbar">
      <router-link to="/" :class="{ active: $route.path === '/' }">ایجاد رویداد</router-link>
      <router-link to="/support" :class="{ active: $route.path === '/support' }">راهنما</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: center;
  gap: 20px;
  background: black;
  padding: 15px 0;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar a {
  text-decoration: none;
  color: white;
  font-weight: bolder;
  font-size: 1.3em;
  padding: 10px 15px;
  position: relative;
}

.navbar a.active {
  font-weight: bold;
  color: #a780cf;
}

.navbar a.active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -5px;
  width: 100%;
  height: 2px;
  background: #a780cf;
}
</style>