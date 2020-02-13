// Define a new component called todo-item
Vue.component('randonnee-item', {
  model: {
    prop: 'randonnee',
    event: 'select'
  },
  props: ['randonnee', 'selected'],
  template: `
  <li
    class="list-group-item"
    v-on:click="$emit('select', randonnee)"
    v-bind:class="{ active: selected }">
    {{ randonnee.title }}
  </li>`
})

var app = new Vue({
  el: '#app',
  created() {
    this.fetch();
  },
  mounted() {

  },
  data: {
    randonnees: [],
    selected: undefined,
    map: undefined
  },
  methods: {
    fetch() {
      axios.get('api/randonnees')
        .then(response => {
          this.randonnees = response.data;
          this.renderMap();
        });
    },
    select(randonnee) {
      axios.get(`api/randonnees/${randonnee.id}`)
        .then(response => {
          this.selected = response.data;

          const gpx = this.selected.gpx; // URL to your GPX file or the GPX itself
          new L.GPX(gpx, {async: true}).on('loaded', e => {
            this.map.fitBounds(e.target.getBounds());
          }).addTo(this.map);
        });
    },
    isSelected(randonnee) {
      if (this.selected) {
        return this.selected.id === randonnee.id
      }
      return false;
    },
    renderMap() {
      this.map = L.map('mapid').setView([-21.5, 166], 8);

      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoiYmx1ZW5jIiwiYSI6ImNrNmsxdG96bDAyOG8zbnM1d3d6bWMwbzcifQ.KKjzN1Zq6iP1zSVSnw6YIQ'
      }).addTo(this.map);
    },
    saveFile() {
      console.log('this.saveFile')
      const data = this.selected.gpx
      const blob = new Blob([data], {type: 'text/plain'})
      const e = document.createEvent('MouseEvents'),
      a = document.createElement('a');
      a.download = `${this.selected.title}.gpx`;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
    }
  }
})
