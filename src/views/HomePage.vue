<template>
  <div class="main-container">
    <h1>Plan a New Event</h1>

    <!-- New Event Name -->
    <div class="event-name">
      <input type="text" placeholder="New Event Name" v-model="eventName" />
    </div>

    <!-- What dates might work? -->
    <div class="date-selection">
      <h3>What dates might work?</h3>
      <p>Click and drag dates to choose possibilities.</p>
      <label>
        Survey using:
        <select v-model="surveyType">
          <option value="specific">Specific Dates</option>
          <option value="days">Days of the Week</option>
        </select>
      </label>

      <!-- Calendar for Specific Dates -->
      <div v-if="surveyType === 'specific'" class="calendar-container">
        <div class="calendar-header">
          <button @click="prevMonth">&#8592;</button>
          <span>{{ monthNames[currentMonth] }} {{ currentYear }}</span>
          <button @click="nextMonth">&#8594;</button>
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

    <!-- What times might work? -->
    <div class="time-selection">
      <h3>What times might work?</h3>
      <label>
        No earlier than:
        <select v-model="timeStart">
          <option v-for="time in timeOptions" :key="time" :value="time">
            {{ time }}
          </option>
        </select>
      </label>
      <label>
        No later than:
        <select v-model="timeEnd">
          <option v-for="time in timeOptions" :key="time" :value="time">
            {{ time }}
          </option>
        </select>
      </label>

      <label>
        Time Zone:
        <select v-model="timeZone">
          <option v-for="zone in timeZones" :key="zone" :value="zone">
            {{ zone }}
          </option>
        </select>
      </label>
    </div>

    <!-- Ready Button -->
    <div class="create-event">
      <button @click="goToEventPage">Create Event</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    const today = new Date();
    return {
      eventName: "",
      surveyType: "specific", // Default to Specific Dates
      currentMonth: today.getMonth(),
      currentYear: today.getFullYear(),
      daysInMonth: this.getDaysInMonth(today.getFullYear(), today.getMonth()),
      dayNames: ["S", "M", "T", "W", "T", "F", "S"],
      monthNames: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      daysOfWeek: [
        { name: "Sunday", selected: false },
        { name: "Monday", selected: false },
        { name: "Tuesday", selected: false },
        { name: "Wednesday", selected: false },
        { name: "Thursday", selected: false },
        { name: "Friday", selected: false },
        { name: "Saturday", selected: false },
      ],
      timeStart: "9:00 AM",
      timeEnd: "5:00 PM",
      timeOptions: [
        "12:00 AM",
        "1:00 AM",
        "2:00 AM",
        "3:00 AM",
        "4:00 AM",
        "5:00 AM",
        "6:00 AM",
        "7:00 AM",
        "8:00 AM",
        "9:00 AM",
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "1:00 PM",
        "2:00 PM",
        "3:00 PM",
        "4:00 PM",
        "5:00 PM",
        "6:00 PM",
        "7:00 PM",
        "8:00 PM",
        "9:00 PM",
        "10:00 PM",
        "11:00 PM",
      ],
      timeZone: "Asia/Tehran",
      timeZones: ["Asia/Tehran", "America/New_York", "Europe/London", "UTC"],
    };
  },
  methods: {
    getDaysInMonth(year, month) {
      const date = new Date(year, month, 1);
      const days = [];
      while (date.getMonth() === month) {
        days.push({
          day: date.getDate(),
          currentMonth: true,
          selected: false,
        });
        date.setDate(date.getDate() + 1);
      }

      // Add padding for the first week
      const firstDay = new Date(year, month, 1).getDay();
      for (let i = 0; i < firstDay; i++) {
        days.unshift({ day: "", currentMonth: false, selected: false });
      }

      return days;
    },
    toggleDateSelection(date) {
      if (date.currentMonth) {
        date.selected = !date.selected;
        console.log("Day selected:", date.day, "Selected status:", date.selected);
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
      console.log(day.name, day.selected);
    },
    goToEventPage() {
      // بررسی روزهای انتخاب‌شده از تقویم
      const selectedCalendarDays = this.daysInMonth.filter(date => date.selected);
      // بررسی روزهای انتخاب‌شده از روزهای هفته
      const selectedWeekDays = this.daysOfWeek.filter(day => day.selected);

      // ترکیب روزهای انتخاب‌شده
      const selectedDays = [
        ...selectedCalendarDays.map(day => day.day), // روزهای تقویم
        ...selectedWeekDays.map(day => day.name), // روزهای هفته
      ];

      // نمایش جزئیات رویداد
      const eventDetails = {
        eventName: this.eventName,
        selectedDays: selectedDays, // ذخیره همه روزهای انتخاب‌شده
        timeStart: this.timeStart,
        timeEnd: this.timeEnd,
      };
      console.log("Event Details:", eventDetails);

      // اگر هیچ روزی انتخاب نشده باشد، نمایش پیغام خطا
      if (selectedDays.length === 0) {
        alert('Please select at least one day.');
        return;
      }

      // ارسال داده‌ها به صفحه رویداد
      this.$router.push({ path: "/event", query: eventDetails });
    }



  },
};
</script>

<style scoped>
.main-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.event-name input {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 16px;
}
.date-selection,
.time-selection {
  margin-top: 20px;
}
label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}
.calendar-container {
  text-align: center;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}
.day-name {
  font-weight: bold;
  text-align: center;
}
.day {
  background: #ddd;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  border-radius: 5px;
}
.day.selected {
  background: #ff6961;
  color: #fff;
}
.days-of-week {
  display: flex;
  gap: 10px;
}
.day-option {
  background: #ddd;
  padding: 10px 15px;
  text-align: center;
  cursor: pointer;
  border-radius: 5px;
}
.day-option.selected {
  background: #77dd77;
  color: #fff;
}
.create-event {
  margin-top: 30px;
}
button {
  background: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
}
button:hover {
  background: #45a049;
}
</style>

