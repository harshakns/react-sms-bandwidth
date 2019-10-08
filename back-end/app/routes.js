const Message = require("./models/Message");
const User = require("./models/User");
const io = require("socket.io")();
const socketport = 8000;

module.exports = function(app) {
  app.post("/api/userchk", function(req, res) {
    User.findOne(
      {
        email: req.body.email
      },
      function(err, result) {
        if (!result) {
          const userData = {
            email: req.body.email
          };
          User.create(userData, function(err1, res1) {
            if (err1) {
              return;
            } else {
              res.send([]);
            }
          });
        } else {
          res.send(result);
        }
      }
    );
  });
  app.post("/callback", function(req, res) {
    let callback = req.body[0];
    console.log("callback===>", callback);
    if (callback && callback.type === "message-received") {
      let message = callback.message;
      Message.findOne(
        {
          message_id: message.id
        },
        function(err, result) {
          if (!result) {
            const msgData = {
              from_number: message.from,
              to_number: callback.to,
              text: message.text,
              direction: "in",
              message_id: message.id
            };
            Message.create(msgData, function(err1, res1) {
              if (res1) {
                let data = {
                  state: "success",
                  fromNumber: res1.from_number,
                  toNumber: res1.to_number
                };
                io.emit("incomMessage", data);
              }
            });
          }
        }
      );
    }
  });
  app.post("/api/sendmessage", function(req, res) {
    const { from_number, to_number, text } = req.body.sendMsgData;
    Message.create(req.body.sendMsgData, function(err, resu) {
      if (err) {
        res.send(err);
      } else {
        Message.find(
          {
            $or: [
              { from_number: from_number, to_number: to_number },
              { from_number: to_number, to_number: from_number }
            ]
          },
          null,
          { sort: { field: "asc" } },
          function(err, result) {
            if (err) {
              console.log(err);
            } else {
              res.send(result);
            }
          }
        );
      }
    });
  });
  app.post("/api/getmessages", function(req, res) {
    const { from_number, to_number, state } = req.body.msgData;
    if (state) {
      Message.find(
        {
          $or: [{ to_number: to_number }, { from_number: to_number }]
        },
        null,
        { sort: { field: "asc" } },
        function(err, result) {
          if (err) {
            console.log(err);
          } else {
            res.send(result);
          }
        }
      );
    } else {
      Message.find(
        {
          $or: [
            { from_number: from_number, to_number: to_number },
            { from_number: to_number, to_number: from_number }
          ]
        },
        null,
        { sort: { field: "asc" } },
        function(err, result) {
          if (err) {
            console.log(err);
          } else {
            res.send(result);
          }
        }
      );
    }
  });
  app.post("/api/getnumbers", function(req, res) {
    const { fromNumber, mainNums } = req.body;
    const array = [];
    if (mainNums) {
      mainNums.forEach(num => {
        if (num !== "0") {
          array.push({ memberNum: num });
        }
      });
    }
    Message.find(
      { $or: [{ from_number: fromNumber }, { to_number: fromNumber }] },
      { from_number: 1, to_number: 1, _id: 0 },
      { sort: { field: "asc" } },
      function(err, result) {
        if (err) {
          console.log(err);
        } else {
          result &&
            result.map(res => {
              if (res.from_number === fromNumber) {
                array.push({ memberNum: res.to_number });
              }
              if (res.to_number === fromNumber) {
                array.push({ memberNum: res.from_number });
              }
            });

          const arr = array.filter(
            (v, i, a) => a.findIndex(t => t.memberNum === v.memberNum) === i
          );
          res.send(arr);
        }
      }
    );
  });
  app.post("/api/saveusernumber", function(req, res) {
    User.updateOne(
      {
        email: req.body.email
      },
      { $set: { phoneNumber: req.body.phoneNumber } },
      function(err, result) {
        if (err) {
          return err;
        }
      }
    );
  });
  io.listen(socketport);
  // application -------------------------------------------------------------
  app.get("*", function(req, res) {
    res.sendFile(__dirname + "/public/index.html"); // load the single view file (angular will handle the page changes on the front-end)
  });
};