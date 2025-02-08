<template>
  <div class="availability-page">
    <h1>{{ eventName }}</h1>
    <p>
      To invite people to this event, share this link:
      <a :href="eventLink" target="_blank">{{ eventLink }}</a>
    </p>
    <div>
      <label>Your Time Zone:</label>
      <select v-model="timeZone">
        <option v-for="zone in timeZones" :key="zone" :value="zone">
          {{ zone }}
        </option>
      </select>
    </div>

    <!-- Sign In Section -->
    <div v-if="!signedIn" class="sign-in">
      <div>
        <h3>Sign In</h3>
        <label>Your Name:</label>
        <input type="text" v-model="userName" placeholder="Enter your name" />
        <!--      <label>Password (optional):</label>-->
        <!--      <input type="password" v-model="password" placeholder="Enter password" />-->
        <button @click="signIn">Sign In</button>
        <p>Name/Password are only for this event.</p>
      </div>
      <div>
        <div class="availability-tables table group-table">
          <h3>Group Availability</h3>
          <table>
            <thead>
            <tr>
              <th v-for="day in selectedDays" :key="day">{{ day }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="hour in filteredHours" :key="hour">
              <td v-for="day in selectedDays" :key="day"
                  class="hour-cell"
                  :class="getGroupCellClass(day, hour)">
                {{ hour }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Group Availability -->
<!--    <div class="group-availability">-->
<!--      <h3>Group's Availability</h3>-->
<!--      <div class="calendar">-->
<!--        <div v-for="(day, index) in selectedDays" :key="index" class="day-column">-->
<!--          <div class="day-header">{{ day }}</div>-->
<!--          <div-->
<!--              v-for="hour in filteredHours"-->
<!--              :key="hour"-->
<!--              class="hour-cell"-->
<!--              :class="{ selected: isSelected(day, hour) }"-->
<!--              @click="toggleAvailability(day, hour)"-->
<!--          >-->
<!--            {{ hour }}-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->



    <div v-else>
      <h1>Availability Selection</h1>
      <div class="availability-tables">
        <div class="table user-table">
          <h3>{{ userName }}'s Availability</h3>
          <table>
            <thead>
            <tr>
              <th v-for="day in selectedDays" :key="day">{{ day }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="hour in filteredHours" :key="hour">
              <td v-for="day in selectedDays" :key="day"
                  class="hour-cell"
                  :class="getUserCellClass(day, hour)"
                  @click="toggleAvailability(day, hour)">
                {{ hour }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div class="table group-table">
          <h3>Group Availability</h3>
          <table>
            <thead>
            <tr>
              <th v-for="day in selectedDays" :key="day">{{ day }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="hour in filteredHours" :key="hour">
              <td v-for="day in selectedDays" :key="day"
                  class="hour-cell"
                  :class="getGroupCellClass(day, hour)">
                {{ hour }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      eventName: this.$route.query.eventName || "My Event",
      eventLink: "https://example.com/event-link",
      timeZone: "Asia/Tehran",
      timeZones: ["Asia/Tehran", "America/New_York", "Europe/London", "UTC"],
      userName: "",
      signedIn: false,
      password: "",
      selectedDays: this.$route.query.selectedDays || [],
      timeStart: this.$route.query.timeStart || "9:00 AM",
      timeEnd: this.$route.query.timeEnd || "5:00 PM",
      hours: ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"],
      availability: JSON.parse(localStorage.getItem("availability")) || {}
    };
  },
  computed: {
    filteredHours() {
      const startIndex = this.hours.indexOf(this.timeStart);
      const endIndex = this.hours.indexOf(this.timeEnd);
      return this.hours.slice(startIndex, endIndex + 1);
    },
  },
  methods: {
    // signIn() {
    //   alert(`Signed in as ${this.userName}`);
    //   // هدایت به صفحه سوم
    //   this.$router.push({ path: '/available', query: { userName: this.userName, eventName: this.eventName, selectedDays: this.selectedDays, timeStart: this.timeStart, timeEnd: this.timeEnd } });
    // },
    signIn() {
      if (this.userName.trim() !== "") {
        this.signedIn = true;
      }
    },

    toggleAvailability(day, hour) {
      const key = `${day}-${hour}`;
      if (!this.availability[key]) {
        this.availability[key] = [];
      }
      if (this.availability[key].includes(this.userName)) {
        this.availability[key] = this.availability[key].filter(user => user !== this.userName);
      } else {
        this.availability[key].push(this.userName);
      }
      localStorage.setItem("availability", JSON.stringify(this.availability));
    },
    getUserCellClass(day, hour) {
      const key = `${day}-${hour}`;
      return this.availability[key] && this.availability[key].includes(this.userName) ? "selected" : "";
    },
    getGroupCellClass(day, hour) {
      const key = `${day}-${hour}`;
      const users = this.availability[key] || [];
      if (users.length === 1) return "single";
      if (users.length > 1 && users.length < 3) return "multiple";
      if (users.length >= 3) return "all-selected";
      return "";
    },
  },
};
</script>

<style scoped>
.availability-page {
  font-family: Arial, sans-serif;
  padding: 20px;
}
.sign-in {
  margin-top: 20px;
}
.calendar {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.day-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.day-header {
  font-weight: bold;
}
.hour-cell {
  background: #ddd;
  padding: 5px;
  width: 80px;
  text-align: center;
  cursor: pointer;
  border-radius: 5px;
  margin: 2px 0;
}
.hour-cell.selected {
  background: #77dd77;
  color: white;
}



.availability-page {
  font-family: Arial, sans-serif;
  padding: 20px;
  text-align: center;
}
.signin-form {
  margin-bottom: 20px;
}
input {
  padding: 5px;
  margin-right: 10px;
}
button {
  padding: 5px 10px;
  cursor: pointer;
}
.availability-tables {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.table {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
}
.hour-cell {
  padding: 8px;
  text-align: center;
  cursor: pointer;
}
.hour-cell.selected {
  background: #77dd77;
  color: white;
}
.hour-cell.single {
  background: #4caf50;
  color: white;
}
.hour-cell.multiple {
  background: yellow;
}
.hour-cell.all-selected {
  background: red;
  color: white;
}
</style>
