particlesJS.load("particles-js", "./js/particles.json");

//CONFIGS
const host = "/";
let DRIVER_NAME = "";
let DRIVER_ID = '';

//INPUTS
let driver_id = $("input#driver-id");
let prefered_speed = $("input#prefered_speed");
let current_speed = $("input#current_speed");
let driver_name = $("input#driver_name");
let driver_nid = $("input#driver_nid");
let driver_phone = $("input#driver_phone");
let driver_vehicle_id = $("input#driver_vehicle_id");
let message = $("p#message");

//EVENT_LISTENERS
$("#pref_spd").text(prefered_speed.val() + " km/h");
$("#cur_spd").text(current_speed.val() + " km/h");

prefered_speed.on("input", (e) => {
  $("#pref_spd").text(e.target.value + " km/h");
});

current_speed.on("input", (e) => {
  $("#cur_spd").text(e.target.value + " km/h");
});

//FUNCTIONS
function checkCompletion() {

  DRIVER_ID = driver_id.val()

  if (!DRIVER_ID) {
    alert("Driver ID cannot be empty!");
    return;
  }

  $('button').html("FETCHING DATA")

  fetch(host + "compRate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Driver_id: DRIVER_ID,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      message.text(data.message);
      DRIVER_NAME = data.name
      $('#d_name').text(DRIVER_NAME)
      $('button').html("SUBMIT DATA")
    });
}

function speedCheck() {
  if (!DRIVER_ID) {
    alert("Driver ID cannot be empty!");
    return;
  }
  
  $('button').html("FETCHING DATA")

  fetch(host + "checkWarning", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      comfort_speed: prefered_speed.val(),
      rider_speed: current_speed.val(),
      Driver_id: DRIVER_ID,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      message.text(data.message);
      $('button').html("SUBMIT DATA")
    });
}

function checkReward() {
  if (!DRIVER_ID) {
    alert("Driver ID cannot be empty!");
    return;
  }

  $('button').html("FETCHING DATA")
  
  fetch(host + "checkReward", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Driver_id: DRIVER_ID,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      message.text('Your current reward point is ' + data[0].rewardPoint + ". Complete more comfortable rides to earn more points.");
      $('button').html("SUBMIT DATA")
    });
}

function register() {
  
  $('button').html("FETCHING DATA")

  fetch(host + "userReg", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "name": driver_name.val(),
      "phone": driver_phone.val(),
      "vehicle_id": driver_vehicle_id.val(),
      "nid": driver_nid.val()
  }),
  })
    .then((res) => res.json())
    .then((data) => {
      message.text(data.message);
      $('#d_name').text(driver_name.val())
      $('button').html("SUBMIT DATA")
    });
}