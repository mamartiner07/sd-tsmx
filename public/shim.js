
/* shim.js
   Emula la API de google.script.run para que tu index.html funcione sin cambios visibles.
   Soporta: withSuccessHandler, withFailureHandler, y métodos:
     - getSessionInfo()
     - getOccupiedVacationDates()
     - submitVacation(payload)
     - submitShiftSwap(payload)
     - submitTardiness(payload)
     - listMyRequests(limit)
     - saveFeedback(payload)
*/
(function () {
  function makeRunner() {
    const ctx = { onOk: null, onErr: null };
    const runner = {
      withSuccessHandler(fn){ ctx.onOk = fn; return runner; },
      withFailureHandler(fn){ ctx.onErr = fn; return runner; },

      // Métodos "Apps Script" -> REST
      getSessionInfo(){
        fetch('/api/session')
          .then(r => r.json()).then(d => ctx.onOk && ctx.onOk(d))
          .catch(e => ctx.onErr && ctx.onErr(e));
        return runner;
      },
      getOccupiedVacationDates(){
        fetch('/api/vacations/occupied')
          .then(r => r.json()).then(d => ctx.onOk && ctx.onOk(d))
          .catch(e => ctx.onErr && ctx.onErr(e));
        return runner;
      },
      submitVacation(payload){
        fetch('/api/vacations', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload || {})})
          .then(r => r.json()).then(d => ctx.onOk && ctx.onOk(d))
          .catch(e => ctx.onErr && ctx.onErr(e));
        return runner;
      },
      submitShiftSwap(payload){
        fetch('/api/shifts', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload || {})})
          .then(r => r.json()).then(d => ctx.onOk && ctx.onOk(d))
          .catch(e => ctx.onErr && ctx.onErr(e));
        return runner;
      },
      submitTardiness(payload){
        fetch('/api/tardiness', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload || {})})
          .then(r => r.json()).then(d => ctx.onOk && ctx.onOk(d))
          .catch(e => ctx.onErr && ctx.onErr(e));
        return runner;
      },
      listMyRequests(limit){
        // En el index original se llama listMyRequests(100) sin email;
        // el backend acepta ?email= opcional; lo dejamos vacío por compat.
        fetch('/api/requests')
          .then(r => r.json()).then(d => ctx.onOk && ctx.onOk(d))
          .catch(e => ctx.onErr && ctx.onErr(e));
        return runner;
      },
      saveFeedback(payload){
        fetch('/api/feedback', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload || {})})
          .then(r => r.json()).then(d => ctx.onOk && ctx.onOk(d))
          .catch(e => ctx.onErr && ctx.onErr(e));
        return runner;
      },
    };
    return runner;
  }

  // Exponer google.script.run
  window.google = window.google || {};
  window.google.script = window.google.script || {};
  Object.defineProperty(window.google.script, 'run', {
    get: function(){ return makeRunner(); }
  });
})();
