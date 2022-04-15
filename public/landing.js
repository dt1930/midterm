window.addEventListener('load', () => {
    let joinForm = document.getElementById('join-form');
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault(); //preventing the default behavior of the form's submit button
      let name = document.getElementById('name-input').value;
      let room = document.getElementById('room-input').value;
      //save the name and the room in session storage
      sessionStorage.setItem('name',name);
      sessionStorage.setItem('room',room);
      //redirect the user to game.html (a different page)
      window.location='/game.html';
    })
  })

