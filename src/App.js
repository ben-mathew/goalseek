// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

/*App.js*/

// import React from 'react';
// import { GoogleLogin } from '@react-oauth/google';

// function App() {
//     const responseMessage = (response) => {
//         console.log(response);
//     };
//     const errorMessage = (error) => {
//         console.log(error);
//     };
//     return (
//         <div>
//             <h2>React Google Login</h2>
//             <br />
//             <br />
//             <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
//         </div>
//     )
// }
// export default App;

/*App.js*/

import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function App() {
    const [ user, setUser ] = useState([]);
    const [ profile, setProfile ] = useState([]);
    const [ goal, setGoal ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ duration, setDuration] = useState('');
    const [ timeOfDay, setTimeOfDay ] = useState('');
    const [ recurrance, setRecurrance ] = useState('');

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:', error)
    });

    useEffect(
        () => {
            if (user) {
                axios
                    .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: 'application/json'
                        }
                    })
                    .then((res) => {
                        setProfile(res.data);
                    })
                    .catch((err) => console.log(err));
            }
        },
        [ user ]
    );

    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

    const handleSubmit = (e) => {
      e.preventDefault()
      console.log(user, profile, goal, description, duration, timeOfDay, recurrance)
    }

    async function inserisciTurni(goal, description, duration) {
        console.log(user.access_token);
        var accessToken = user.access_token; // Please set your access token.
        var calendarioselezionato = "primary" // Please set your calendar ID.
      
        var evento = {
          "summary": goal,
        //   "summary": "hello",
          "description": description,
        //   "description": "desc",
          "start": {
            "dateTime": "2024-02-18T09:00:00-07:00",
          },
          "end": {
            "dateTime": "2024-02-18T17:00:00-07:00",
          },
        //   "recurrence": [
        //     'RRULE:FREQ=WEEKLY;COUNT=2'
        //   ]
        };
        // var res = await axios.post(
        //   `https://www.googleapis.com/calendar/v3/calendars/${calendarioselezionato}/events`,
        //   JSON.stringify(evento),
        //   {headers: {authorization: `Bearer ${accessToken}`, "Content-Type": "application/json"}}
        // );
        // console.log(res.data);
        console.log("printing events this week")
        findAvailableTimeSlots()
        // getEventsForWeek()
      }

    async function getEventsForWeek() {
        const today = new Date();
        console.log("TODAY: " + today)
        const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        console.log("EOW: " + endOfWeek)
        
        var accessToken = user.access_token
        var calendarId = "primary"
        const response = await axios.get(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?singleEvents=true`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              timeMin: today,
              timeMax: endOfWeek,
            },
            orderBy: "startTime",
            singleEvents: true
          }
        );
        
        // return response.data.items || [];
        console.log(response)
        console.log(response.data.items)
        return response.data.items
      }

      async function findAvailableTimeSlots() {
        const accessToken = user.access_token;
        const calendarId = "primary";
        const events = await getEventsForWeek(calendarId, accessToken);
        const availableTimeSlots = [];
      
        // Sort events by start time
        events.sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));
        console.log("SIZE OF EVENTS " + events.length)
      
        let previousEndTime = new Date();
        previousEndTime.setHours(6, 0, 0, 0);
      
        for (const event of events) {
          const currDate = new Date(event.start.dateTime)
          if (currDate.getDate() != previousEndTime.getDate()) { // new date, new slots
            previousEndTime = currDate;
            previousEndTime.setHours(6, 0, 0, 0);
          }
          console.log("current date " + currDate)
          console.log("previous end time " + previousEndTime)
        
          const eventStartTime = new Date(event.start.dateTime);
          const eventEndTime = new Date(event.end.dateTime);

          console.log("eventStartTime:" + eventStartTime)
          console.log("previousEndTime:" + previousEndTime)
      
          // Check if there's a gap between the previous event and the current one
           // add as a viable slot only if after 8  && eventStartTime.getHours() >= 8
            if (eventStartTime.getHours() > 8 && previousEndTime.getHours() < 8) {
                let adj = new Date()
                adj.setHours(8, 0, 0, 0)
                availableTimeSlots.push( {start: previousEndTime, end: adj})
                previousEndTime.setHours(8, 0, 0, 0)
            } if (eventStartTime.getHours() > 12 && previousEndTime.getHours() < 12) {
                let adj = new Date()
                adj.setHours(12, 0, 0, 0)
                availableTimeSlots.push( {start: previousEndTime, end: adj})
                previousEndTime.setHours(12, 0, 0, 0)
            } if (eventStartTime.getHours() > 18 && previousEndTime.getHours() < 18) {
                let adj = new Date()
                adj.setHours(18, 0, 0, 0)
                availableTimeSlots.push( {start: previousEndTime, end: adj})
                previousEndTime.setHours(18, 0, 0, 0)
            } if (eventStartTime > previousEndTime) {
                availableTimeSlots.push( {start: previousEndTime, end: eventStartTime})
                previousEndTime = new Date(eventEndTime);
            }
            console.log("SLOT FOUND")
      
        //   const eventEndTime = new Date(event.end.dateTime);
        //   if (eventEndTime > previousEndTime) {
        //     previousEndTime = eventEndTime;
        //   }
          console.log("AT END " + previousEndTime)
        }
      
        // Check if there's a gap after the last event until the end of the week
        const endOf7Days = new Date(previousEndTime.getTime() + 7);
        // const remainingDuration = endOf7Days - previousEndTime;
      
        // Round previousEndTime up to the next clean time block
        // const nextCleanTimeBlock = Math.ceil(previousEndTime.getTime() / cleanTimeBlockDuration) * cleanTimeBlockDuration;
        // previousEndTime = new Date(nextCleanTimeBlock);
      
        // Check if the remaining duration is large enough for a clean time block
        if (endOf7Days > previousEndTime) {
          availableTimeSlots.push({ start: previousEndTime, end: endOf7Days });
        }
      
        // console.log('Available Time Slots:');
        // availableTimeSlots.forEach(slot => {
        //   console.log(`${slot.start} - ${slot.end}`);
        // });
        console.log(availableTimeSlots)
      
        return availableTimeSlots;
      }
      
      
      

    return (
        <div>
            <h2>React Google Login</h2>
            <br />
            <br />
            {profile ? (
              <div>
                <form onSubmit={handleSubmit}>
                  <img src={profile.picture} alt="user image" />
                  <h3>User Logged in</h3>
                  <p>Name: {profile.name}</p>
                  <p>Email Address: {profile.email}</p>
                  <button onClick={logOut}>Log out</button>
                  <br />
                  <br />
                  <label>
                      Goal Name:
                      <input type="text" name="goalName" value={goal} onChange={e => setGoal(e.target.value)} />
                  </label>
                  <br />
                  <label>
                      Description:
                      <input type="text" name="description" value={description} onChange={e => setDescription(e.target.value)} />
                  </label>
                  <br />
                  <label>
                      Duration:
                      <input type="number" name="duration" value={duration} onChange={e => setDuration(e.target.value)} />
                  </label>
                  <br />
                  <label>
                      Time of day:
                      <select name="timeOfDayType" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)}>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="night">Night</option>
                      </select>
                  </label>
                  <br />
                  <label>
                      Recurrence per week:
                      <input type="number" name="recurrencePerWeek" value={recurrance} onChange={e => setRecurrance(e.target.value)} />
                  </label>
                  <br />
                  <br />
                  <button type='submit' onClick={() => inserisciTurni(goal, description)}>Create goal</button>
                </form>
              </div>
            ) : (
                <button onClick={() => login()}>Sign in with Google 🚀 </button>
            )}
        </div>
    );
}
export default App;