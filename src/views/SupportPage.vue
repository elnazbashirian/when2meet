<template>
  <div class="support-page">
    <h1>راهنمای هماهنگ شو</h1>
    <p>
      این سایت به شما کمک می‌کند رویدادهای خود را به راحتی برنامه‌ریزی کنید. برای ایجاد رویداد،
      ابتدا نام، تاریخ و بازه زمانی را مشخص کنید. سپس دوستان خود را دعوت کرده و دسترسی آن‌ها
      را برای انتخاب زمان بررسی کنید
    </p>
    <div class="menu">
      <button
          v-for="section in sections"
          :key="section.id"
          @click="currentSection = section.id"
          :class="{ active: currentSection === section.id }">
        {{ section.name }}
      </button>
    </div>
    <div v-for="section in filteredSections" :key="section.id" class="content-box">
      <h2>{{ section.title }}</h2>
      <p>{{ section.description }}</p>
      <!-- اضافه کردن توضیحات اضافی -->
      <p v-if="section.additionalDescription">{{ section.additionalDescription }}</p>
      <div v-if="section.id === 'groupAvailability'" class="legend">
        <div class="color-box purple-dark"></div> <span>بهترین زمان برای رویداد</span>
        <div class="color-box purple-medium"></div> <span>چند نفر در دسترس نیستند</span>
        <div class="color-box purple-light"></div> <span>فقط یک نفر در دسترس است</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentSection: 'createEvent',
      sections: [
        {
          id: 'createEvent',
          name: 'ایجاد رویداد',
          title: 'ایجاد رویداد',
          description: 'برای ایجاد رویداد، ابتدا یک نام وارد کنید، سپس تاریخ و زمان مناسب را انتخاب کنید',
          additionalDescription: '(در بخش بعد راهنمای انتخاب تاریخ اورده شده است)'
        },
        {
          id: 'selectTime',
          name: 'انتخاب تاریخ',
          title: 'انتخاب تاریخ',
          description: 'تاریخ را می‌توانید هم از تقویم به صورت روزهای خاص و هم بر اساس روزهای هفته انتخاب کنید',
          additionalDescription: '(وارد کردن حداقل یک تاریخ اجباری است)'
        },
        {
          id: 'signIn',
          name: 'ورود کاربران',
          title: 'ورود کاربران',
          description: 'کاربران می‌توانند با نام و رمز عبور (اختیاری) وارد شوند',
          additionalDescription: 'در این قسمت با استفاده از لینک تولید شده میتوانید دوستان خود را به رویداد دعوت کنید'
        },
        {
          id: 'groupAvailability',
          name: 'دسترسی گروهی',
          title: 'دسترسی گروهی',
          description: 'زمان‌های در دسترس کاربران نمایش داده می‌شود و بهترین زمان بر اساس رنگ‌بندی مشخص میشود',
          additionalDescription: ':راهنمای رنگ ها'
        }
      ]
    };
  },
  computed: {
    filteredSections() {
      return this.sections.filter(section => section.id === this.currentSection);
    }
  },
};
</script>

<style scoped>
.support-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  font-family: 'Tahoma', sans-serif;
}

h1 {
  font-size: 32px;
  color: #222;
  margin-bottom: 20px;
}

.menu {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.menu button {
  padding: 12px 18px;
  border: none;
  background-color: #a780cf;
  color: black;
  cursor: pointer;
  font-size: 18px;
  border-radius: 8px;
  transition: background 0.3s, transform 0.2s;
}

.menu button.active {
  background-color: #4A148C;
  color: white;
}

.content-box {
  background: #f3e5f5;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  text-align: center;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h2 {
  font-size: 26px;
  color: #4A148C;
  margin-bottom: 12px;
}

p {
  font-size: 20px;
  color: #222;
}

.legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.color-box {
  width: 25px;
  height: 25px;
  border-radius: 5px;
}

.purple-dark {
  background-color: #6a0dad;
}

.purple-medium {
  background-color: #a780cf;
}

.purple-light {
  background-color: #e0c3fc;
}
</style>
