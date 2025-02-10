<template>
  <div class="availability-page" dir="rtl">
    <h1>{{ eventName }}</h1>
    <h3>
      برای دعوت افراد به این رویداد، این لینک را به اشتراک بگذارید:
      <a :href="eventLink" target="_blank">{{ eventLink }}</a>
    </h3>
    <div class="time-zone-box">
      <label>منطقه زمانی شما:</label>
      <select v-model="timeZone">
        <option v-for="zone in timeZones" :key="zone" :value="zone">
          {{ zone }}
        </option>
      </select>
    </div>

    <!-- Sign In Section -->
    <div v-if="!signedIn" class="sign-in">
      <div class="sign-in-form">
        <h3>ورود</h3>
        <label>نام شما:</label>
        <input v-model="userName" placeholder="نام خود را وارد کنید" type="text"/>
        <label>رمز عبور شما (اختیاری):</label>
        <input v-model="password" placeholder="رمز عبور خود را وارد کنید" type="password"/>
        <button @click="signIn">ورود</button>
        <p>نام/رمز عبور فقط برای این رویداد استفاده می‌شود</p>
      </div>
      <div class="availability-tables table group-table">
        <h2>زمان های دسترسی گروه</h2>
        <table>
          <thead>
          <tr>
            <th v-for="day in selectedDays" :key="day">{{ day }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="hour in filteredHours" :key="hour">
            <td v-for="day in selectedDays" :key="day"
                :class="getGroupCellClass(day, hour)"
                class="hour-cell"
                @click="toggleUserList(day, hour)"
            >
              {{ hour }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Availability -->
    <div v-else>
      <h1>جداول دسترسی</h1>
      <div class="availability-tables direction-tables">


        <div class="table group-table">
          <h2>زمان های دسترسی گروه</h2>
          <table>
            <thead>
            <tr>
              <th v-for="day in selectedDays" :key="day">{{ day }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="hour in filteredHours" :key="hour">
              <td v-for="day in selectedDays" :key="day"
                  :class="getGroupCellClass(day, hour)"
                  class="hour-cell"
                  @click="toggleUserList(day, hour)"
              >
                {{ hour }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="table user-table">
          <h2>زمان دسترسی کاربر {{ userName }}</h2>
          <table>
            <thead>
            <tr>
              <th v-for="day in selectedDays" :key="day">{{ day }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="hour in filteredHours" :key="hour">
              <td v-for="day in selectedDays" :key="day"
                  :class="getUserCellClass(day, hour)"
                  class="hour-cell"
                  @click="toggleAvailability(day, hour)">
                {{ hour }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Available / Unavailable Users Table -->
    <div v-if="showUsers" class="user-list">
      <h3>کاربران انتخاب‌شده</h3>
      <table>
        <thead>
        <tr>
          <th>در دسترس</th>
          <th>غیر در دسترس</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>
            <ul>
              <li v-for="user in availableUsers" :key="user">{{ user }}</li>
            </ul>
          </td>
          <td>
            <ul>
              <li v-for="user in unavailableUsers" :key="user">{{ user }}</li>
            </ul>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'; // Assuming api is set up for axios
export default {
  data() {
    const eventId = this.$route.query.id; // دریافت ID از URL
    return {
      eventName: "",
      eventLink: eventId ? `http://localhost:8080/event?id=${eventId}` : "", // تنظیم لینک
      timeZone: "Asia/Tehran",
      timeZones: [],
      userName: "",
      password: "",
      signedIn: false,
      selectedDays: [],
      startTime: "09:00:00",
      endTime: "17:00:00",
      hours: [],
      availability: JSON.parse(localStorage.getItem("availability")) || {},
      showUsers: false,
      selectedCell: null,
      availableUsers: [],
      unavailableUsers: [],
      tempUser: JSON.parse(localStorage.getItem("tempUser")) || [],
      tempUser2: JSON.parse(localStorage.getItem("tempUser2")) || [],
      all_event_availabilities: [],
      attendee_availabilities: [],
      attendees_with_availability_count: 0,
      eventType: 0,

    };
  },
  computed: {
    filteredHours() {
      return this.hours;
    },
    hasSelection() {
      return Object.keys(this.availability).some(key => this.availability[key].length > 0);
    }
  },
  methods: {
    async signIn() {
      if (this.userName.trim() === "") {
        alert("Please enter your name.");
        return;
      }

      const data = {
        name: this.userName.trim(),
        password: this.password.trim() || undefined,
      };

      try {
        const response = await api.post(`/event/${this.$route.query.id}/signin/`, data);

        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        localStorage.setItem("expireTime", response.data.access_expires);
        this.signedIn = true;
      } catch (error) {
        console.error("Error during sign in:", error);
        alert("There was an error signing in. Please try again.");
      }
    },
    convertTo24HourFormat(dateString) {
      const [date, time, period] = dateString.split(' ');
      let [hour, minute] = time.split(':');

      if (!minute) {
        minute = '00';
      }
      if (period === 'PM' && hour !== '12') {
        hour = (parseInt(hour) + 12).toString();
      } else if (period === 'AM' && hour === '12') {
        hour = '00';
      }
      if (hour.length > 1) {
        return `${date}T${hour}:${minute}:00`;
      } else {
        return `${date}T0${hour}:${minute}:00`;
      }
    },


    toggleAvailability(day, hour) {
      if (this.eventType === 0) {
        const key = `${day} ${hour}`;
        console.log(key)
        const selectedDate = new Date(this.convertTo24HourFormat(key));
        const startTime = new Date(selectedDate);
        const endTime = new Date(selectedDate);
        endTime.setHours(startTime.getHours() + 1);
        const startIso = startTime.toISOString();
        const endIso = endTime.toISOString();

        // بررسی اینکه آیا سلول در حال حاضر انتخاب شده است یا نه
        const isCurrentlySelected = this.attendee_availabilities.some(temp =>
            new Date(temp.start_time).getTime() === new Date(startIso).getTime()
        );

        if (isCurrentlySelected) {
          this.removeAvailabilityDate(startIso, endIso); // اگر انتخاب شده بود، حذف کن
        } else {
          this.sendAvailabilityDate(startIso, endIso); // اگر انتخاب نشده بود، اضافه کن
        }
      } else if (this.eventType === 1) {
        const isCurrentlySelected = this.attendee_availabilities.some(temp =>
            temp.start_time === hour && temp.day === day
        );

        if (isCurrentlySelected) {
          this.removeAvailabilityDay(day, hour); // اگر انتخاب شده بود، حذف کن
        } else {
          this.sendAvailabilityDay(day, hour); // اگر انتخاب نشده بود، اضافه کن
        }
      }

    },
    sendAvailabilityDay(day, hour) {
      api.post(`/event/${this.$route.query.id}/dayofweekavailability/`, {
        day: day,
        start_time: hour
      })
          .then(response => {
            console.log('زمان در دسترس اضافه شد:', response);
            this.fetchEventData();
          })
          .catch(error => {
            console.error('خطا در افزودن زمان:', error);
          });
    },
    removeAvailabilityDay(day, hour) {
      api.delete(`/event/${this.$route.query.id}/availability/`, {
        data: {
          day: day,
          start_time: hour
        }
      })
          .then(response => {
            console.log('زمان حذف شد:', response);
            this.fetchEventData(); // به‌روزرسانی داده‌ها
          })
          .catch(error => {
            console.error('خطا در حذف زمان:', error);
          });
    },
    sendAvailabilityDate(startIso, endIso) {
      const data = {
        start_time: startIso,
        end_time: endIso
      };

      api.post(`/event/${this.$route.query.id}/availability/`, data)
          .then(response => {
            console.log('زمان در دسترس اضافه شد:', response);
            this.fetchEventData();
          })
          .catch(error => {
            console.error('خطا در افزودن زمان:', error);
          });
    },

    removeAvailabilityDate(startIso, endIso) {
      api.delete(`/event/${this.$route.query.id}/availability/`, {
        data: {
          start_time: startIso,
          end_time: endIso
        }
      })
          .then(response => {
            console.log('زمان حذف شد:', response);
            this.fetchEventData();
          })
          .catch(error => {
            console.error('خطا در حذف زمان:', error);
          });
    },


    getUserCellClass(day, hour) {
      const key = `${day} ${hour}`;
      return this.attendee_availabilities.some(temp => {
        if(this.eventType === 0){
          return new Date(temp.start_time).getTime() === new Date(this.convertTo24HourFormat(key)).getTime()
        }
        else if(this.eventType === 1){
          return temp.start_time === hour && temp.day === day
        }
      }) ? "selected" : "";
    },

    getGroupCellClass(day, hour) {
      const key = `${day} ${hour}`;
      console.log(hour)

      const totalUserPickThisTime = this.all_event_availabilities.filter(temp => {
            if (this.eventType === 0) {
              return new Date(temp.start_time).getTime() === new Date(this.convertTo24HourFormat(key)).getTime()
            } else if (this.eventType === 1) {
              return temp.start_time === hour && temp.day === day
            }
          }
      );
      const totallUserTimeSelectGroup = this.attendees_with_availability_count;

      if (totallUserTimeSelectGroup === 1) {
        if (totalUserPickThisTime.length === 1)
          return "green"; // فقط یک کاربر انتخاب کرده است (سبز)
      } else if (totallUserTimeSelectGroup === 2) {

        if (totalUserPickThisTime.length === 1) return "yellow"; // یکی انتخاب کرده است (زرد)
        else if (totalUserPickThisTime.length === 2) return "green";
      } else if (totallUserTimeSelectGroup >= 3) {
        if (totalUserPickThisTime.length === totallUserTimeSelectGroup) return "green"; // همه انتخاب کرده‌اند (سبز)
        if (totalUserPickThisTime.length >= 2 && totalUserPickThisTime.length <= totallUserTimeSelectGroup - 1) return "red"; // دو نفر انتخاب کرده‌اند و یک نفر نه (قرمز)
        if (totalUserPickThisTime.length === 1) return "yellow"; // فقط یک نفر انتخاب کرده است (زرد)
      }
      return "";
    },
    toggleUserList(day, hour) {
      const key = `${day} ${hour}`;
      if (this.selectedCell === key) {
        // If the same cell is clicked again, hide the user list
        this.showUsers = !this.showUsers;
      } else {
        // If a different cell is clicked, show the user list and update selected cell
        this.selectedCell = key;
        this.showUserList(day, hour);
      }
    },

    showUserList(day, hour) {
      const key = `${day} ${hour}`;
      console.log(hour)
      this.showUsers = true;
      const allUserByName = [...new Set(this.all_event_availabilities.map(user => user.attendee))]
      const usersForHour = [...new Set(this.all_event_availabilities.filter(temp => {
          if(this.eventType === 0){
            return new Date(temp.start_time).getTime() === new Date(this.convertTo24HourFormat(key)).getTime()
          }
       else if(this.eventType===1){
            return temp.start_time === hour && temp.day === day
          }
    }).map(user => user.attendee))]

      if (usersForHour.length > 0) {
        this.availableUsers = usersForHour;
        this.unavailableUsers = [...new Set(allUserByName.filter(temp =>
            !usersForHour.some(picked => picked === temp)
        ))];
      } else {
        this.availableUsers = [];
        this.unavailableUsers = allUserByName;
      }
    },

    async fetchEventData() {
      try {
        const response = await api.get(`/event/${this.$route.query.id}`);
        const event = response.data.event;
        this.timeZones = response.data.timezone_options;
        this.eventName = event.name;
        this.startTime = event.start_time;
        this.endTime = event.end_time;
        this.all_event_availabilities = response.data.all_event_availabilities;
        this.attendee_availabilities = response.data.attendee_availabilities;
        this.attendees_with_availability_count = response.data.attendees_with_availability_count;
        this.eventType = event.event_type;

        if (event.event_type === 0) {
          this.selectedDays = event.dates.map(d => d.date);
          console.log(this.selectedDays)
        } else if (event.event_type === 1) {
          this.selectedDays = event.days_of_week.map(d => d.day_label);
          console.log(this.selectedDays)
        }
        this.generateHours();
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    },

    generateHours() {
      const startHour = parseInt(this.startTime.split(":")[0]);
      const startMinute = this.startTime.split(":")[1];
      const endHour = parseInt(this.endTime.split(":")[0]);
      this.hours = [];

      for (let hour = startHour; hour <= endHour; hour++) {
        this.hours.push(`${String(hour).padStart(2, '0')}:${startMinute}`);
      }
    }
  },
  mounted() {
    this.fetchEventData();
  },
};
</script>

<style scoped>
/* Base styles */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Poppins', sans-serif;
}

.availability-page {
  background: linear-gradient(135deg, #a8c0ff, #d3d3d3, #8e44ad);
  color: #333;
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 30px;
  min-height: 100vh;
}

h1 {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: left;
}

h3 {
  color: #333;
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

/* Sign-in form */
.sign-in {
  display: flex;
  flex-direction: column;
}

.sign-in-form {
  margin: auto;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

input {
  width: 100%;
  padding: 15px;
  font-size: 18px;
  border-radius: 30px;
  border: 3px solid #5e54e0;
  background-color: #fff;
  color: #333;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.1);
  outline: none;
  margin-bottom: 20px;
  transition: all 0.3s ease-in-out;
}

input:focus {
  border-color: #6c63ff;
  transform: scale(1.05);
  box-shadow: 0px 4px 20px rgba(108, 99, 255, 0.3);
}

input:hover {
  border-color: #6c63ff;
}

/* Time Zone Select */
.time-zone-box {
  width: 100%;
  max-width: 400px;
}

select {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  font-size: 16px;
  border-radius: 8px;
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
}

/* Tables for availability */
.availability-tables {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.user-table, .group-table {
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.table {
  border: 3px solid #5e54e0;
  padding: 10px;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 10px;
}

th, td {
  padding: 15px;
  text-align: center;
  font-size: 16px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

th {
  background-color: #6c63ff;
  color: white;
  font-size: 18px;
}

.hour-cell {
  background: #f4f4f4;
  cursor: pointer;
  border-radius: 5px;
  margin: 2px 0;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.hour-cell:hover {
  background: #e4e4e4;
  transform: scale(1.05);
}

.hour-cell.selected {
  background: #6c63ff;
  color: white;
}

.hour-cell.green {
  background: #6c63ff;
  color: white;
}

.hour-cell.yellow {
  background: rgba(157, 155, 225, 0.82);
}

.hour-cell.red {
  background: rgba(104, 102, 166, 0.82);
  color: white;
}

/* For the Available and Unavailable Users List */
.user-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-list li {
  color: black;
  padding: 10px;
  border-radius: 20px;
  text-align: center;
  font-size: 1.5em;
}

.user-list th {
  background-color: black;
  color: white;
}

</style>

