<template>
  <div class="main-container">
    <h1>Plan a New Event</h1>

    <!-- New Event Name -->
    <div class="event-name">
      <h2>pick a name for your event</h2>
      <input type="text" placeholder="New Event Name" v-model="eventName" />
    </div>

    <!-- What dates might work? -->
    <div class="date-selection">
      <h2>What dates might work?</h2>
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

    <!-- Time and Timezone Selection -->
    <div class="time-zone-selection">
      <h2>What times might work?</h2>
      <div class="time-zone-box">
        <label>
          No earlier than:
          <select v-model="timeStart">
            <option v-for="time in noEarlierThan" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </label>
        <label>
          No later than:
          <select v-model="timeEnd">
            <option v-for="time in noLaterThan" :key="time" :value="time">
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
    </div>

    <!-- Ready Button -->
    <div class="create-event">
      <button @click="createEvent">Create Event</button>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'; // Assuming api is set up for axios

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
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December",
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

      return `${hour < 10 ? "0" + hour : hour}:${minute}:00`; // به فرمت HH:mm:ss
    },

    async createEvent() {
      const selectedCalendarDays = this.daysInMonth.filter(date => date.selected);
      const selectedWeekDays = this.daysOfWeek.filter(day => day.selected);

      const selectedDays = [
        ...selectedCalendarDays.map(day => ({
          date: `2025-${(this.currentMonth + 1).toString().padStart(2, '0')}-${day.day.toString().padStart(2, '0')}`
        })),
        ...selectedWeekDays.map(day => ({ date: day.name })),
      ];

      const eventDetails = {
        name: this.eventName,
        timezone: this.timeZone,
        start_time: this.convertTo24HourFormat(this.timeStart),
        end_time: this.convertTo24HourFormat(this.timeEnd),
        dates: selectedDays,
      };

      if (selectedDays.length === 0 || !this.eventName) {
        alert('Please select at least one day and provide an event name.');
        return;
      }

      try {
        const response = await api.post('/event/create/', eventDetails);
        console.log('Event Created:', response.data);

        const eventLink = response.data.event_link;
        const eventUUID = eventLink.split('/').pop();


        this.$router.push({ path: '/event', query: { id: eventUUID } });

      } catch (error) {
        console.error('Failed to create event:', error);
        alert('Error creating event. Please try again.');
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
