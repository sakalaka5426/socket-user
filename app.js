var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
const PORT = process.env.PORT || 3000;

db.get('location').remove().write();
db.defaults({ location: []})
  .write();
app.get('/', (req, res) => {
  res.send('LeNgocKhanh');
});

io.on('connection', (socket) => {
    console.log('User connected');
    let idDevice = socket.id;
    const collection = db.get('location');
    socket.on('location', (msg) => {
        msg.id = idDevice;
        let loca = db.get('location')
                     .find({id: idDevice})
                     .value();
        if (typeof loca === 'undefined') {
          collection.push(msg).write();
        } else {
          collection.find({id: idDevice})
          .assign({lat: msg.lat, long: msg.long})
          .write();
        }
        io.emit('location', collection.value());
      });
    socket.on('disconnect', () => {
      console.log('User disconnected');
      collection.remove({ id: idDevice })
                .write()
      io.emit('location', collection.value());
    });
  });

http.listen(PORT, () => {
  console.log('listening on *:'+PORT);
});