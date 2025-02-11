<template>
  <div class="main-container" dir="rtl">
    <h1>برنامه‌ریزی برای رویداد جدید</h1>
    <div class="event-name">
      <h2>یک نام برای رویداد خود انتخاب کنید</h2>
      <input type="text" placeholder="نام رویداد جدید" v-model="eventName" />
    </div>

    <div class="date-selection">
      <h2>کدام تاریخ‌ها برای شما مناسب است؟</h2>
      <h3>برای انتخاب، روی تاریخ مد نظر کلیک کنید</h3>
      <label>
        <h3>انتخاب تاریخ با استفاده از:</h3>
        <select v-model="surveyType">
          <option value="specific">تاریخ‌های خاص</option>
          <option value="days">روزهای هفته</option>
        </select>
      </label>

      <!-- Calendar for Specific Dates -->
      <div v-if="surveyType === 'specific'" class="calendar-container">
        <div class="calendar-header">
          <button @click="nextMonth">&#8594;</button>
          <span>{{ monthNames[currentMonth] }} {{ currentYear }}</span>
          <button @click="prevMonth">&#8592;</button>
        </div>
        <div class="calendar">
          <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>
          <div
              v-for="(date, index) in daysInMonth"
              :key="index"
              class="day"
              :class="{ selected: date.selected, disabled: !date.currentMonth }"
              @click="toggleDateSelection(date)"
          >
            {{ date.day }}
          </div>
        </div>
      </div>

      <!-- Days of the Week -->
      <div v-else-if="surveyType === 'days'" class="days-of-week">
        <div
            class="day-option"
            v-for="(day, index) in daysOfWeek"
            :key="index"
            :class="{ selected: day.selected }"
            @click="toggleDayOfWeekSelection(day)"
        >
          {{ day.name }}
        </div>
      </div>
    </div>

    <!-- Time and Timezone Selection -->
    <div class="time-zone-selection">
      <h2>چه ساعاتی برای شما مناسب است؟</h2>
      <div class="time-zone-box">
        <label>
          <h3>زودتر از این ساعت نباشد:</h3>
          <select v-model="timeStart">
            <option v-for="time in noEarlierThan" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </label>
        <label>
          <h3>دیرتر از این ساعت نباشد:</h3>
          <select v-model="timeEnd">
            <option v-for="time in noLaterThan" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </label>

        <label>
          <h3>منطقه زمانی:</h3>
          <select v-model="timeZone">
            <option v-for="zone in timeZones" :key="zone" :value="zone">
              {{ zone }}
            </option>
          </select>
        </label>
      </div>
    </div>

    <!-- Ready Button -->
    <div class="create-event">
      <button @click="createEvent">ایجاد رویداد</button>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'; // Assuming api is set up for axios
import moment from "jalali-moment";
export default {
  data() {
    const today = moment().locale("fa");
    return {
      eventName: "",
      surveyType: "specific", // Default to Specific Dates
      currentMonth: today.jMonth(),
      currentYear: today.jYear(),
      daysInMonth: this.getDaysInMonth(today.jYear(), today.jMonth()),
      dayNames: ["شنبه", "یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه"],
      monthNames: [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
      ],
      daysOfWeek: [
        { name: "شنبه", selected: false },
        { name: "یکشنبه", selected: false },
        { name: "دوشنبه", selected: false },
        { name: "سه‌شنبه", selected: false },
        { name: "چهارشنبه", selected: false },
        { name: "پنج‌شنبه", selected: false },
        { name: "جمعه", selected: false }
      ],
      timeStart: "12:00 AM",
      timeEnd: "11:00 PM",
      noEarlierThan: [],
      noLaterThan: [],
      timeZone: "Asia/Tehran",
      timeZones: [],
      dateOptions: []
    };
  },
  mounted() {
    this.fetchEventOptions();
  },
  methods: {
    async fetchEventOptions() {
      try {
        const response = await api.get("/event/options");
        this.dateOptions = response.data.date_options;
        this.noEarlierThan = response.data.time_options.no_earlier_than;
        this.noLaterThan = response.data.time_options.no_later_than;
        this.timeZones = response.data.time_zones;
      } catch (error) {
        console.error("API Request Failed:", error);
      }
    },
    getDaysInMonth(year, month) {
      const days = [];
      const firstDayOfMonth = moment(`${year}/${month + 1}/1`, "jYYYY/jM/jD").jDay(); // اصلاح شده
      const daysCount = moment.jDaysInMonth(year, month);

      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ day: "", currentMonth: false });
      }

      for (let i = 1; i <= daysCount; i++) {
        days.push({
          day: i,
          currentMonth: true,
          selected: false
        });
      }

      return days;
    },



    toggleDateSelection(date) {
      if (date.currentMonth) {
        date.selected = !date.selected;
      }
    },
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11;
        this.currentYear--;
      } else {
        this.currentMonth--;
      }
      this.daysInMonth = this.getDaysInMonth(this.currentYear, this.currentMonth);
    },
    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0;
        this.currentYear++;
      } else {
        this.currentMonth++;
      }
      this.daysInMonth = this.getDaysInMonth(this.currentYear, this.currentMonth);
    },
    toggleDayOfWeekSelection(day) {
      day.selected = !day.selected;
    },
    convertTo24HourFormat(time) {
      let hour = parseInt(time.split(":")[0]);
      let minute = time.split(":")[1].slice(0, 2);
      let period = time.slice(-2);

      if (period === "AM" && hour === 12) {
        hour = 0;
      } else if (period === "PM" && hour !== 12) {
        hour += 12;
      }

      return `${hour < 10 ? "0" + hour : hour}:${minute}:00`;
    },

    async createEvent() {
      const selectedDates = this.daysInMonth
          .filter(date => date.selected)
          .map(day => ({
            date: `1403-${(this.currentMonth + 1).toString().padStart(2, '0')}-${day.day.toString().padStart(2, '0')}`
          }));

      const selectedDaysOfWeek = this.daysOfWeek
          .filter(day => day.selected)
          .map(day => ({ day: day.name }));

      const eventDetails = {
        name: this.eventName,
        timezone: this.timeZone,
        start_time: this.convertTo24HourFormat(this.timeStart),
        end_time: this.convertTo24HourFormat(this.timeEnd),
        event_type: this.surveyType === "days" ? "Days of Week" : "Specific Dates",
      };

      if (this.surveyType === "specific") {
        eventDetails.dates = selectedDates;
      } else if (this.surveyType === "days") {
        eventDetails.days_of_week = selectedDaysOfWeek;
      }

      if ((!selectedDates.length && this.surveyType === "specific") ||
          (!selectedDaysOfWeek.length && this.surveyType === "days") ||
          !this.eventName) {
        this.$toast.open({
          message: 'لطفاً یک نام برای رویداد وارد کنید و حداقل یک روز یا تاریخ را انتخاب کنید.',
          type: "error",
          position: "bottom-left",
          duration: 5000,
          dismissible: true,
        });
        return;
      }

      try {
        const response = await api.post('/event/create/', eventDetails);
        console.log('Event Created:', response.data);
        this.$toast.open({
          message: 'رویدادی جدید با موفقیت ایجاد شد',
          type: "success",
          position: "bottom-left",
          duration: 5000,
          dismissible: true,
        });
        const eventLink = response.data.event_link;
        const eventUUID = eventLink.split('/').pop();

        this.$router.push({ path: '/event', query: { id: eventUUID } });
      } catch (error) {
        console.error('Failed to create event:', error);
        this.$toast.open({
          message: 'خطا در ایجاد رویداد. لطفاً دوباره تلاش کنید',
          type: "error",
          position: "bottom-left",
          duration: 5000,
          dismissible: true,
        });
      }
    }



  },
};
</script>


<style scoped>
/* به body و html بدون فاصله اعمال کنید */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* پس‌زمینه به کل صفحه اعمال می‌شود */
.main-container {
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(135deg, #a8c0ff, #d3d3d3, #8e44ad); /* Light gray background */
  color: #333;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  padding: 30px;
  box-sizing: border-box;
  min-height: 100vh; /* اطمینان از اینکه کل صفحه پر می‌شود */
}



h1 {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: left;
}

.event-name input {
  width: 300px;
  padding: 15px;
  margin-bottom: 25px;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  border: #5e54e0 solid 3px;
  background-color: #fff;
  color: #333;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

select {
  width: 97.5%;
  padding: 12px;
  margin: 10px 0;
  font-size: 16px;
  border-radius: 8px;
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
}

button {
  background: #6c63ff;
  color: #fff;
  padding: 15px 30px;
  border: none;
  font-size: 18px;
  cursor: pointer;
  border-radius: 50px;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #5e54e0;
}
.date-selection{
  margin: auto;
  width: 70%;
}
.calendar-container {
  text-align: center;
  background: #fff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
  width: 95%;
  margin-bottom: 30px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day-name {
  font-weight: bold;
}

.day {
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  background-color: #f4f4f4;
  transition: background-color 0.3s;
}

.day:hover {
  background-color: #d9d9d9;
}

.day.selected {
  background-color: #6c63ff;
  color: #fff;
}

.day.disabled {
  cursor: not-allowed;
}

.days-of-week {
  display: flex;
  justify-content: space-evenly;
  margin-top: 20px;
}

.day-option {
  padding: 15px;
  cursor: pointer;
  border-radius: 8px;
  background-color: white;
  border: #6c63ff solid 3px ;
  color: black;
  transition: background-color 0.3s;
}

.day-option.selected {
  background-color: #6c63ff;
  color: white;
}

.time-zone-box {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 40px;
}

.event-name {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 400px; /* عرض حداکثر برای جلوگیری از گسترش زیاد */
  margin: 0 auto 40px auto;
  text-align: center;
}

.event-name h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.event-name input {
  width: 100%;
  padding: 15px;
  font-size: 18px;
  border-radius: 30px;
  border: 3px solid #5e54e0;
  background-color: #fff;
  color: #333;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
  outline: none;
  transition: all 0.3s ease-in-out;
  margin-bottom: 20px;
}

/* تغییر استایل هنگام فوکوس */
.event-name input:focus {
  border-color: #6c63ff;
  transform: scale(1.05);
  box-shadow: 0px 4px 20px rgba(108, 99, 255, 0.3);
}

/* افکت هنگام hover */
.event-name input:hover {
  border-color: #6c63ff;
}
.create-event{
  margin: auto;
}
</style>
